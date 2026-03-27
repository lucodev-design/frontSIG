import React, { useState } from "react";
import { Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { enviarSoporte } from "../../api/api";
import WhatsappButton from "../../components/WhatsappButton";

const SoporteUser = ({ usuario }) => {
  const [mensaje, setMensaje] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formKey, setFormKey] = useState(0); // 🔑 fuerza re-render del form

  const handleEnviar = async (e) => {
    e.preventDefault();

    if (!mensaje.trim() || loading) return;

    setLoading(true);

    const timeout = setTimeout(() => {
      setLoading(false);
      alert("El servidor tardó demasiado. Intenta nuevamente.");
    }, 10000);

    try {
      const res = await enviarSoporte({
        email: usuario.email,
        mensaje: mensaje,
      });

      const ok =
        res?.success === true ||
        res?.ok === true ||
        typeof res?.message === "string";

      if (ok) {
        window.dispatchEvent(new Event("nuevo_soporte"));

        //  Resetea el formulario completamente
        setMensaje("");
        setFormKey((prev) => prev + 1);
        setSuccess(true);

        // Oculta el mensaje de éxito después de 4 segundos
        setTimeout(() => setSuccess(false), 4000);
      } else {
        alert(res?.error || "Error al enviar mensaje");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al conectar con el servidor");
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "80vh" }}
    >
      <Card
        className="shadow-lg border-0"
        style={{ width: "100%", maxWidth: "500px", borderRadius: "15px" }}
      >
        <Card.Body className=" soporte-card">
          <div className="text-center">
            <h4 className="fw-bold">Soporte Técnico</h4>
            <p className="text-muted mb-0">
              ¿Tienes algún problema? Escríbenos y te ayudamos.
            </p>
          </div>

          {/*  Alert más visible con animación */}
          {success && (
            <Alert variant="success" className="text-center fw-semibold fs-6">
               ¡Mensaje enviado correctamente! Nos pondremos en contacto pronto.
            </Alert>
          )}

          {/* 🔑 key={formKey} fuerza el re-render limpio del formulario */}
          <Form key={formKey} onSubmit={handleEnviar}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Correo</Form.Label>
              <Form.Control
                type="email"
                value={usuario.email}
                disabled
                className="rounded-3"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Mensaje</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Describe tu problema o consulta..."
                className="rounded-3"
                style={{ resize: "none" }}
              />
            </Form.Group>

            <div className="d-grid">
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !mensaje.trim()} //  deshabilitado si está vacío
                className="rounded-3 fw-semibold"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Enviando...
                  </>
                ) : (
                  "Enviar mensaje"
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      <WhatsappButton phone="51917361031" mensaje="Hola, tengo una consulta." />
    </div>
  );
};

export default SoporteUser;