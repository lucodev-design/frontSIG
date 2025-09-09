import React, { useState } from "react";

function AddUsuarios() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "trabajador", // valor por defecto
  });
  const [mensaje, setMensaje] = useState("");

  // URL desde variables de entorno
  const API_URL = import.meta.env.VITE_API_URL;

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
      const res = await fetch(`${API_URL}/api/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje("✅ Usuario registrado correctamente");
        setFormData({ nombre: "", email: "", password: "", rol: "trabajador" });
      } else {
        setMensaje(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      setMensaje("⚠️ Error en la conexión con el servidor");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Registrar Usuario</h2>

      {mensaje && <p className="mb-4 text-sm">{mensaje}</p>}

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
