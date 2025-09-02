import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
// importamos el componente del boton para destruir la sesion
import LogoutButton from "../components/logout";

const DashboardUser = () => {
  return (    
    <Container fluid className="p-4" style={{ background: "#f5f6fa", minHeight: "100vh" }}>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h2 className="text-primary">Panel de Usuario</h2>
          <p className="text-muted">Bienvenido, aquí puedes gestionar tus actividades.</p>
        </Col>
      </Row>

      {/* Sección de opciones */}
      <Row>
        <Col md={4} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Perfil</Card.Title>
              <Card.Text>
                Revisa y actualiza tus datos personales.
              </Card.Text>
              <Button variant="primary">Ver Perfil</Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Tareas</Card.Title>
              <Card.Text>
                Consulta las tareas o actividades que tienes pendientes.
              </Card.Text>
              <Button variant="success">Ver Tareas</Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Soporte</Card.Title>
              <Card.Text>
                Contacta con el área de soporte si tienes algún problema.
              </Card.Text>
              <Button variant="warning">Contactar</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      // insertamos el boton para su uso
      <LogoutButton/>
      
    </Container>
  );
};

export default DashboardUser;
