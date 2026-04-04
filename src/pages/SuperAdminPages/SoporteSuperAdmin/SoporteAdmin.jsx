import React, { useEffect, useMemo, useState } from "react";
import {  Card,  Table,  Badge,  Button,  Spinner,  Form,  InputGroup,  Modal,  Row,  Col,} from "react-bootstrap";
import { getSoportes, updateSoporte, deleteSoporte } from "../../../api/api";

// ✅ Función auxiliar para formatear fechas
const formatearFecha = (fecha) =>
  new Date(fecha).toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const SoporteAdmin = () => {
  const [soportes, setSoportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [showModal, setShowModal] = useState(false);
  const [soporteSeleccionado, setSoporteSeleccionado] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState(null);
  const [loadingEliminar, setLoadingEliminar] = useState(false);

  const cargarSoportes = async () => {
    try {
      setLoading(true);
      const data = await getSoportes();
      setSoportes(data);
    } catch (error) {
      console.error("Error cargando soportes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSoportes();
    const handleNuevoSoporte = () => cargarSoportes();
    window.addEventListener("nuevo_soporte", handleNuevoSoporte);
    return () =>
      window.removeEventListener("nuevo_soporte", handleNuevoSoporte);
  }, []);

  const cambiarEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === "pendiente" ? "atendido" : "pendiente";
    try {
      await updateSoporte(id, nuevoEstado);
      setSoportes((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, estado: nuevoEstado } : item,
        ),
      );
    } catch (error) {
      console.error("Error actualizando estado:", error);
    }
  };

  const confirmarEliminar = (id) => {
    setIdAEliminar(id);
    setShowConfirm(true);
  };

  const handleEliminar = async () => {
    setLoadingEliminar(true);
    const res = await deleteSoporte(idAEliminar);
    if (res.success) {
      setSoportes((prev) => prev.filter((item) => item.id !== idAEliminar));
    } else {
      alert(res.error || "Error al eliminar");
    }
    setLoadingEliminar(false);
    setShowConfirm(false);
    setIdAEliminar(null);
  };

  const total = soportes.length;
  const pendientes = soportes.filter((s) => s.estado === "pendiente").length;
  const atendidos = soportes.filter((s) => s.estado === "atendido").length;

  const soportesFiltrados = useMemo(() => {
    return soportes
      .filter((item) =>
        item.email.toLowerCase().includes(busqueda.toLowerCase()),
      )
      .filter((item) =>
        estadoFiltro === "todos" ? true : item.estado === estadoFiltro,
      );
  }, [soportes, busqueda, estadoFiltro]);

  const abrirModal = (item) => {
    setSoporteSeleccionado(item);
    setShowModal(true);
  };
  const cerrarModal = () => {
    setShowModal(false);
    setSoporteSeleccionado(null);
  };

  return (
    <div className="p-4">
      <Row className="gx-2 gy-3 mb-4">

  {/* TOTAL */}
  <Col xs="4" sm="4" md="4" lg="4" className="d-flex">
    <Card className="flex-fill text-center p-2">
      <h6 className="mb-1">Total</h6>
      <h4 className="mb-0">{total}</h4>
    </Card>
  </Col>

  {/* PENDIENTES */}
  <Col xs="4" sm="4" md="4" lg="4" className="d-flex">
    <Card className="flex-fill text-center p-2 border-warning">
      <h6 className="mb-1">Pendientes</h6>
      <h4 className="text-warning mb-0">{pendientes}</h4>
    </Card>
  </Col>

  {/* ATENDIDOS */}
  <Col xs="4" sm="4" md="4" lg="4" className="d-flex">
    <Card className="flex-fill text-center p-2 border-success">
      <h6 className="mb-1">Atendidos</h6>
      <h4 className="text-success mb-0">{atendidos}</h4>
    </Card>
  </Col>

</Row>

      <Card className="shadow-lg border-0 p-3 mt-2" style={{ borderRadius: "15px" }}>
        <Card.Body className="p-1">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold m-0">
              <i className="bi bi-chat-right-dots"></i> Mensajes de Soporte
            </h4>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={cargarSoportes}
            >
              <i className="bi bi-arrow-repeat"></i> Actualizar
            </Button>
          </div>

          <div className="d-flex gap-2 mb-3 flex-wrap">
            <InputGroup style={{ maxWidth: "300px" }}>
              <Form.Control
                placeholder="Buscar por correo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </InputGroup>
            <Form.Select
              style={{ maxWidth: "200px" }}
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendientes</option>
              <option value="atendido">Atendidos</option>
            </Form.Select>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Correo</th>
                    <th>Mensaje</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {soportesFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        No hay resultados
                      </td>
                    </tr>
                  ) : (
                    soportesFiltrados.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td>{item.email}</td>
                        <td style={{ maxWidth: "250px" }}>
                          <div
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              cursor: "pointer",
                            }}
                            onClick={() => abrirModal(item)}
                          >
                            {item.mensaje}
                          </div>
                        </td>
                        {/* Fecha formateada en la tabla */}
                        <td>{formatearFecha(item.fecha)}</td>
                        <td>
                          <Badge
                            bg={
                              item.estado === "pendiente"
                                ? "warning"
                                : "success"
                            }
                          >
                            {item.estado}
                          </Badge>
                        </td>
                        <td className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant={
                              item.estado === "pendiente"
                                ? "outline-success"
                                : "outline-secondary"
                            }
                            onClick={() => cambiarEstado(item.id, item.estado)}
                          >
                            {item.estado === "pendiente"
                              ? "Atender"
                              : "Reabrir"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => confirmarEliminar(item.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal detalle mensaje */}
      <Modal show={showModal} onHide={cerrarModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Detalle del mensaje</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {soporteSeleccionado && (
            <>
              <p>
                <strong>Correo:</strong> {soporteSeleccionado.email}
              </p>
              {/* ✅ Fecha formateada en el modal */}
              <p>
                <strong>Fecha:</strong>{" "}
                {formatearFecha(soporteSeleccionado.fecha)}
              </p>
              <hr />
              <p>{soporteSeleccionado.mensaje}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal confirmación eliminar */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>¿Eliminar mensaje?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar
          este mensaje?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirm(false)}
            disabled={loadingEliminar}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleEliminar}
            disabled={loadingEliminar}
          >
            {loadingEliminar ? (
              <Spinner size="sm" animation="border" />
            ) : (
              "Sí, eliminar"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SoporteAdmin;