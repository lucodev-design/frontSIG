// src/pruebaHooks/AggUsuario.jsx
import React, { useState } from "react";
import { registerUser, createRol, createSede } from "../api/api";

function AggUsuario() {
  const [tipoRegistro, setTipoRegistro] = useState("usuario"); // usuario | rol | sede

  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    dni: "",
    email: "",
    password: "",
    rol_id: "",
    sede_id: "",
    rol_nombre: "",
    sede_nombre: "",
    sede_direccion: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      let res;
      if (tipoRegistro === "usuario") {
        res = await registerUser(formData);
      } else if (tipoRegistro === "rol") {
        res = await createRol({ nombre: formData.rol_nombre });
      } else if (tipoRegistro === "sede") {
        res = await createSede({
          nombre: formData.sede_nombre,
          direccion: formData.sede_direccion,
        });
      }

      if (res?.success || res?.user) {
        setMessage("✅ Registro exitoso");
        setFormData({
          nombre: "",
          apellidos: "",
          dni: "",
          email: "",
          password: "",
          rol_id: "",
          sede_id: "",
          rol_nombre: "",
          sede_nombre: "",
          sede_direccion: "",
        });
      } else {
        setMessage("❌ " + (res?.message || "Error al registrar"));
      }
    } catch (err) {
      setMessage("❌ Error en el servidor");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-6 w-96"
      >
        <h2 className="text-xl font-bold mb-4 text-center text-blue-600">
          Registrar {tipoRegistro.charAt(0).toUpperCase() + tipoRegistro.slice(1)}
        </h2>

        {message && (
          <p className={`text-center mb-4 ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}

        {/* Selector de tipo */}
        <select
          value={tipoRegistro}
          onChange={(e) => setTipoRegistro(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded-lg"
        >
          <option value="usuario">Usuario</option>
          <option value="rol">Rol</option>
          <option value="sede">Sede</option>
        </select>

        {/* Formulario dinámico */}
        {tipoRegistro === "usuario" && (
          <>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full mb-3 px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              name="apellidos"
              placeholder="Apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              className="w-full mb-3 px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              name="dni"
              placeholder="DNI"
              value={formData.dni}
              onChange={handleChange}
              className="w-full mb-3 px-3 py-2 border rounded-lg"
            />
            <input
              type="email"
              name="email"
              placeholder="Correo"
              value={formData.email}
              onChange={handleChange}
              className="w-full mb-3 px-3 py-2 border rounded-lg"
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              className="w-full mb-3 px-3 py-2 border rounded-lg"
            />
            <input
              type="number"
              name="rol_id"
              placeholder="Rol ID"
              value={formData.rol_id}
              onChange={handleChange}
              className="w-full mb-3 px-3 py-2 border rounded-lg"
            />
            <input
              type="number"
              name="sede_id"
              placeholder="Sede ID"
              value={formData.sede_id}
              onChange={handleChange}
              className="w-full mb-3 px-3 py-2 border rounded-lg"
            />
          </>
        )}

        {tipoRegistro === "rol" && (
          <input
            type="text"
            name="rol_nombre"
            placeholder="Nombre del Rol"
            value={formData.rol_nombre}
            onChange={handleChange}
            className="w-full mb-3 px-3 py-2 border rounded-lg"
          />
        )}

        {tipoRegistro === "sede" && (
          <>
            <input
              type="text"
              name="sede_nombre"
              placeholder="Nombre de la Sede"
              value={formData.sede_nombre}
              onChange={handleChange}
              className="w-full mb-3 px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              name="sede_direccion"
              placeholder="Dirección"
              value={formData.sede_direccion}
              onChange={handleChange}
              className="w-full mb-3 px-3 py-2 border rounded-lg"
            />
          </>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Registrar
        </button>
      </form>
    </div>
  );
}

export default AggUsuario;
