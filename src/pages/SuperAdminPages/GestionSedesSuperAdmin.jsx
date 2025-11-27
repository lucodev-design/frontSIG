// src/pages/SuperAdminPages/GestionSedes.jsx
import React, { useEffect, useState } from "react";
import { Button, Form, Modal, Alert } from "react-bootstrap";
import { getSedes, createSede, updateSede, deleteSede } from "../../api/api";

export default function GestionSedes() {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    id_sede: null,
    nombre: "",
    direccion: "",
  });

  // Cargar sedes al inicio
  useEffect(() => {
    fetchSedes();
  }, []);

  useEffect(() => {
    if (mensaje || error) {
      const t = setTimeout(() => {
        setMensaje("");
        setError("");
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [mensaje, error]);

  const fetchSedes = async () => {
    try {
      const res = await getSedes();
      setSedes(Array.isArray(res.data) ? res.data : res);
    } catch {
      setError("No se pudieron cargar las sedes");
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleOpenModalCrear = () => {
    setFormData({ id_sede: null, nombre: "", direccion: "" });
    setShowModal(true);
  };

  const handleOpenModalEditar = (sede) => {
    setFormData({
      id_sede: sede.id_sede,
      nombre: sede.nombre,
      direccion: sede.direccion,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");
    setError("");

    try {
      let res;

      if (formData.id_sede === null) {
        // Crear
        res = await createSede({
          nombre: formData.nombre,
          direccion: formData.direccion,
        });
      } else {
        // Editar
        res = await updateSede(formData.id_sede, {
          nombre: formData.nombre,
          direccion: formData.direccion,
        });
      }

      if (res.success) {
        setMensaje("Operación realizada correctamente");
        fetchSedes();
        setShowModal(false);
      } else {
        setError(res.message || "Error al procesar la solicitud");
      }
    } catch (err) {
      console.error(err);
      setError("Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id_sede) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta sede?")) return;

    try {
      const res = await deleteSede(id_sede);
      if (res.success) {
        setMensaje("Sede eliminada correctamente");
        fetchSedes();
      } else {
        setError("No se pudo eliminar");
      }
    } catch {
      setError("Error al eliminar la sede");
    }
  };

  return (
    <div className="card p-4 shadow-lg">
      <h3 className="fw-bold mb-3 text-primary">Gestión de Sedes</h3>

      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="d-flex justify-content-end mb-3">
        <Button onClick={handleOpenModalCrear} className="fw-semibold">
          + Nueva Sede
        </Button>
      </div>

      {/* TABLA */}
      <table className="table table-striped table-bordered">
        <thead className="table-primary">
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Dirección</th>
            <th style={{ width: "150px" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sedes.length > 0 ? (
            sedes.map((s, i) => (
              <tr key={s.id_sede}>
                <td>{i + 1}</td>
                <td>{s.nombre}</td>
                <td>{s.direccion}</td>
                <td>
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => handleOpenModalEditar(s)}
                    className="me-2"
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(s.id_sede)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No hay sedes registradas
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {formData.id_sede ? "Editar Sede" : "Registrar Nueva Sede"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de la Sede</Form.Label>
              <Form.Control
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button type="submit" className="w-100" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
