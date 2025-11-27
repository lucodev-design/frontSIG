import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/api"; 
import { Eye, EyeOff } from "lucide-react";
import "../templates/styles/login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null); // Nuevo estado para mensajes de error
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage(null); // Limpiar error al escribir
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null); // Limpiar errores anteriores

    try {
      const data = await loginUser(form.email, form.password);

      if (!data?.success) {
        // Reemplazo de alert()
        setErrorMessage(data?.message || "❌ Credenciales inválidas. Verifique su correo y contraseña.");
        return;
      }
      
      // Guardar token
      if (data.token) {
        localStorage.setItem("token", data.token);
      } else {
        setErrorMessage("Error de autenticación: Token no recibido.");
        return;
      }

      // Guardar datos del usuario
      if (data.user) {
        // 🔥 VERIFICACIÓN CLAVE PARA DASHBOARDUSER
        if (!data.user.id_usuario) {
            console.error("Respuesta de API incompleta: Falta 'id_usuario' en el objeto de usuario.");
            // El dashboardUser se encargará de forzar el logout si esto falla.
        }
        
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("rol", data.user.rol_id);
      } else {
        setErrorMessage("Error de autenticación: Datos de usuario incompletos.");
        return;
      }

      // Redirección según rol_id
      const rol_id = Number(data.user?.rol_id); // aseguramos que sea número

      if (rol_id === 1) {
        navigate("/dashboardAdmin");
      } else if (rol_id === 2) {
        navigate("/dashboardUser");
      } else if (rol_id === 3) {
        navigate("/dashboardSuperAdmin");
      } else {
        // Reemplazo de alert()
        setErrorMessage("Rol no reconocido o sin permisos de acceso.");
        // Limpiamos la sesión si el rol es desconocido
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("rol");
        navigate("/acceso-denegado");
      }

    } catch (err) {
      console.error("❌ Error en login:", err);
      // Reemplazo de alert()
      setErrorMessage("Error en el servidor durante el login. Verifique su conexión.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="align-items-center justify-content-center  principal-content">
      <div
        className="card shadow p-4"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <h2 className="text-center text-primary mb-4">Registro</h2>
        <div className="justify-content-center">
          <img className="img-user-login" src="/Sample_User_Icon.png" alt="" />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Implementación del mensaje de error sin alert() */}
          {errorMessage && (
            <div className="alert alert-danger mb-3" role="alert">
              {errorMessage}
            </div>
          )}

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

          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <div className="wrapper">
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
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}