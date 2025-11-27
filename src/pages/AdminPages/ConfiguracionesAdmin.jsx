import React, { useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import TurnosTable from "../../components/TurnosTable";
import ConfigGlobal from "../AdminPages/ConfigGlobal";

const ConfiguracionesAdmin = () => {
  const [selectedConfig, setSelectedConfig] = useState(null);

  // 🔹 Tarjetas principales
  const renderTarjetasPrincipales = () => (
    <Row className="g-4 justify-content-center">
      <Col xs={12} md={6} lg={5}>
        <Card
          className="text-center shadow-sm border-0 hover-card"
          onClick={() => setSelectedConfig("general")}
          style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Card.Body>
            <div className="mb-3">
              <span style={{ fontSize: '3rem' }}>⚙️</span>
            </div>
            <Card.Title className="fw-bold text-primary">
              Configuración General
            </Card.Title>
            <Card.Text className="text-muted">
              Modificar tolerancia, descuentos y horas globales del sistema.
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>

      <Col xs={12} md={6} lg={5}>
        <Card
          className="text-center shadow-sm border-0 hover-card"
          onClick={() => setSelectedConfig("turnos")}
          style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Card.Body>
            <div className="mb-3">
              <span style={{ fontSize: '3rem' }}>🧭</span>
            </div>
            <Card.Title className="fw-bold text-success">
              Configuración de Turnos
            </Card.Title>
            <Card.Text className="text-muted">
              Definir y gestionar los horarios de entrada y salida por turno.
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  // 🔹 Render principal
  return (
    <Container className="py-4">
      <h3 className="text-center mb-4">⚙️ Módulo de Configuraciones</h3>

      {/* Tarjetas principales */}
      {!selectedConfig && renderTarjetasPrincipales()}

      {/* Configuración General */}
      {selectedConfig === "general" && (
        <ConfigGlobal 
          onVolver={() => setSelectedConfig(null)} 
        />
      )}

      {/* Configuración de Turnos */}
      {selectedConfig === "turnos" && (
        <>
          <Button
            variant="secondary"
            className="mb-3"
            onClick={() => setSelectedConfig(null)}
          >
            ← Volver
          </Button>
          <TurnosTable />
        </>
      )}
    </Container>
  );
};

export default ConfiguracionesAdmin;

// codigo para usarlo dento de confoguraciones general y de turnos