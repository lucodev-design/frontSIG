import React, { useState } from "react";
import { Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { enviarSoporte } from "../../api/api";

const SoporteUser = ({ usuario }) => {
  const [mensaje, setMensaje] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEnviar = async (e) => {
    e.preventDefault();

    if (!mensaje.trim()) return;

    setLoading(true);

    try {
      const res = await enviarSoporte({
        email: usuario.email,
        mensaje: mensaje,
      });

      console.log("Respuesta:", res);

      if (res && !res.error) {
        window.dispatchEvent(new Event("nuevo_soporte"));

        setSuccess(true);
        setMensaje("");

        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert(res?.error || "Error al enviar mensaje");
      }
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor");
    } finally {
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
        <Card.Body className="p-4">
          <div className="text-center mb-3">
            <h4 className="fw-bold">Soporte Técnico</h4>
            <p className="text-muted mb-0">
              ¿Tienes algún problema? Escríbenos y te ayudamos.
            </p>
          </div>

          {success && (
            <Alert variant="success" className="text-center">
              ✅ Mensaje enviado correctamente
            </Alert>
          )}

          <Form onSubmit={handleEnviar}>
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
                disabled={loading}
                className="rounded-3 fw-semibold"
                style={{ transition: "all 0.3s ease" }}
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
    </div>
  );
};

export default SoporteUser;
