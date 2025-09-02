// src/pages/DashboardAdmin.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import LogoutButton from "../components/logout";

const DashboardAdmin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Si no hay token, se regresa al login
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <Container fluid className="p-4" style={{ background: "#f5f6fa", minHeight: "100vh" }}>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h2 className="text-primary">Panel de Administrador</h2>
          <p className="text-muted">Bienvenido, aquí puedes gestionar el sistema.</p>
        </Col>
      </Row>

      {/* Sección de opciones */}
      <Row>
        <Col md={4} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Gestión de Usuarios</Card.Title>
              <Card.Text>
                Administra las cuentas de empleados y sus permisos.
              </Card.Text>
              <Button variant="primary">Ver Usuarios</Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Reportes</Card.Title>
              <Card.Text>
                Visualiza reportes de asistencia, pagos y actividades.
              </Card.Text>
              <Button variant="success">Ver Reportes</Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Configuración</Card.Title>
              <Card.Text>
                Ajusta la configuración general del sistema.
              </Card.Text>
              <Button variant="warning">Configurar</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Botón de cerrar sesión */}
      <LogoutButton />
    </Container>
  );
};

export default DashboardAdmin;
