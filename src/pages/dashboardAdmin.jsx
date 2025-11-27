// src/pages/DashboardAdmin.jsx
import React, { useEffect, useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import {  Container,  Row,  Col,  Card,  Button,  Navbar,  Nav,  Spinner,} from "react-bootstrap";
import {  FaUsers,  FaChartBar,  FaCogs,  FaHome,  FaUserPlus,  FaList,} from "react-icons/fa";
import LogoutButton from "../components/logout";
import ContadorAsistenciasDiarias from "../components/panelConponents/ContadorAsistenciasDiarias";
import CantidadUsuarios from "../components/panelConponents/CantidadUsuarios";
import "../templates/styles/DashAdmin.css";

//  Lazy load de módulos
const GestionUsuarios = lazy(() => import("../pages/AdminPages/GestionUsuario"));
const ListUser = lazy(() => import("../pages/AdminPages/ListUser"));
const ReporteAsistencia = lazy(() =>  import("../pages/AdminPages/ReporteAsistencia"));
const ConfiguracionesAdmin = lazy(() =>  import("../pages/AdminPages/ConfiguracionesAdmin"));


const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [activeView, setActiveView] = useState("home");
  const [activeUserView, setActiveUserView] = useState("form");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token) {
      navigate("/login");
    } else {
      if (user) {
        try {
          const userObj = JSON.parse(user);
          setNombre(userObj.nombre || "Administrador");
        } catch (err) {
          console.error("Error parsing user from localStorage", err);
          setNombre("Administrador");
        }
      } else {
        setNombre("Administrador");
      }
    }
  }, [navigate]);

  // Cerrar sidebar al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      if (sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sidebarOpen]);

  return (
    <div className="body-content">
      <div
        className="d-block d-md-flex "
        style={{ minHeight: "100vh", background: "rgba(255, 255, 255, 0.5)" }}
      >
        {/* Sidebar */}
        <div
          className={`sidebar d-flex flex-column p-3 ${
            sidebarOpen ? "open" : ""
          }`}
        >
          <h3 className="text-center mb-4">Admin Panel</h3>
          <Nav className="flex-column nav-list">
            <Nav.Link
              className="text-white mb-2"
              onClick={() => {
                setActiveView("home");
                setSidebarOpen(false);
              }}
            >
              <FaHome className="me-2" /> Inicio
            </Nav.Link>

            <Nav.Link
              className="text-white mb-2"
              onClick={() => {
                setActiveView("usuarios");
                setSidebarOpen(false);
              }}
            >
              <FaUsers className="me-2" /> Trabajadores
            </Nav.Link>

            <Nav.Link
              className="text-white mb-2"
              onClick={() => {
                setActiveView("reportes");
                setSidebarOpen(false);
              }}
            >
              <FaChartBar className="me-2" /> Reportes
            </Nav.Link>

            <Nav.Link
              className="text-white mb-2"
              onClick={() => {
                setActiveView("config");
                setSidebarOpen(false);
              }}
            >
              <FaCogs className="me-2" /> Configuración
            </Nav.Link>            

            <LogoutButton />
          </Nav>

          <Button
            variant="outline-light"
            className="mt-auto d-lg-none"
            onClick={() => setSidebarOpen(false)}
          >
            Cerrar menú ✖
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 m-1 p-2 navbar-main-content">
          {/* Header */}
          <Navbar bg="light" className="shadow-sm">
            <Button
              variant="outline-primary"
              className="d-lg-none me-3"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </Button>
            <Navbar.Brand>
              Bienvenido <strong>{nombre}</strong> 👋
            </Navbar.Brand>
          </Navbar>

          {/* Content dinámico */}
          <Container fluid className="p-4" style={{ background: "#f5f6fa" }}>
            {/* HOME */}
            {activeView === "home" && (
              <>
                {/* 👇 FILA DE CONTADORES - RESPONSIVA Y CENTRADA */}
                <Row className="mb-4 justify-content-center">
                  {/* Contador de Usuarios */}
                  <Col xs={12} sm={6} lg={6} xl={5} className="mb-3 mb-lg-0">
                    <CantidadUsuarios />
                  </Col>
                  
                  {/* Contador de Asistencias */}
                  <Col xs={12} sm={6} lg={6} xl={5} className="mb-3 mb-lg-0">
                    <ContadorAsistenciasDiarias />
                  </Col>
                </Row>

                {/* TARJETAS DE ACCESO RÁPIDO */}
                <Row>
                  <Col xs={12} md={6} lg={4} className="mb-3">
                    <Card className="shadow-sm border-0 h-100">
                      <Card.Body>
                        <FaUsers size={40} className="text-primary mb-3" />
                        <Card.Title>Gestión de Trabajadores</Card.Title>
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

                  <Col xs={12} md={6} lg={4} className="mb-3">
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

                  <Col xs={12} md={6} lg={4} className="mb-3">
                    <Card className="shadow-sm border-0 h-100">
                      <Card.Body>
                        <FaCogs size={40} className="text-warning mb-3" />
                        <Card.Title>Configuración</Card.Title>
                        <Card.Text>
                          Ajusta la configuración general, turnos, tolerancias y
                          feriados del sistema.
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

            {/* TRABAJADORES */}
            {activeView === "usuarios" && (
              <>
                <div className="mb-3 d-flex gap-2 flex-wrap">
                  <Button
                    variant={
                      activeUserView === "form" ? "primary" : "outline-primary"
                    }
                    onClick={() => setActiveUserView("form")}
                  >
                    <FaUserPlus className="me-1" /> Registrar Usuario
                  </Button>
                  <Button
                    variant={
                      activeUserView === "list" ? "primary" : "outline-primary"
                    }
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

            {/* REPORTES */}
            {activeView === "reportes" && (
              <Suspense
                fallback={
                  <div className="text-center py-5">
                    <Spinner animation="border" />
                  </div>
                }
              >
                <ReporteAsistencia />
              </Suspense>
            )}

            {/* CONFIGURACIÓN */}
            {activeView === "config" && (
              <Suspense
                fallback={
                  <div className="text-center py-5">
                    <Spinner animation="border" />
                  </div>
                }
              >
                <ConfiguracionesAdmin />
              </Suspense>
            )}
            
          </Container>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;