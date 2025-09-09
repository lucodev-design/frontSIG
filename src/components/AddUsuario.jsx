import React, { useState, useEffect } from "react";
import { registerUser, getUsers } from "../api/api";
import DataTable from "react-data-table-component";

function AddUsuarios() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "trabajador",
  });

  const [mensaje, setMensaje] = useState("");
  const [usuarios, setUsuarios] = useState([]); // lista de trabajadores

  // Cargar usuarios al iniciar
  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const data = await getUsers();
      // Filtrar solo trabajadores
      setUsuarios(data.filter((u) => u.rol === "trabajador"));
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  // Manejo de inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
      await registerUser(formData);
      setMensaje("✅ Usuario registrado correctamente");

      // limpiar formulario
      setFormData({
        nombre: "",
        email: "",
        password: "",
        rol: "trabajador",
      });

      // recargar lista
      cargarUsuarios();
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      setMensaje(`❌ ${error.message}`);
    }
  };

  // Columnas de la tabla
  const columnas = [
    { name: "Nombre", selector: (row) => row.nombre, sortable: true },
    { name: "Correo", selector: (row) => row.email, sortable: true },
    { name: "Rol", selector: (row) => row.rol, sortable: true },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Registrar Trabajador</h2>

      {mensaje && (
        <p
          className={`mb-4 text-sm ${
            mensaje.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {mensaje}
        </p>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          value={formData.nombre}
          onChange={handleChange}
          required
          className="p-2 border rounded"
        />

        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
          className="p-2 border rounded"
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
          className="p-2 border rounded"
        />

        {/* Fijo en trabajador, pero igual lo dejamos en select */}
        <select
          name="rol"
          value={formData.rol}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option value="trabajador">Trabajador</option>
          <option value="admin">Administrador</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Registrar
        </button>
      </form>

      {/* DataTable */}
      <h3 className="text-lg font-semibold mb-2">Lista de Trabajadores</h3>
      <DataTable
        columns={columnas}
        data={usuarios}
        pagination
        highlightOnHover
        striped
        noDataComponent="⚠️ No hay trabajadores registrados"
      />
    </div>
  );
}

export default AddUsuarios;
