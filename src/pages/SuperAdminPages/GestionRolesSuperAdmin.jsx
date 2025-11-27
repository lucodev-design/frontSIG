import React, { useEffect, useState } from "react";
import { getRoles, createRol, updateRol, deleteRol } from "../../api/api";
import { Button, Form, Table, Alert, Modal, Spinner } from "react-bootstrap";

export default function GestionRolesSuperAdmin() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [nombreRol, setNombreRol] = useState("");

  const [editarModal, setEditarModal] = useState(false);
  const [rolEditando, setRolEditando] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState("");

  const [mensaje, setMensaje] = useState(null);

  // Cargar roles
  useEffect(() => {
    cargarRoles();
  }, []);

  const cargarRoles = async () => {
    setLoading(true);
    try {
      const res = await getRoles();
      setRoles(res);
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: "danger", texto: "Error al cargar roles." });
    }
    setLoading(false);
  };

  // Crear nuevo rol
  const handleCrearRol = async (e) => {
    e.preventDefault();

    if (!nombreRol.trim())
      return setMensaje({ tipo: "warning", texto: "El nombre del rol es obligatorio." });

    try {
      const res = await createRol({ nombre: nombreRol });

      if (res.success) {
        setMensaje({ tipo: "success", texto: "Rol creado correctamente." });
        setNombreRol("");
        cargarRoles();
      } else {
        setMensaje({ tipo: "danger", texto: res.message });
      }
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: "danger", texto: "Error en el servidor." });
    }
  };

  // Abrir modal de edición
  const abrirModalEditar = (rol) => {
    setRolEditando(rol);
    setNuevoNombre(rol.nombre);
    setEditarModal(true);
  };

  // Guardar edición
  const handleEditarRol = async () => {
    if (!nuevoNombre.trim())
      return setMensaje({ tipo: "warning", texto: "El nombre no puede estar vacío." });

    try {
      const res = await updateRol(rolEditando.id_rol, { nombre: nuevoNombre });

      if (res.success) {
        setMensaje({ tipo: "success", texto: "Rol actualizado correctamente." });
        cargarRoles();
        setEditarModal(false);
      } else {
        setMensaje({ tipo: "danger", texto: res.message });
      }
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: "danger", texto: "Error en el servidor." });
    }
  };

  // Eliminar rol
  const handleEliminarRol = async (id_rol) => {
    if (!window.confirm("¿Seguro que deseas eliminar este rol?")) return;

    try {
      const res = await deleteRol(id_rol);

      if (res.success) {
        setMensaje({ tipo: "success", texto: "Rol eliminado correctamente." });
        cargarRoles();
      } else {
        setMensaje({ tipo: "danger", texto: res.message });
      }
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: "danger", texto: "Error en el servidor." });
    }
  };

  return (
    <div className="card p-4" style={{ background: "#ffffffff", color: "white" }}>
      <h3 className="mb-3" style={{ color: "#1561F0" }}>
        Gestión de Roles
      </h3>

      {mensaje && (
        <Alert
          variant={mensaje.tipo}
          onClose={() => setMensaje(null)}
          dismissible
        >
          {mensaje.texto}
        </Alert>
      )}

      {/* FORMULARIO */}
      <Form onSubmit={handleCrearRol} className="mb-4">
        <Form.Group className="mb-3">
          <Form.Label>Nombre del Rol</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ej: Administrador"
            value={nombreRol}
            onChange={(e) => setNombreRol(e.target.value)}
          />
        </Form.Group>

        <Button type="submit" style={{ background: "#1561F0", border: "none" }}>
          Crear Rol
        </Button>
      </Form>

      {/* TABLA */}
      <div className="table-responsive">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : (
          // <Table striped bordered hover variant="dark"> after
          <Table striped bordered hover variant="">
            <thead>
              <tr>
                <th>ID</th>
                <th>Rol</th>
                <th style={{ width: "180px" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {roles.length > 0 ? (
                roles.map((rol) => (
                  <tr key={rol.id_rol}>
                    <td>{rol.id_rol}</td>
                    <td>{rol.nombre}</td>
                    <td className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => abrirModalEditar(rol)}
                      >
                        Editar
                      </Button>

                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleEliminarRol(rol.id_rol)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">
                    No hay roles registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </div>

      {/* MODAL EDITAR */}
      <Modal show={editarModal} onHide={() => setEditarModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Rol</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nuevo nombre</Form.Label>
            <Form.Control
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditarModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleEditarRol}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
