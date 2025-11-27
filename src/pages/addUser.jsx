// src/pages/AddUser.jsx
import React, { useState } from "react";
import { registerUser } from "../api/api";
import "../templates/styles/addUser.css";

export default function AddUser() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    dni: "",
    email: "",
    password: "",
    sede: "",
    rol: "trabajador",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await registerUser(formData);
      setMessage("Usuario registrado correctamente");
      setFormData({
        nombre: "",
        apellidos: "",
        dni: "",
        email: "",
        password: "",
        sede: "",
        rol: "trabajador",
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Error al registrar usuario");
    }
    setLoading(false);
  };

  return (
    <div className="add-user-container">
      <h2>Agregar Usuario</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="apellidos"
          placeholder="Apellidos"
          value={formData.apellidos}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="dni"
          placeholder="DNI"
          value={formData.dni}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="sede"
          placeholder="Sede"
          value={formData.sede}
          onChange={handleChange}
          required
        />
        <select name="rol" value={formData.rol} onChange={handleChange}>
          <option value="trabajador">Trabajador</option>
          <option value="admin">Administrador</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Registrar"}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}
