import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Table,
  Badge,
  Button,
  Spinner,
  Form,
  InputGroup,
  Modal,
  Row,
  Col,
} from "react-bootstrap";
import { getSoportes, updateSoporte } from "../../../api/api";

const SoporteAdmin = () => {
  const [soportes, setSoportes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");

  const [showModal, setShowModal] = useState(false);
  const [soporteSeleccionado, setSoporteSeleccionado] = useState(null);

  // 🔔 Notificación simple
  const [ultimoConteo, setUltimoConteo] = useState(0);

  const cargarSoportes = async () => {
    try {
      const data = await getSoportes();
      setSoportes(data);

      // 🔔 Detectar nuevos mensajes
      if (ultimoConteo !== 0 && data.length > ultimoConteo) {
        alert("📩 Nuevo mensaje de soporte recibido");
      }

      setUltimoConteo(data.length);
    } catch (error) {
      console.error("Error cargando soportes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSoportes();

    // 🔔 Polling cada 10 segundos
    const interval = setInterval(() => {
      cargarSoportes();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const cambiarEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === "pendiente" ? "atendido" : "pendiente";

    try {
      await updateSoporte(id, nuevoEstado);

      setSoportes((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, estado: nuevoEstado } : item
        )
      );
    } catch (error) {
      console.error("Error actualizando estado:", error);
    }
  };

  // 📊 Contadores
  const total = soportes.length;
  const pendientes = soportes.filter((s) => s.estado === "pendiente").length;
  const atendidos = soportes.filter((s) => s.estado === "atendido").length;

  const soportesFiltrados = useMemo(() => {
    return soportes
      .filter((item) =>
        item.email.toLowerCase().includes(busqueda.toLowerCase())
      )
      .filter((item) => {
        if (estadoFiltro === "todos") return true;
        return item.estado === estadoFiltro;
      });
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

      {/* 📊 CARDS DE ESTADÍSTICAS */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm text-center p-3">
            <h6>Total</h6>
            <h3>{total}</h3>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm text-center p-3 border-warning">
            <h6>Pendientes</h6>
            <h3 className="text-warning">{pendientes}</h3>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm text-center p-3 border-success">
            <h6>Atendidos</h6>
            <h3 className="text-success">{atendidos}</h3>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-lg border-0" style={{ borderRadius: "15px" }}>
        <Card.Body>
          <h4 className="fw-bold mb-3">📩 Mensajes de Soporte</h4>

          {/* FILTROS */}
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
            <Table hover responsive className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Correo</th>
                  <th>Mensaje</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acción</th>
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

                      <td>{new Date(item.fecha).toLocaleString()}</td>

                      <td>
                        <Badge bg={item.estado === "pendiente" ? "warning" : "success"}>
                          {item.estado}
                        </Badge>
                      </td>

                      <td>
                        <Button
                          size="sm"
                          variant={
                            item.estado === "pendiente"
                              ? "outline-success"
                              : "outline-secondary"
                          }
                          onClick={() => cambiarEstado(item.id, item.estado)}
                        >
                          {item.estado === "pendiente" ? "Atender" : "Reabrir"}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* MODAL */}
      <Modal show={showModal} onHide={cerrarModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Detalle del mensaje</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {soporteSeleccionado && (
            <>
              <p><strong>Correo:</strong> {soporteSeleccionado.email}</p>
              <p><strong>Fecha:</strong> {new Date(soporteSeleccionado.fecha).toLocaleString()}</p>
              <hr />
              <p>{soporteSeleccionado.mensaje}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarModal}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SoporteAdmin;
