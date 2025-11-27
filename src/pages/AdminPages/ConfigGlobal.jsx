// src/components/ConfiguracionGlobal.jsx
import React, { useState, useEffect } from "react";
import { Card, Form, Button, Spinner, Alert, Modal, Row, Col } from "react-bootstrap";
import { getConfiguracionGlobal, updateConfiguracionGlobal } from "../../api/api";

const ConfigGlobal = ({ onVolver }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Estado para el modal de turnos
  const [showTurnos, setShowTurnos] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const data = await getConfiguracionGlobal();
      setConfig(data);
    } catch (err) {
      setError("No se pudo cargar la configuración.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      const response = await updateConfiguracionGlobal(config);
      setMessage(response.message);
    } catch (err) {
      setError("Error al guardar cambios.");
    } finally {
      setLoading(false);
      fetchConfig();
    }
  };

  if (loading && !config) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" /> Cargando configuración...
      </div>
    );
  }

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
      <Card className="shadow-lg p-4 border-0">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold text-primary">Configuración Global</h3>
          <Button variant="secondary" onClick={onVolver}>← Volver</Button>
        </div>

        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <h5 className="mb-3 text-muted">Ajustes de Descuento y Tolerancia</h5>

          <Form.Group className="mb-3">
            <Form.Label>Tiempo de tolerancia (min)</Form.Label>
            <Form.Control
              type="number"
              name="tolerancia_min"
              value={config.tolerancia_min || 0}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descuento por minuto (S/)</Form.Label>
            <Form.Control
              type="number"
              name="descuento_min"
              step="0.01"
              value={config.descuento_min || 0}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Tiempo máximo antes de marcar falta (min)</Form.Label>
            <Form.Control
              type="number"
              name="tiempo_falta"
              value={config.tiempo_falta || 60}
              onChange={handleChange}
            />
          </Form.Group>

          <hr />

          <h5 className="my-3 text-muted">Horario General (Tiempo Completo)</h5>

          <Form.Group className="mb-3">
            <Form.Label>Hora Entrada Global</Form.Label>
            <Form.Control
              type="time"
              name="hora_entrada"
              value={config.hora_entrada || "07:00"}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Hora Salida Global</Form.Label>
            <Form.Control
              type="time"
              name="hora_salida"
              value={config.hora_salida || "19:00"}
              onChange={handleChange}
            />
          </Form.Group>

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Guardar Cambios"}
          </Button>

          {/* BOTÓN DEL MODAL */}
          <Button
            variant="warning"
            className="ms-3"
            onClick={() => setShowTurnos(true)}
          >
            Configurar Turnos
          </Button>
        </Form>
      </Card>

      {/* MODAL DE CONFIGURACIÓN DE TURNOS */}
      <Modal show={showTurnos} onHide={() => setShowTurnos(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-primary">Configurar Turnos</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <h6 className="fw-bold text-muted">Turno Mañana</h6>

          <Row className="mb-3">
            <Col>
              <Form.Label>Entrada Mañana</Form.Label>
              <Form.Control
                type="time"
                name="hora_inicio_m"
                value={config.hora_inicio_m || ""}
                onChange={handleChange}
              />
            </Col>
            <Col>
              <Form.Label>Salida Mañana</Form.Label>
              <Form.Control
                type="time"
                name="hora_fin_m"
                value={config.hora_fin_m || ""}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <h6 className="fw-bold text-muted mt-3">Turno Tarde</h6>

          <Row>
            <Col>
              <Form.Label>Entrada Tarde</Form.Label>
              <Form.Control
                type="time"
                name="hora_inicio_t"
                value={config.hora_inicio_t || ""}
                onChange={handleChange}
              />
            </Col>
            <Col>
              <Form.Label>Salida Tarde</Form.Label>
              <Form.Control
                type="time"
                name="hora_fin_t"
                value={config.hora_fin_t || ""}
                onChange={handleChange}
              />
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTurnos(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
          >
            Guardar Turnos
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ConfigGlobal;
