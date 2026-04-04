import React, { useState, useEffect, useRef } from "react";
import { registerUser, getRoles, getSedes, getTurnos } from "../../api/api";
import { Button, Card, Form, Modal, Spinner } from "react-bootstrap";
import { QRCodeCanvas } from "qrcode.react";
import "../../templates/styles/crearAdmin-shared.css";

const ROL_EMPLEADO = { id: 2, nombre: "Empleado", descripcion: "Acceso estándar de usuario", icon: "👤" };

const stepTitles = ["Datos personales", "Acceso y seguridad", "Asignación"];

function GestionUsuario() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    dni: "",
    email: "",
    password: "",
    rol_id: "2",
    sede_id: "",
    turno_id: "",
  });

  const [sedes, setSedes] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [step, setStep] = useState(1);
  const [prevStep, setPrevStep] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState("forward");
  const [qrCode, setQrCode] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sedesData, turnosResponse] = await Promise.all([
          getSedes(),
          getTurnos(),
        ]);
        setSedes(sedesData);
        const turnosData =
          Array.isArray(turnosResponse) ? turnosResponse
          : Array.isArray(turnosResponse?.data) ? turnosResponse.data
          : Array.isArray(turnosResponse?.turnos) ? turnosResponse.turnos
          : [];
        setTurnos(turnosData);
      } catch (err) {
        console.error("❌ Error cargando datos:", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const animateStep = (newStep, dir) => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setPrevStep(step);
    setTimeout(() => {
      setStep(newStep);
      setAnimating(false);
      setPrevStep(null);
    }, 320);
  };

  const nextStep = () => animateStep(Math.min(step + 1, 3), "forward");
  const goBack = () => animateStep(Math.max(step - 1, 1), "back");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowModal(true);
    setLoading(true);
    setModalMessage(`Registrando usuario ${formData.nombre} ${formData.apellidos}...`);

    try {
      const res = await registerUser({ ...formData });
      const idUsuario =
        res?.data?.usuario?.id_usuario ||
        res?.data?.id_usuario ||
        res?.usuario?.id_usuario ||
        res?.user?.id_usuario ||
        null;

      if (!idUsuario) {
        setModalMessage("⚠️ Usuario registrado, pero no se pudo generar el QR (ID no recibido).");
        setLoading(false);
        return;
      }

      setQrCode(idUsuario);
      setModalMessage(`✅ Código QR generado para ${formData.nombre} ${formData.apellidos}`);
      setLoading(false);
      setFormData({ nombre: "", apellidos: "", dni: "", email: "", password: "", rol_id: "2", sede_id: "", turno_id: "" });
      setStep(1);
    } catch (err) {
      console.error("❌ Error registrando usuario:", err);
      setModalMessage("❌ Error registrando usuario");
      setLoading(false);
    }
  };

  const progress = (step / 3) * 100;

  const slideStyle = {
    transition: "all 0.32s cubic-bezier(0.4,0,0.2,1)",
    transform: animating
      ? direction === "forward"
        ? "translateX(-40px)"
        : "translateX(40px)"
      : "translateX(0)",
    opacity: animating ? 0 : 1,
  };

  return (
    <>

      <div
        className="d-flex justify-content-center align-items-center flex-column"
        style={{ padding: "0.75rem", minHeight: "100%" }}
      >
        <Card className="main-card w-100 mb-4 p-1" style={{ maxWidth: "560px" }}>
          <Card.Body className="p-4">
            <h4 className="text-center mb-1 fw-bold text-primary">
              Registro de Usuario
            </h4>
            <p
              className="text-center text-muted mb-4"
              style={{ fontSize: "13px" }}
            >
              Completa los 3 pasos para registrar
            </p>

            {/* Step indicator */}
            <div className="step-indicator">
              {[1, 2, 3].map((s, i) => (
                <React.Fragment key={s}>
                  <div className="step-dot">
                    <div
                      className={`step-circle ${step === s ? "active" : step > s ? "done" : "pending"}`}
                    >
                      {step > s ? "✓" : s}
                    </div>
                    <span
                      className={`step-label ${step === s ? "active" : step > s ? "done" : "pending"}`}
                    >
                      {stepTitles[i]}
                    </span>
                  </div>
                  {i < 2 && (
                    <div
                      className={`step-line ${step > s ? "done" : "pending"}`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Progress bar */}
            <div className="progress-bar-custom">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Animated form content */}
            <div style={slideStyle} ref={contentRef}>
              <Form onSubmit={handleSubmit}>
                {step === 1 && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        placeholder="Ej: Juan"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Apellidos</Form.Label>
                      <Form.Control
                        type="text"
                        name="apellidos"
                        placeholder="Ej: Pérez García"
                        value={formData.apellidos}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>DNI</Form.Label>
                      <Form.Control
                        type="text"
                        name="dni"
                        placeholder="12345678"
                        value={formData.dni}
                        maxLength={8}
                        pattern="^[0-9]{8}$"
                        onChange={(e) => {
                          // Solo números
                          const onlyNums = e.target.value.replace(
                            /[^0-9]/g,
                            "",
                          );
                          setFormData({ ...formData, dni: onlyNums });
                        }}
                        required
                      />
                    </Form.Group>
                  </>
                )}

                {step === 2 && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Correo electrónico</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="usuario@empresa.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Contraseña</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder="Mínimo 8 caracteres"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </>
                )}

                {step === 3 && (
                  <>
                    {/* Rol fijo: Empleado */}
                    <Form.Group className="mb-3">
                      <Form.Label>Rol asignado</Form.Label>
                      <div className="role-card-static">
                        <span className="role-icon">{ROL_EMPLEADO.icon}</span>
                        <div>
                          <p className="role-name">{ROL_EMPLEADO.nombre}</p>
                          <p className="role-desc">
                            {ROL_EMPLEADO.descripcion}
                          </p>
                        </div>
                        <span className="role-locked-badge">✓ Asignado</span>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Sede</Form.Label>
                      <Form.Select
                        name="sede_id"
                        value={formData.sede_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccione una sede</option>
                        {sedes.map((sede) => (
                          <option key={sede.id_sede} value={sede.id_sede}>
                            {sede.nombre}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Turno</Form.Label>
                      <Form.Select
                        name="turno_id"
                        value={formData.turno_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccione un turno</option>
                        {Array.isArray(turnos) &&
                          turnos.map((turno) => (
                            <option key={turno.id_turno} value={turno.id_turno}>
                              {turno.nombre_turno} ({turno.hora_inicio} -{" "}
                              {turno.hora_fin})
                            </option>
                          ))}
                      </Form.Select>
                    </Form.Group>
                  </>
                )}

                <div className="d-flex justify-content-between mt-4">
                  {step > 1 ? (
                    <Button
                      variant="outline-secondary"
                      className="btn-nav"
                      onClick={goBack}
                      type="button"
                    >
                      ← Anterior
                    </Button>
                  ) : (
                    <div />
                  )}

                  {step < 3 ? (
                    <Button
                      variant="primary"
                      className="btn-nav"
                      onClick={nextStep}
                      type="button"
                    >
                      Siguiente →
                    </Button>
                  ) : (
                    <Button type="submit" variant="success" className="btn-nav">
                      Registrar usuario
                    </Button>
                  )}
                </div>
              </Form>
            </div>
          </Card.Body>
        </Card>

        {/* Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Registro de Usuario</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center py-4">
            {loading ? (
              <>
                <Spinner animation="border" role="status" variant="primary" />
                <p className="mt-3 text-muted">{modalMessage}</p>
              </>
            ) : qrCode ? (
              <>
                <p className="fw-semibold">{modalMessage}</p>
                <div className="d-flex justify-content-center my-3">
                  <QRCodeCanvas value={String(qrCode)} size={180} />
                </div>
                <p className="text-muted" style={{ fontSize: "13px" }}>
                  ID Usuario: {qrCode}
                </p>
                <Button
                  variant="primary"
                  className="btn-nav mt-2"
                  onClick={() => setShowModal(false)}
                >
                  Cerrar
                </Button>
              </>
            ) : (
              <p>{modalMessage}</p>
            )}
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
}

export default GestionUsuario;
