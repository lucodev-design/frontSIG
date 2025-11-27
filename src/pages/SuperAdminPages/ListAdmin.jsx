import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { getAdmins, deleteAdmin } from "../../api/api";

export default function ListAdmins() {
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const res = await getAdmins();
      setAdmins(res);
    } catch (error) {
      console.error("Error al cargar administradores:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar administrador?")) {
      try {
        await deleteAdmin(id);
        loadAdmins();
      } catch (error) {
        console.error("Error al eliminar administrador:", error);
        alert("No se pudo eliminar el administrador.");
      }
    }
  };

  const columns = [
    { name: "Nombre", selector: (row) => row.nombre },
    { name: "Apellidos", selector: (row) => row.apellidos },
    { name: "Correo", selector: (row) => row.email }, // ⚡ Cambiado a 'email'
    { name: "Rol", selector: (row) => row.rol },
    { name: "Sede", selector: (row) => row.sede || "Sin sede" },
    {
      name: "Acciones",
      cell: (row) => (
        <button
          className="btn btn-danger btn-sm"
          onClick={() => handleDelete(row.id)}
        >
          Eliminar
        </button>
      ),
    },
  ];

  return (
    <div className="card p-3">
      <h3>Listado de administradores</h3>

      <DataTable columns={columns} data={admins} pagination />
    </div>
  );
}
