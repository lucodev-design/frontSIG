// src/pages/DashboardAdmin.jsx
import React, { useEffect, useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import {  Container,  Row,  Col,  Card,  Button,  Navbar,  Nav,  Spinner,} from "react-bootstrap";
import {  FaUsers,  FaChartBar,  FaCogs,  FaHome,  FaUserPlus,  FaList,} from "react-icons/fa";
import LogoutButton from "../components/logout";
import "../templates/styles/DashAdmin.css";

// Lazy load de los módulos
const GestionUsuarios = lazy(() =>
  import("../pages/AdminPages/GestionUsuario")
);
const ListUser = lazy(() => import("../pages/AdminPages/ListUser"));

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [activeView, setActiveView] = useState("home"); // Vista principal
  const [activeUserView, setActiveUserView] = useState("form"); // Vista interna de Usuarios

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("nombre");
    if (!token) {
      navigate("/login");
    } else {
      setNombre(userName || "Administrador");
    }
  }, [navigate]);

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        className="bg-dark text-white d-flex flex-column p-3"
        style={{ width: "250px" }}
      >
        <h3 className="text-center mb-4">Admin Panel</h3>
        <Nav className="flex-column nav-list">
          <Nav.Link
            className="text-white mb-2"
            onClick={() => setActiveView("home")}
          >
            <FaHome className="me-2" /> Inicio
          </Nav.Link>
          <Nav.Link
            className="text-white mb-2"
            onClick={() => setActiveView("usuarios")}
          >
            <FaUsers className="me-2" /> Usuarios
          </Nav.Link>
          <Nav.Link
            className="text-white mb-2"
            onClick={() => setActiveView("reportes")}
          >
            <FaChartBar className="me-2" /> Reportes
          </Nav.Link>
          <Nav.Link
            className="text-white mb-2"
            onClick={() => setActiveView("config")}
          >
            <FaCogs className="me-2" /> Configuración
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
          <Navbar.Brand>
            Bienvenido <strong>{nombre}</strong> 👋
          </Navbar.Brand>
          <div className="ms-auto d-flex align-items-center">
            <LogoutButton />
          </div>
        </Navbar>

        {/* Content dinámico */}
        <Container fluid className="p-4" style={{ background: "#f5f6fa" }}>
          {/* Home */}
          {activeView === "home" && (
            <>
              <Row className="mb-4">
                <Col md={4}>
                  <Card className="shadow-sm border-0">
                    <Card.Body>
                      <h6 className="text-muted">Total de Usuarios</h6>
                      <h3 className="text-primary">120</h3>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="shadow-sm border-0">
                    <Card.Body>
                      <h6 className="text-muted">Asistencias Hoy</h6>
                      <h3 className="text-success">45</h3>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="shadow-sm border-0">
                    <Card.Body>
                      <h6 className="text-muted">Reportes Pendientes</h6>
                      <h3 className="text-warning">8</h3>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row>
                <Col md={4} className="mb-3">
                  <Card className="shadow-sm border-0 h-100">
                    <Card.Body>
                      <FaUsers size={40} className="text-primary mb-3" />
                      <Card.Title>Gestión de Usuarios</Card.Title>
                      <Card.Text>
                        Agregar y gestionar a los trabajadores.
                      </Card.Text>
                      <Button
                        variant="primary"
                        onClick={() => setActiveView("usuarios")}
                      >
                        Gestionar
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4} className="mb-3">
                  <Card className="shadow-sm border-0 h-100">
                    <Card.Body>
                      <FaChartBar size={40} className="text-success mb-3" />
                      <Card.Title>Reportes</Card.Title>
                      <Card.Text>
                        Visualiza reportes de asistencia, pagos y actividades.
                      </Card.Text>
                      <Button
                        variant="success"
                        onClick={() => setActiveView("reportes")}
                      >
                        Ver Reportes
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4} className="mb-3">
                  <Card className="shadow-sm border-0 h-100">
                    <Card.Body>
                      <FaCogs size={40} className="text-warning mb-3" />
                      <Card.Title>Configuración</Card.Title>
                      <Card.Text>
                        Ajusta la configuración general del sistema.
                      </Card.Text>
                      <Button
                        variant="warning"
                        onClick={() => setActiveView("config")}
                      >
                        Configurar
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}

          {/* Usuarios */}
          {activeView === "usuarios" && (
            <>
              {/* Menú interno */}
              <div className="mb-3 d-flex gap-2">
                <Button
                  variant={activeUserView === "form" ? "primary" : "outline-primary"}
                  onClick={() => setActiveUserView("form")}
                >
                  <FaUserPlus className="me-1" /> Registrar Usuario
                </Button>
                <Button
                  variant={activeUserView === "list" ? "primary" : "outline-primary"}
                  onClick={() => setActiveUserView("list")}
                >
                  <FaList className="me-1" /> Lista de Trabajadores
                </Button>
              </div>

              <Suspense
                fallback={
                  <div className="text-center py-5">
                    <Spinner animation="border" />
                  </div>
                }
              >
                {activeUserView === "form" && <GestionUsuarios />}
                {activeUserView === "list" && <ListUser />}
              </Suspense>
            </>
          )}

          {/* Reportes */}
          {activeView === "reportes" && (
            <div>
              <h3>📊 Reportes</h3>
              <p>Aquí irán los reportes...</p>
            </div>
          )}

          {/* Configuración */}
          {activeView === "config" && (
            <div>
              <h3>⚙️ Configuración</h3>
              <p>Aquí irán las configuraciones...</p>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
};

export default DashboardAdmin;
