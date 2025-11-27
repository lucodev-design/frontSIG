// src/modules/user/SoporteUser.jsx
import React, { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";

const SoporteUser = ({ usuario }) => {
  const [mensaje, setMensaje] = useState("");
  const [success, setSuccess] = useState(false);

  const handleEnviar = (e) => {
    e.preventDefault();
    if (!mensaje.trim()) return;
    // Aquí iría la llamada a tu API de soporte
    console.log("Mensaje enviado:", { usuario: usuario.email, mensaje });
    setSuccess(true);
    setMensaje("");
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <h5>Soporte / Contacto</h5>
        <p>Envía tus consultas o problemas y nuestro equipo te responderá.</p>

        {success && <Alert variant="success">Mensaje enviado correctamente.</Alert>}

        <Form onSubmit={handleEnviar}>
          <Form.Group className="mb-3">
            <Form.Label>Correo</Form.Label>
            <Form.Control type="email" value={usuario.email} disabled />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mensaje</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
            />
          </Form.Group>

          <Button type="submit" variant="primary">Enviar</Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default SoporteUser;
