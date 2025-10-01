// src/pages/DashboardUser.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {  Container,  Row,  Col,  Card,  Button,  Navbar,  Nav,} from "react-bootstrap";
import { FaUser, FaTasks, FaLifeRing, FaHome } from "react-icons/fa";
import LogoutButton from "../components/logout";
// import "../templates/styles/DashUser.css";

const DashboardUser = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        className="bg-dark text-white d-flex flex-column p-3"
        style={{ width: "250px" }}
      >
        <h3 className="text-center mb-4">User Panel</h3>
        <Nav className="flex-column nav-list">
          <Nav.Link
            className="text-white mb-2"
            onClick={() => navigate("/dashboardUser")}
          >
            <FaHome className="me-2" /> Inicio
          </Nav.Link>
          <Nav.Link className="text-white mb-2">
            <FaUser className="me-2" /> Perfil
          </Nav.Link>
          <Nav.Link className="text-white mb-2">
            <FaTasks className="me-2" /> Tareas
          </Nav.Link>
          <Nav.Link className="text-white mb-2">
            <FaLifeRing className="me-2" /> Soporte
          </Nav.Link>
        </Nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1">
        {/* Header */}
        <Navbar
          bg="light"
          className="px-4 shadow-sm"
          style={{ height: "70px" }}
        >
          <Navbar.Brand>Bienvenido Usuario</Navbar.Brand>
          <div className="ms-auto d-flex align-items-center">
            <LogoutButton />
          </div>
        </Navbar>

        {/* Content */}
        <Container fluid className="p-4" style={{ background: "#f5f6fa" }}>
          <Row>
            <Col md={4} className="mb-3">
              <Card className="shadow-sm border-0 h-100">
                <Card.Body>
                  <FaUser size={40} className="text-primary mb-3" />
                  <Card.Title>Perfil</Card.Title>
                  <Card.Text>
                    Revisa y actualiza tus datos personales.
                  </Card.Text>
                  <Button variant="primary">Ver Perfil</Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-3">
              <Card className="shadow-sm border-0 h-100">
                <Card.Body>
                  <FaTasks size={40} className="text-success mb-3" />
                  <Card.Title>Tareas</Card.Title>
                  <Card.Text>
                    Consulta las tareas o actividades que tienes pendientes.
                  </Card.Text>
                  <Button variant="success">Ver Tareas</Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-3">
              <Card className="shadow-sm border-0 h-100">
                <Card.Body>
                  <FaLifeRing size={40} className="text-warning mb-3" />
                  <Card.Title>Soporte</Card.Title>
                  <Card.Text>
                    Contacta con el área de soporte si tienes algún problema.
                  </Card.Text>
                  <Button variant="warning">Contactar</Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default DashboardUser;
