import React, { useState } from "react";
import { registerUser } from "../api/api"; // Importamos la función del helper

function AddUsuarios() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "trabajador", // por defecto trabajador
  });

  const [mensaje, setMensaje] = useState("");

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
      await registerUser(formData); // Usamos la función centralizada
      setMensaje("✅ Usuario registrado correctamente");

      // limpiar formulario
      setFormData({
        nombre: "",
        email: "",
        password: "",
        rol: "trabajador",
      });
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      setMensaje(`❌ ${error.message}`);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Registrar Usuario</h2>

      {mensaje && (
        <p
          className={`mb-4 text-sm ${
            mensaje.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {mensaje}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
    </div>
  );
}

export default AddUsuarios;
