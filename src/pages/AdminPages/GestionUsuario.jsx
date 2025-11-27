import React, { useState, useEffect } from "react";
import { registerUser, getRoles, getSedes, getTurnos } from "../../api/api";
import { ProgressBar, Button, Card, Form, Modal, Spinner } from "react-bootstrap";
import { QRCodeCanvas } from "qrcode.react";

function GestionUsuario() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    dni: "",
    email: "",
    password: "",
    rol_id: "",
    sede_id: "",
    turno_id: "",
  });

  const [roles, setRoles] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Cargar roles, sedes y turnos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesData, sedesData, turnosResponse] = await Promise.all([
          getRoles(),
          getSedes(),
          getTurnos(),
        ]);

        setRoles(rolesData);
        setSedes(sedesData);

        // Manejo flexible de la respuesta de turnos
        const turnosData =
          Array.isArray(turnosResponse) ? turnosResponse
          : Array.isArray(turnosResponse.data) ? turnosResponse.data
          : Array.isArray(turnosResponse.turnos) ? turnosResponse.turnos
          : [];

        if (turnosData.length === 0) {
          console.warn("⚠️ No se encontraron turnos en la respuesta del backend:", turnosResponse);
        }

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

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowModal(true);
    setLoading(true);
    setModalMessage(`Registrando usuario ${formData.nombre} ${formData.apellidos}...`);

    try {
      const res = await registerUser({ ...formData });
      console.log("📦 Respuesta del backend:", res);

      const idUsuario =
        res?.data?.usuario?.id_usuario ||
        res?.data?.id_usuario ||
        res?.usuario?.id_usuario ||
        res?.user?.id_usuario ||
        null;

      if (!idUsuario) {
        console.warn("⚠️ No se encontró ID de usuario en la respuesta del backend.");
        setModalMessage("⚠️ Usuario registrado, pero no se pudo generar el QR (ID no recibido).");
        setLoading(false);
        return;
      }

      setQrCode(idUsuario);
      setModalMessage(`✅ Código QR generado para ${formData.nombre} ${formData.apellidos}`);
      setLoading(false);

      // Reiniciar formulario
      setFormData({
        nombre: "",
        apellidos: "",
        dni: "",
        email: "",
        password: "",
        rol_id: "",
        sede_id: "",
        turno_id: "",
      });
      setStep(1);
    } catch (err) {
      console.error("❌ Error registrando usuario:", err);
      setModalMessage("❌ Error registrando usuario");
      setLoading(false);
    }
  };

  const progress = (step / 3) * 100;

  return (
    <div className="d-flex justify-content-center align-items-center flex-column">
      <Card className="shadow-lg border-0 rounded-4 w-100 mb-4" style={{ maxWidth: "600px" }}>
        <Card.Body className="p-4">
          <h3 className="text-center mb-4 fw-bold text-primary">Registro de Usuario</h3>
          <ProgressBar now={progress} label={`Paso ${step} de 3`} className="mb-4" />

          <Form onSubmit={handleSubmit}>
            {step === 1 && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Apellidos</Form.Label>
                  <Form.Control type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>DNI</Form.Label>
                  <Form.Control type="text" name="dni" value={formData.dni} onChange={handleChange} required />
                </Form.Group>
              </>
            )}

            {step === 2 && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Correo</Form.Label>
                  <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required />
                </Form.Group>
              </>
            )}

            {step === 3 && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Rol</Form.Label>
                  <Form.Select name="rol_id" value={formData.rol_id} onChange={handleChange} required>
                    <option value="">Seleccione un Rol</option>
                    {roles.map((rol) => (
                      <option key={rol.id_rol} value={rol.id_rol}>
                        {rol.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Sede</Form.Label>
                  <Form.Select name="sede_id" value={formData.sede_id} onChange={handleChange} required>
                    <option value="">Seleccione una Sede</option>
                    {sedes.map((sede) => (
                      <option key={sede.id_sede} value={sede.id_sede}>
                        {sede.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Turno</Form.Label>
                  <Form.Select name="turno_id" value={formData.turno_id} onChange={handleChange} required>
                    <option value="">Seleccione un Turno</option>
                    {Array.isArray(turnos) && turnos.map((turno) => (
                      <option key={turno.id_turno} value={turno.id_turno}>
                        {turno.nombre_turno} ({turno.hora_inicio} - {turno.hora_fin})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </>
            )}

            <div className="d-flex justify-content-between mt-4">
              {step > 1 && <Button variant="secondary" onClick={prevStep}>⬅️ Anterior</Button>}
              {step < 3 ? (
                <Button variant="primary" onClick={nextStep}>Siguiente ➡️</Button>
              ) : (
                <Button type="submit" variant="success">✅ Registrar</Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Modal de carga y QR */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Registro de Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {loading ? (
            <>
              <Spinner animation="border" role="status" />
              <p className="mt-3">{modalMessage}</p>
            </>
          ) : qrCode ? (
            <>
              <p>{modalMessage}</p>
              <QRCodeCanvas value={qrCode} size={200} />
              <p className="mt-2 text-muted">ID Usuario: {qrCode}</p>
              <Button variant="primary" className="mt-3" onClick={() => setShowModal(false)}>Cerrar</Button>
            </>
          ) : (
            <p>{modalMessage}</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default GestionUsuario;
