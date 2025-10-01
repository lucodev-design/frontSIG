import React, { useState, useEffect } from "react";
import { registerUser, getRoles, getSedes } from "../../api/api";
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
  });

  const [roles, setRoles] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState(null);

  // Modal de carga y QR
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
      // Crear usuario sin QR
      const res = await registerUser({ ...formData });

      // id_usuario generado por la DB
      const idUsuario = res.user.id_usuario || res.user.id;

      // Generamos el QR (el valor puede ser id_usuario)
      setQrCode(idUsuario);

      setModalMessage(`✅ Código QR generado para ${formData.nombre} ${formData.apellidos}`);
      setLoading(false);

      // Limpiar formulario si quieres
      setFormData({
        nombre: "",
        apellidos: "",
        dni: "",
        email: "",
        password: "",
        rol_id: "",
        sede_id: "",
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
                      <option key={rol.id_rol} value={rol.id_rol}>{rol.nombre}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Sede</Form.Label>
                  <Form.Select name="sede_id" value={formData.sede_id} onChange={handleChange} required>
                    <option value="">Seleccione una Sede</option>
                    {sedes.map((sede) => (
                      <option key={sede.id_sede} value={sede.id_sede}>{sede.nombre}</option>
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
