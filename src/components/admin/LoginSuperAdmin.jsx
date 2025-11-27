import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/api.js";
import { Eye, EyeOff } from "lucide-react";
import "../../templates/styles/login.css";

export default function LoginSuperAdmin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await loginUser(form.email, form.password);

      if (!data?.success) {
        alert(data?.message || "❌ Credenciales inválidas");
        return;
      }

      // Guardar token y usuario
      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("rol", data.user.rol_id);
      }

      const rol_id = Number(data.user?.rol_id);

      // SOLO SuperAdmin
      if (rol_id === 3) {
        navigate("/dashboardSuperAdmin");
      } else {
        alert("Solo el SuperAdmin puede acceder aquí");
      }

    } catch (err) {
      console.error("❌ Error en login:", err);
      alert("Error en el servidor durante el login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="principal-content d-flex align-items-center justify-content-center">
      <div className="card shadow p-4" style={{ width: "100%", maxWidth: "400px" }}>
        <h2 className="text-center text-primary mb-4">Regitro S.A.</h2>

        <div className="text-center">
          <img className="img-user-login" src="/Sample_User_Icon.png" alt="user" />
        </div>

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
            <div className="position-relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="form-control"
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
            className="btn btn-primary w-100 btn-pass"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Iniciar Sesión SuperAdmin"}
          </button>
        </form>
      </div>
    </div>
  );
}
