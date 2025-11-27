import React, { useState, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import {  registerUser, createRol,  createSede,  createTurno,  getTurnos,  getRoles,  getSedes,  deleteTurno,
} from "../api/api";

const AggUsuario = () => {
  const [tipoRegistro, setTipoRegistro] = useState("usuario");
  const [turnos, setTurnos] = useState([]);
  const [roles, setRoles] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    nombre_turno: "",
    hora_inicio: "",
    hora_fin: "",
  });

  //  Cargar datos iniciales según el tipo de registro
  useEffect(() => {
    if (tipoRegistro === "turno") fetchTurnos();
    if (tipoRegistro === "usuario") {
      fetchRoles();
      fetchSedes();
    }
  }, [tipoRegistro]);

  //  Ocultar mensajes automáticamente
  useEffect(() => {
    if (mensaje || error) {
      const timer = setTimeout(() => {
        setMensaje("");
        setError("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [mensaje, error]);

  //  Cargar roles, sedes y turnos
  const fetchTurnos = async () => {
    try {
      const res = await getTurnos();
      setTurnos(Array.isArray(res.data) ? res.data : res);
    } catch {
      setError(" No se pudieron cargar los turnos");
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await getRoles();
      setRoles(Array.isArray(res.data) ? res.data : res);
    } catch {
      setError(" No se pudieron cargar los roles");
    }
  };

  const fetchSedes = async () => {
    try {
      const res = await getSedes();
      setSedes(Array.isArray(res.data) ? res.data : res);
    } catch {
      setError(" No se pudieron cargar las sedes");
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  //  Enviar formulario según tipo
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    setLoading(true);

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
      } else if (tipoRegistro === "turno") {
        const { nombre_turno, hora_inicio, hora_fin } = formData;
        if (!nombre_turno || !hora_inicio || !hora_fin) {
          setError(" Todos los campos del turno son obligatorios");
          return;
        }
        res = await createTurno({ nombre_turno, hora_inicio, hora_fin });
        fetchTurnos();
      }

      //  Mostrar mensajes de éxito
      if (res?.success || res?.user) {
        setMensaje(" Registro exitoso");
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
          nombre_turno: "",
          hora_inicio: "",
          hora_fin: "",
        });
      } else {
        setError(res?.message || " Error al registrar");
      }
    } catch (err) {
      console.error(err);
      setError(" Error en el servidor o en el formato de datos");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTurno = async (id_turno) => {
    if (!window.confirm("¿Seguro que deseas eliminar este turno?")) return;
    try {
      const res = await deleteTurno(id_turno);
      if (res.success) {
        setMensaje(" Turno eliminado correctamente");
        fetchTurnos();
      } else {
        setError(" No se pudo eliminar el turno");
      }
    } catch {
      setError("Error en el servidor al eliminar el turno");
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center">
      <div
        className="p-5 rounded-5 shadow-lg"
        style={{
          backgroundColor: "#F8F9FA",
          border: "2px solid #1E3A8A",
          width: "80%",
          maxWidth: "800px",
        }}
      >
        <h3 className="text-center fw-bold mb-2">REGISTROS</h3>
        <p className="text-center text-muted mb-4">
          Seleccione el tipo de registro que desea realizar
        </p>

        {/* Botones tipo pestaña */}
        <div className="d-flex justify-content-center mb-4 gap-3 flex-wrap">
          {["usuario", "sede", "rol", "turno"].map((tipo) => (
            <Button
              key={tipo}
              variant={tipoRegistro === tipo ? "primary" : "outline-primary"}
              onClick={() => setTipoRegistro(tipo)}
              className="px-4 py-2 rounded-3 fw-semibold"
              style={{
                backgroundColor:
                  tipoRegistro === tipo ? "#1E3A8A" : "#3B82F6",
                border: "none",
              }}
            >
              {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </Button>
          ))}
        </div>

        {/*  Mensajes */}
        {mensaje && <Alert variant="success">{mensaje}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        {/*  Formulario dinámico */}
        <div
          className="p-4 rounded-4"
          style={{ backgroundColor: "#1E3A8A", color: "#fff" }}
        >
          <Form onSubmit={handleSubmit}>
            {tipoRegistro === "usuario" && (
              <>
                <Form.Control
                  className="mb-3"
                  type="text"
                  name="nombre"
                  placeholder="Nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
                <Form.Control
                  className="mb-3"
                  type="text"
                  name="apellidos"
                  placeholder="Apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  required
                />
                <Form.Control
                  className="mb-3"
                  type="text"
                  name="dni"
                  placeholder="DNI"
                  value={formData.dni}
                  onChange={handleChange}
                  required
                />
                <Form.Control
                  className="mb-3"
                  type="email"
                  name="email"
                  placeholder="Correo"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Form.Control
                  className="mb-3"
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                {/* Rol */}
                <Form.Select
                  className="mb-3"
                  name="rol_id"
                  value={formData.rol_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un Rol</option>
                  {roles.map((r) => (
                    <option key={r.id_rol} value={r.id_rol}>
                      {r.nombre}
                    </option>
                  ))}
                </Form.Select>

                {/* Sede */}
                <Form.Select
                  className="mb-4"
                  name="sede_id"
                  value={formData.sede_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione una Sede</option>
                  {sedes.map((s) => (
                    <option key={s.id_sede} value={s.id_sede}>
                      {s.nombre}
                    </option>
                  ))}
                </Form.Select>
              </>
            )}

            {tipoRegistro === "rol" && (
              <Form.Control
                className="mb-3"
                type="text"
                name="rol_nombre"
                placeholder="Nombre del Rol"
                value={formData.rol_nombre}
                onChange={handleChange}
                required
              />
            )}

            {tipoRegistro === "sede" && (
              <>
                <Form.Control
                  className="mb-3"
                  type="text"
                  name="sede_nombre"
                  placeholder="Nombre de la Sede"
                  value={formData.sede_nombre}
                  onChange={handleChange}
                  required
                />
                <Form.Control
                  className="mb-4"
                  type="text"
                  name="sede_direccion"
                  placeholder="Dirección"
                  value={formData.sede_direccion}
                  onChange={handleChange}
                  required
                />
              </>
            )}

            {tipoRegistro === "turno" && (
              <>
                <Form.Control
                  className="mb-3"
                  type="text"
                  name="nombre_turno"
                  placeholder="Nombre del Turno"
                  value={formData.nombre_turno}
                  onChange={handleChange}
                  required
                />
                <Form.Control
                  className="mb-3"
                  type="time"
                  name="hora_inicio"
                  value={formData.hora_inicio}
                  onChange={handleChange}
                  required
                />
                <Form.Control
                  className="mb-4"
                  type="time"
                  name="hora_fin"
                  value={formData.hora_fin}
                  onChange={handleChange}
                  required
                />
              </>
            )}

            <Button
              type="submit"
              className="w-100 fw-semibold"
              style={{
                backgroundColor: "#3B82F6",
                border: "none",
              }}
              disabled={loading}
            >
              {loading ? "Registrando..." : "Registrar"}
            </Button>
          </Form>
        </div>

        {/*  Tabla Turnos */}
        {tipoRegistro === "turno" && (
          <div className="mt-5 p-4 bg-light rounded-4">
            <h5 className="text-dark fw-bold mb-3">📋 Turnos Registrados</h5>
            <table className="table table-bordered table-striped">
              <thead className="table-primary">
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {turnos.length > 0 ? (
                  turnos.map((t, i) => (
                    <tr key={t.id_turno}>
                      <td>{i + 1}</td>
                      <td>{t.nombre_turno}</td>
                      <td>{t.hora_inicio}</td>
                      <td>{t.hora_fin}</td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteTurno(t.id_turno)}
                        >
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No hay turnos registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AggUsuario;
