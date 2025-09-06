// src/pages/AddUsuario.jsx
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function AddUsuario() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "trabajador", // por defecto trabajador
  });

  const [mensaje, setMensaje] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setMensaje(data.mensaje || "Usuario registrado correctamente ✅");

      // limpiar formulario
      setFormData({
        nombre: "",
        email: "",
        password: "",
        rol: "trabajador",
      });
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      setMensaje("❌ Error al registrar usuario");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">➕ Agregar Nuevo Usuario/Trabajador</h2>

      <div className="card shadow-lg">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="form-control"
                placeholder="Ingrese nombre completo"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Correo</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                placeholder="ejemplo@email.com"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                placeholder="Ingrese contraseña"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Rol</label>
              <select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                className="form-select"
              >
                <option value="admin">Administrador</option>
                <option value="trabajador">Trabajador</option>
              </select>
            </div>

            <button type="submit" className="btn btn-success w-100">
              Guardar Usuario
            </button>
          </form>

          {mensaje && (
            <div className="alert alert-info text-center mt-3">{mensaje}</div>
          )}
        </div>
      </div>
    </div>
  );
}
