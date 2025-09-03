import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/api"; // 👈 importamos nuestra API

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await loginUser(form); // 👈 aquí usamos api.js

      // Guardar token y user
      localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      // Redirección según rol
      const rol =
        (data.rol || data.role || data.user?.rol || data.user?.role || "").toLowerCase();

      const email = (data.user?.email || form.email || "").toLowerCase();

      if (rol === "trabajador" || rol === "empleado") {
        navigate("/dashboardUser");
      } else if (rol === "admin" || email === "admin@empresa.com") {
        navigate("/dashboardAdmin");
      } else {
        navigate("/dashboardUser");
      }
    } catch (err) {
      alert(err.message || "Error en el login ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "100%", maxWidth: "400px" }}>
        <h2 className="text-center text-primary mb-4">Sistema de Gestión Empresarial</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Correo</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="form-control"
              required
              autoComplete="username"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="form-control"
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
