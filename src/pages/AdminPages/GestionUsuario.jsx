import React, { useState, useEffect } from "react";
import { registerUser, getRoles, getSedes } from "../../api/api";
import { QRCodeCanvas } from "qrcode.react"; // Importamos librería QR

function GestionUsuario() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    dni: "",
    email: "",
    password: "",
    rol_id: "",
    sede_id: "",
  });

  const [roles, setRoles] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [qrCode, setQrCode] = useState(""); // ✅ Guardamos el QR generado

  // Cargar roles y sedes al iniciar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const rolesData = await getRoles();
        setRoles(rolesData);

        const sedesData = await getSedes();
        setSedes(sedesData);
      } catch (err) {
        console.error("❌ Error cargando roles/sedes:", err);
      }
    };
    fetchData();
  }, []);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const dataToSend = {
        ...formData,
        qr_code: formData.dni, // ✅ Generamos QR con el DNI
      };

      const res = await registerUser(dataToSend);
      alert("✅ Usuario registrado: " + res.user.nombre);

      // ✅ Guardamos el QR para mostrarlo
      setQrCode(dataToSend.qr_code);

      // Reset form
      setFormData({
        nombre: "",
        apellidos: "",
        dni: "",
        email: "",
        password: "",
        rol_id: "",
        sede_id: "",
      });
    } catch (err) {
      console.error("❌ Error registrando usuario:", err);
      alert("Error registrando usuario");
    }
  };

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center min-vh-100">
      {/* Botón Asistencia */}
      <button
        onClick={() => (window.location.href = "/dashboardAdmin")}
        className="btn btn-primary btn-volver mb-3"
      >
        Volver
      </button>

      <div className="col-md-6 col-lg-5">
        <div className="card shadow-lg border-0 rounded-4">
          <div className="card-body p-4">
            <h3 className="text-center mb-4 fw-bold text-primary">
              Gestión de Usuarios
            </h3>

            <form
              onSubmit={handleSubmit}
              className="needs-validation"
              noValidate
            >
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  className="form-control"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Apellidos</label>
                <input
                  type="text"
                  name="apellidos"
                  className="form-control"
                  value={formData.apellidos}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">DNI</label>
                <input
                  type="text"
                  name="dni"
                  className="form-control"
                  value={formData.dni}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Correo</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Rol</label>
                <select
                  name="rol_id"
                  className="form-select"
                  value={formData.rol_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un Rol</option>
                  {roles.map((rol) => (
                    <option key={rol.id_rol} value={rol.id_rol}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Sede</label>
                <select
                  name="sede_id"
                  className="form-select"
                  value={formData.sede_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione una Sede</option>
                  {sedes.map((sede) => (
                    <option key={sede.id_sede} value={sede.id_sede}>
                      {sede.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="d-grid">
                <button type="submit" className="btn btn-primary btn-lg">
                  Registrar Usuario
                </button>
              </div>
            </form>
            {/* ✅ Mostrar QR después de registrar */}
            {qrCode && (
              <div className="text-center mt-4">
                <h5>QR generado</h5>
                <QRCodeCanvas value={qrCode} size={180} />
                <p className="mt-2 text-muted">DNI: {qrCode}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Boton para ir a Ver Lista de Usuarios */}
      <button
        onClick={() => (window.location.href = "/ListaUsuarios")}
        className="btn btn-primary btn-List mb-3"
      >
        Ver Usuarios
      </button>
    </div>
  );
}

export default GestionUsuario;
