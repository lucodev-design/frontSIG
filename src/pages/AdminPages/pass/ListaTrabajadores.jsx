// src/pages/ListaTrabajadores.jsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  Alert,
  Card,
  Badge,
} from "react-bootstrap";
import { getUsers, updateUserRemuneracion } from "../../../api/api";
import { FaPlus, FaEdit } from "react-icons/fa";

const ListaTrabajadores = () => {
  const [trabajadores, setTrabajadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [remuneracion, setRemuneracion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarTrabajadores();
  }, []);

  const cargarTrabajadores = async () => {
    setLoading(true);
    try {
      const data = await getUsers();

      // getUsers ya devuelve sede y turno con JOIN — solo filtramos rol_id = 2
      const filtrados = data
        .filter((u) => u.rol_id === 2)
        .sort((a, b) => a.nombre.localeCompare(b.nombre));

      setTrabajadores(filtrados);
    } catch (err) {
      console.error("Error cargando trabajadores:", err);
      setError("No se pudo cargar la lista de trabajadores.");
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (user) => {
    setSelectedUser(user);
    setRemuneracion(
      user.remuneracion !== null && user.remuneracion !== undefined
        ? String(user.remuneracion)
        : "",
    );
    setShowModal(true);
    setError("");
  };

  const cerrarModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setRemuneracion("");
    setError("");
  };

  const guardarRemuneracion = async () => {
    if (remuneracion === "" || Number(remuneracion) < 0) {
      setError("Ingresa un monto válido mayor o igual a 0.");
      return;
    }

    setGuardando(true);
    setError("");

    try {
      await updateUserRemuneracion(
        selectedUser.id_usuario,
        Number(remuneracion),
      );

      // Actualiza directamente en el estado local sin recargar la lista
      setTrabajadores((prev) =>
        prev.map((t) =>
          t.id_usuario === selectedUser.id_usuario
            ? { ...t, remuneracion: Number(remuneracion) }
            : t,
        ),
      );

      setSuccess(true);
      cerrarModal();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error guardando remuneración:", err);
      setError("Ocurrió un error al guardar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Card className="shadow p-3 mt-3">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h4 className="mb-0">Lista de Trabajadores</h4>
        <Badge bg="secondary">{trabajadores.length} registros</Badge>
      </div>

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(false)}>
          ✅ Remuneración actualizada correctamente.
        </Alert>
      )}

      {error && !showModal && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-2 text-muted">Cargando trabajadores...</p>
        </div>
      ) : trabajadores.length === 0 ? (
        <Alert variant="info">No hay trabajadores registrados.</Alert>
      ) : (
        <Table striped bordered hover responsive className="align-middle">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Nombres</th>
              <th>Apellidos</th>
              <th>Sede</th>
              <th>Turno</th>
              <th className="text-center">Remuneración</th>
            </tr>
          </thead>
          <tbody>
            {trabajadores.map((t, index) => (
              <tr key={t.id_usuario}>
                <td className="text-muted">{index + 1}</td>
                <td>{t.nombre}</td>
                <td>{t.apellidos}</td>

                {/* ✅ Campo correcto: "sede" (no sede_nombre) */}
                <td>
                  <Badge bg="info" text="dark">
                    {t.sede ?? "—"}
                  </Badge>
                </td>

                {/* ✅ Campo correcto: "turno" (no turno_nombre) */}
                <td>
                  {t.turno ? (
                    <Badge bg="secondary">{t.turno}</Badge>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>

                <td className="text-center">
                  {t.remuneracion !== null &&
                  t.remuneracion !== undefined &&
                  t.remuneracion !== "" ? (
                    <span className="d-inline-flex align-items-center gap-2">
                      <Badge bg="success" className="fs-6 px-2 py-1">
                        S/. {Number(t.remuneracion).toFixed(2)}
                      </Badge>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => abrirModal(t)}
                        title="Editar remuneración"
                      >
                        <FaEdit />
                      </Button>
                    </span>
                  ) : (
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => abrirModal(t)}
                      title="Agregar remuneración"
                    >
                      <FaPlus className="me-1" /> Agregar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* MODAL AGREGAR / EDITAR REMUNERACIÓN */}
      <Modal show={showModal} onHide={cerrarModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedUser?.remuneracion ? "Editar" : "Agregar"} remuneración —{" "}
            {selectedUser?.nombre} {selectedUser?.apellidos}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedUser?.remuneracion && (
            <Alert variant="info" className="py-2">
              Valor actual:{" "}
              <strong>
                S/. {Number(selectedUser.remuneracion).toFixed(2)}
              </strong>
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Monto (S/.)</Form.Label>
            <Form.Control
              type="number"
              value={remuneracion}
              onChange={(e) => setRemuneracion(e.target.value)}
              min="0"
              step="0.01"
              placeholder="Ej: 1500.00"
              autoFocus
            />
          </Form.Group>

          {error && (
            <Alert variant="danger" className="py-2">
              {error}
            </Alert>
          )}

          <div className="d-flex gap-2">
            <Button
              variant="primary"
              onClick={guardarRemuneracion}
              className="w-100"
              disabled={guardando}
            >
              {guardando ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
            <Button
              variant="outline-secondary"
              onClick={cerrarModal}
              className="w-100"
            >
              Cancelar
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Card>
  );
};

export default ListaTrabajadores;
