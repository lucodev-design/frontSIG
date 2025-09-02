import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error en el login ❌");
        return;
      }

      // Guarda token y (opcional) info de usuario
      localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      // Detecta el rol de forma flexible (según lo que envíe tu backend)
      const rol =
        (data.rol || data.role || data.user?.rol || data.user?.role || "").toLowerCase();

      const email = (data.user?.email || form.email || "").toLowerCase();

      // Reglas de redirección
      if (rol === "trabajador" || rol === "empleado") {
        navigate("/dashboardUser");
      } else if (rol === "admin" || email === "admin@empresa.com") {
        navigate("/dashboardAdmin");
      } else {
        // Si no hay rol claro, mándalo al user por defecto
        navigate("/dashboardUser");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor");
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
