// src/components/Admin/ListUser.jsx
import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import {
  getUsers,
  deleteUser,
  getSedes,
  getRoles,
  updateUser,
} from "../../api/api";
import { Button, Modal, Form, Alert } from "react-bootstrap";

export default function ListUser() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [sedes, setSedes] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedSede, setSelectedSede] = useState("");

  // QR modal
  const [showQR, setShowQR] = useState(false);
  const [qrSelected, setQrSelected] = useState("");

  // Edit modal
  const [showEdit, setShowEdit] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Mensajes
  const [message, setMessage] = useState(null);

  // Cargar sedes + roles primero, luego usuarios (para poder mapear sede_id / rol_id)
  useEffect(() => {
    const init = async () => {
      try {
        const [sedesData, rolesData] = await Promise.all([getSedes(), getRoles()]);
        setSedes(sedesData || []);
        setRoles(rolesData || []);
        await fetchUsers(sedesData || [], rolesData || []);
      } catch (err) {
        console.error("❌ Error inicializando datos:", err);
        showTempMessage("❌ Error cargando datos iniciales", "danger");
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetchUsers: mapea cada usuario para asegurar que tenga sede_id y rol_id (como strings)
  const fetchUsers = async (sedesArg, rolesArg) => {
    try {
      const sedesToUse = sedesArg || sedes;
      const rolesToUse = rolesArg || roles;

      const data = await getUsers(); // data desde backend
      const mapped = (data || []).map((u) => {
        const userSedeName = (u.sede || "").toString().trim().toLowerCase();
        const userRolName = (u.rol || "").toString().trim().toLowerCase();

        const sedeMatch =
          sedesToUse.find((s) => {
            if (s.id_sede && String(s.id_sede) === String(u.sede_id)) return true;
            return (s.nombre || "").toString().trim().toLowerCase() === userSedeName;
          }) || null;

        const rolMatch =
          rolesToUse.find((r) => {
            if (r.id_rol && String(r.id_rol) === String(u.rol_id)) return true;
            return (r.nombre || "").toString().trim().toLowerCase() === userRolName;
          }) || null;

        return {
          ...u,
          // guardamos como strings para evitar problemas con value del <select>
          sede_id: sedeMatch ? String(sedeMatch.id_sede) : (u.sede_id ? String(u.sede_id) : ""),
          rol_id: rolMatch ? String(rolMatch.id_rol) : (u.rol_id ? String(u.rol_id) : ""),
        };
      });

      setUsers(mapped);
      setFilteredUsers(mapped);
    } catch (err) {
      console.error("❌ Error cargando usuarios:", err);
      showTempMessage("❌ Error cargando usuarios", "danger");
    }
  };

  // Filtrar por buscador y sede
  useEffect(() => {
    let result = users;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          (u.nombre || "").toLowerCase().includes(q) ||
          (u.apellidos || "").toLowerCase().includes(q) ||
          (u.dni || "").includes(search) ||
          (u.sede || "").toLowerCase().includes(q) ||
          (u.rol || "").toLowerCase().includes(q)
      );
    }

    if (selectedSede) {
      result = result.filter(
        (u) =>
          String(u.sede_id) === String(selectedSede) || // comparar por id (string)
          (u.sede || "").toLowerCase() ===
            (sedes.find((s) => String(s.id_sede) === String(selectedSede))?.nombre || "").toLowerCase() // fallback por nombre
      );
    }

    setFilteredUsers(result);
  }, [search, selectedSede, users, sedes]);

  // Eliminar usuario
  const handleDelete = async (id_usuario) => {
    if (!window.confirm("¿Seguro que quieres eliminar este usuario?")) return;
    try {
      await deleteUser(id_usuario);
      await fetchUsers(); // refrescar (usa sedes/roles ya en estado)
      showTempMessage("✅ Usuario eliminado correctamente", "success");
    } catch (err) {
      console.error("❌ Error eliminando usuario:", err);
      showTempMessage("❌ Error al eliminar usuario", "danger");
    }
  };

  // QR
  const handleShowQR = (qrCode) => {
    setQrSelected(qrCode);
    setShowQR(true);
  };

  // Editar: abrimos modal y precargamos todos los campos; solo sede será editable si quieres
  const handleEdit = (user) => {
    // aseguramos que rol_id y sede_id sean strings (ya mapeados por fetchUsers), si no, tratamos de encontrar coincidencia
    const sedeMatch = sedes.find(
      (s) =>
        String(s.id_sede) === String(user.sede_id) ||
        (s.nombre || "").toLowerCase() === (user.sede || "").toLowerCase()
    );
    const rolMatch = roles.find(
      (r) =>
        String(r.id_rol) === String(user.rol_id) ||
        (r.nombre || "").toLowerCase() === (user.rol || "").toLowerCase()
    );

    setEditingUser({
      id_usuario: user.id_usuario,
      nombre: user.nombre || "",
      apellidos: user.apellidos || "",
      dni: user.dni || "",
      email: user.email || "",
      rol: user.rol || (rolMatch ? rolMatch.nombre : ""),
      rol_id: user.rol_id ? String(user.rol_id) : (rolMatch ? String(rolMatch.id_rol) : ""),
      sede_id: user.sede_id ? String(user.sede_id) : (sedeMatch ? String(sedeMatch.id_sede) : ""),
    });
    setShowEdit(true);
  };

  // Guardar cambios: enviar solo los campos que tu backend espera; convertimos id a number
  const handleUpdate = async () => {
    try {
      if (!editingUser) return;
      const payload = {
        nombre: editingUser.nombre,
        apellidos: editingUser.apellidos,
        dni: editingUser.dni,
        email: editingUser.email,
        rol_id: editingUser.rol_id ? parseInt(editingUser.rol_id) : null,
        sede_id: editingUser.sede_id ? parseInt(editingUser.sede_id) : null,
      };

      const res = await updateUser(editingUser.id_usuario, payload);

      if (res && res.message === "Usuario actualizado correctamente") {
        showTempMessage("✅ Cambios guardados correctamente", "success");
      } else if (res && res.message === "No se realizaron cambios") {
        showTempMessage("⚠️ No se realizaron cambios", "warning");
      } else {
        showTempMessage("❌ Error al actualizar usuario", "danger");
      }

      setShowEdit(false);
      await fetchUsers(); // refrescar
    } catch (err) {
      console.error("❌ Error actualizando usuario:", err);
      showTempMessage("❌ Error al actualizar usuario", "danger");
    }
  };

  // Mensaje temporal helper
  const showTempMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // Columnas
  const columns = [
    { name: "Nombre", selector: (row) => row.nombre, sortable: true },
    { name: "Apellidos", selector: (row) => row.apellidos, sortable: true },
    { name: "DNI", selector: (row) => row.dni },
    { name: "Correo", selector: (row) => row.email },
    { name: "Rol", selector: (row) => row.rol },
    { name: "Sede", selector: (row) => row.sede },
    {
      name: "QR",
      cell: (row) => (
        <Button
          variant="light"
          onClick={() => handleShowQR(row.qr_code)}
          style={{ border: "none", background: "transparent" }}
        >
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${row.qr_code}`}
            alt="QR"
          />
        </Button>
      ),
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div className="d-flex gap-2">
          <Button variant="warning" size="sm" onClick={() => handleEdit(row)}>
            ✏️
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(row.id_usuario)}>
            🗑️
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mt-4 bg-white p-3 rounded shadow-sm">
      {/* Botón Asistencia */}
      <button
        onClick={() => (window.location.href = "/add-user")}
        className="btn btn-primary btn-volver mb-3"
      >
        Volver
      </button>

      <h2 className="mb-3">📋 Lista de Usuarios</h2>

      {message && <Alert variant={message.type}>{message.text}</Alert>}

      <div className="d-flex justify-content-between mb-3">
        <select
          className="form-select w-25"
          value={selectedSede}
          onChange={(e) => setSelectedSede(e.target.value)}
        >
          <option value="">Todas las sedes</option>
          {sedes.map((s) => (
            <option key={s.id_sede} value={String(s.id_sede)}>
              {s.nombre}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Buscar por nombre, apellido, DNI, sede o rol"
          className="form-control w-50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredUsers}
        pagination
        highlightOnHover
        striped
        responsive
      />

      {/* QR Modal */}
      <Modal show={showQR} onHide={() => setShowQR(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>🔗 Código QR</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {qrSelected && (
            <>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrSelected}`}
                alt="QR Grande"
              />
              <div className="mt-3">
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrSelected}`}
                  download={`qr_${qrSelected}.png`}
                  className="btn btn-primary"
                >
                  ⬇️ Descargar QR
                </a>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Edit Modal (precargado) */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>✏️ Editar Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingUser && (
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Nombre</Form.Label>
                <Form.Control type="text" value={editingUser.nombre} readOnly />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Apellidos</Form.Label>
                <Form.Control type="text" value={editingUser.apellidos} readOnly />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>DNI</Form.Label>
                <Form.Control type="text" value={editingUser.dni} readOnly />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Correo</Form.Label>
                <Form.Control type="email" value={editingUser.email} readOnly />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Rol</Form.Label>
                <Form.Control type="text" value={editingUser.rol} readOnly />
              </Form.Group>

              <Form.Group>
                <Form.Label>Sede</Form.Label>
                <Form.Select
                  value={editingUser.sede_id}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, sede_id: e.target.value })
                  }
                >
                  <option value="">Seleccionar sede</option>
                  {sedes.map((s) => (
                    <option key={s.id_sede} value={String(s.id_sede)}>
                      {s.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            💾 Guardar cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
