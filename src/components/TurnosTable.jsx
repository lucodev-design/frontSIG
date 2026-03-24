// src/components/TurnosTable.jsx
import React, { useEffect, useState } from "react";
import { Table, Button, Alert, Form, Modal } from "react-bootstrap";
import { getTurnos, deleteTurno, createTurno, updateTurno } from "../api/api";

const TurnosTable = () => {
  const [turnos, setTurnos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Para modal de agregar/editar
  const [showModal, setShowModal] = useState(false);
  const [editingTurno, setEditingTurno] = useState(null);
  const [formData, setFormData] = useState({
    nombre_turno: "",
    hora_inicio: "",
    hora_fin: "",
  });

  useEffect(() => {
    fetchTurnosList();
  }, []);

  const fetchTurnosList = async () => {
    try {
      const res = await getTurnos();
      setTurnos(Array.isArray(res.data) ? res.data : res);
    } catch (err) {
      console.error(err);
      setError("❌ Error al cargar los turnos");
    }
  };

  const handleDelete = async (id_turno) => {
    if (!window.confirm("¿Seguro que deseas eliminar este turno?")) return;
    try {
      const res = await deleteTurno(id_turno);
      if (res.success) {
        setMensaje("✅ Turno eliminado correctamente");
        fetchTurnosList();
      } else {
        setError("❌ No se pudo eliminar el turno");
      }
    } catch {
      setError("❌ Error en el servidor al eliminar el turno");
    }
  };

  const handleEdit = (turno) => {
    setEditingTurno(turno);
    setFormData({
      nombre_turno: turno.nombre_turno,
      hora_inicio: turno.hora_inicio,
      hora_fin: turno.hora_fin,
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingTurno(null);
    setFormData({ nombre_turno: "", hora_inicio: "", hora_fin: "" });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");
    setError("");

    try {
      let res;
      if (editingTurno) {
        res = await updateTurno(editingTurno.id_turno, formData);
      } else {
        res = await createTurno(formData);
      }

      if (res.success) {
        setMensaje(editingTurno ? "✅ Turno actualizado" : "✅ Turno agregado");
        fetchTurnosList();
        setShowModal(false);
      } else {
        setError(res.message || "❌ Error al guardar el turno");
      }
    } catch (err) {
      console.error(err);
      setError("❌ Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-3 bg-light rounded-4">
      <h5 className="fw-bold mb-3">📋 Turnos Registrados</h5>

      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Button variant="primary" className="mb-3" onClick={handleAdd}>
        ➕ Nuevo Turno
      </Button>

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead className="table-primary">
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {turnos.length > 0 ? (
              turnos.map((t, i) => (
                <tr key={t.id_turno}>
                  <td>{i + 1}</td>
                  <td>{t.nombre_turno}</td>
                  <td>{t.hora_inicio}</td>
                  <td>{t.hora_fin}</td>
                  <td>
                    <div className="d-flex gap-2 justify-content-center align-items-center bg-transparent">
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => handleEdit(t)}
                      >
                        ✏️
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(t.id_turno)}
                      >
                        🗑️
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No hay turnos registrados
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal Agregar/Editar */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingTurno ? "✏️ Editar Turno" : "➕ Nuevo Turno"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-2">
              <Form.Label>Nombre del Turno</Form.Label>
              <Form.Control
                type="text"
                name="nombre_turno"
                value={formData.nombre_turno}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Hora Inicio</Form.Label>
              <Form.Control
                type="time"
                name="hora_inicio"
                value={formData.hora_inicio}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Hora Fin</Form.Label>
              <Form.Control
                type="time"
                name="hora_fin"
                value={formData.hora_fin}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button
              type="submit"
              variant="primary"
              className="w-100"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TurnosTable;
