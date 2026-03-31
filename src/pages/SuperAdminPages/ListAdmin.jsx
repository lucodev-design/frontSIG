// src/components/Admin/ListUser.jsx
import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { getUsers, deleteUser, getSedes, getRoles, updateUser } from "../../api/api";
import { Button, Modal, Form, Alert } from "react-bootstrap";

// ✅ Mapa de roles visibles
const ROLES_VISIBLES = { 1: "Admin", 3: "Super Admin" };

export default function ListUser() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [sedes, setSedes] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedSede, setSelectedSede] = useState("");

  const [showQR, setShowQR] = useState(false);
  const [qrSelected, setQrSelected] = useState("");

  const [showEdit, setShowEdit] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [message, setMessage] = useState(null);

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

  const fetchUsers = async (sedesArg, rolesArg) => {
    try {
      const sedesToUse = sedesArg || sedes;
      const rolesToUse = rolesArg || roles;

      const data = await getUsers();
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
          sede_id: sedeMatch ? String(sedeMatch.id_sede) : u.sede_id ? String(u.sede_id) : "",
          rol_id: rolMatch ? String(rolMatch.id_rol) : u.rol_id ? String(u.rol_id) : "",
          qr_code: u.qr_code || u.id_usuario?.toString(),
          turno: u.turno || u.nombre_turno || "Sin turno",
        };
      })
      // ✅ Filtrar solo roles 1 y 3
      .filter((u) => ["1", "3"].includes(String(u.rol_id)));

      setUsers(mapped);
      setFilteredUsers(mapped);
    } catch (err) {
      console.error("❌ Error cargando usuarios:", err);
      showTempMessage("❌ Error cargando usuarios", "danger");
    }
  };

  useEffect(() => {
    let result = users;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          (u.nombre || "").toLowerCase().includes(q) ||
          (u.apellidos || "").toLowerCase().includes(q) ||
          (u.dni || "").includes(search) ||
          (u.turno || "").toLowerCase().includes(q)
      );
    }

    if (selectedSede) {
      result = result.filter(
        (u) =>
          String(u.sede_id) === String(selectedSede) ||
          (u.sede || "").toLowerCase() ===
            (sedes.find((s) => String(s.id_sede) === String(selectedSede))?.nombre || "").toLowerCase()
      );
    }

    setFilteredUsers(result);
  }, [search, selectedSede, users, sedes]);

  const handleDelete = async (id_usuario) => {
    if (!window.confirm("¿Seguro que quieres eliminar este usuario?")) return;
    try {
      await deleteUser(id_usuario);
      await fetchUsers();
      showTempMessage("✅ Usuario eliminado correctamente", "success");
    } catch (err) {
      console.error("❌ Error eliminando usuario:", err);
      showTempMessage("❌ Error al eliminar usuario", "danger");
    }
  };

  const handleShowQR = (qrCode, userId) => {
    const code = qrCode || userId?.toString();
    if (!code) {
      showTempMessage("⚠️ Este usuario no tiene un código QR asignado", "warning");
      return;
    }
    setQrSelected(code);
    setShowQR(true);
  };

  const handleEdit = (user) => {
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
      rol_id: user.rol_id ? String(user.rol_id) : rolMatch ? String(rolMatch.id_rol) : "",
      sede_id: user.sede_id ? String(user.sede_id) : sedeMatch ? String(sedeMatch.id_sede) : "",
      turno: user.turno || "",
    });
    setShowEdit(true);
  };

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
        turno: editingUser.turno,
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
      await fetchUsers();
    } catch (err) {
      console.error("❌ Error actualizando usuario:", err);
      showTempMessage("❌ Error al actualizar usuario", "danger");
    }
  };

  const showTempMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const columns = [
    {
      name: "Nombre",
      selector: (row) => row.nombre,
      sortable: true,
      wrap: true,
    },
    {
      name: "Apellidos",
      selector: (row) => row.apellidos,
      sortable: true,
      wrap: true,
    },
    {
      name: "DNI",
      selector: (row) => row.dni,
      hide: "sm", // ✅ Se oculta en móvil
    },
    {
      name: "Correo",
      selector: (row) => row.email,
      wrap: true,
      hide: "md", // ✅ Se oculta en tablet
    },
    {
      name: "Turno",
      selector: (row) => row.turno || "Sin turno",
      hide: "sm",
    },
    {
      // ✅ Nueva columna Rol
      name: "Rol",
      selector: (row) => ROLES_VISIBLES[parseInt(row.rol_id)] || "—",
      sortable: true,
      cell: (row) => {
        const rolId = parseInt(row.rol_id);
        return (
          <span
            className={`badge ${rolId === 3 ? "bg-danger" : "bg-primary"}`}
            style={{ fontSize: "0.8rem" }}
          >
            {ROLES_VISIBLES[rolId] || "—"}
          </span>
        );
      },
    },
    {
      name: "QR",
      cell: (row) => (
        <Button
          variant="light"
          onClick={() => handleShowQR(row.qr_code, row.id_usuario)}
          style={{ border: "none", background: "transparent" }}
        >
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${row.qr_code || row.id_usuario}`}
            alt="QR"
          />
        </Button>
      ),
      hide: "md",
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div className="d-flex gap-1 flex-wrap">
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
    <div className="container-fluid mt-4 bg-white p-3 rounded shadow-sm">
      <h2 className="mb-3 fs-4">📋 Lista de Administradores</h2>

      {message && <Alert variant={message.type}>{message.text}</Alert>}

      {/* ✅ Filtros responsive */}
      <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-3">
        <select
          className="form-select"
          style={{ maxWidth: "100%", width: "100%" }}
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
          placeholder="Buscar por nombre, apellido, DNI o turno"
          className="form-control"
          style={{ maxWidth: "100%", width: "100%" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-responsive">
        <DataTable
          columns={columns}
          data={filteredUsers}
          pagination
          highlightOnHover
          striped
          responsive
          paginationPerPage={10}
          paginationRowsPerPageOptions={[5, 10, 20]}
          noDataComponent="No hay administradores registrados"
        />
      </div>

      {/* QR Modal */}
      <Modal show={showQR} onHide={() => setShowQR(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>🔗 Código QR</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {qrSelected ? (
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrSelected}`}
              alt="QR Grande"
              className="img-fluid"
            />
          ) : (
            <p>⚠️ No hay código QR disponible</p>
          )}
        </Modal.Body>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>✏️ Editar Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingUser && (
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  value={editingUser.nombre}
                  onChange={(e) => setEditingUser({ ...editingUser, nombre: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Apellidos</Form.Label>
                <Form.Control
                  type="text"
                  value={editingUser.apellidos}
                  onChange={(e) => setEditingUser({ ...editingUser, apellidos: e.target.value })}
                />
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
                <Form.Label>Turno</Form.Label>
                <Form.Control
                  type="text"
                  value={editingUser.turno}
                  onChange={(e) => setEditingUser({ ...editingUser, turno: e.target.value })}
                />
              </Form.Group>

              {/* ✅ Rol solo lectura en el modal */}
              <Form.Group className="mb-2">
                <Form.Label>Rol</Form.Label>
                <Form.Control
                  type="text"
                  value={ROLES_VISIBLES[parseInt(editingUser.rol_id)] || "—"}
                  readOnly
                />
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