import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/api"; // importamos nuestra API
import { Eye, EyeOff } from "lucide-react"; // importamos iconos
import "../templates/styles/login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // estado para ver/ocultar
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await loginUser(form); //aquí usamos api.js

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
    <div className="d-flex align-items-center justify-content-center vh-100 principal-content">
      {/* Botón Asistencia */}
      <button
        onClick={() => (window.location.href = "/")}
        className="btn btn-primary btn-volver"
      >
        Volver
      </button>
      <div
        className="card shadow p-4"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <h2 className="text-center text-primary mb-4">Sistema de Asistencia</h2>
        <div className="d-flex justify-content-center">
          <img className="img-user-login" src="/Sample_User_Icon.png" alt="" />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="wrapper">
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
          </div>

          {/* Campo de contraseña con ojo */}
          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <div className="wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary  btn-pass"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
