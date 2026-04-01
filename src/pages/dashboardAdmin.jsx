// src/pages/DashboardAdmin.jsx
import React, { useEffect, useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Navbar,
  Nav,
  Spinner,
} from "react-bootstrap";
import {
  FaUsers,
  FaChartBar,
  FaCogs,
  FaHome,
  FaUserPlus,
  FaList,
  FaTicketAlt,
} from "react-icons/fa";
import LogoutButton from "../components/logout";
import ContadorAsistenciasDiarias from "../components/panelConponents/ContadorAsistenciasDiarias";
import CantidadUsuarios from "../components/panelConponents/CantidadUsuarios";
import { contarTicketsNuevos } from "../api/api";
import "../templates/styles/DashAdmin.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// ── Lazy loads ────────────────────────────────────────────────
const GestionUsuarios = lazy(
  () => import("../pages/AdminPages/GestionUsuario"),
);
const ListUser = lazy(() => import("../pages/AdminPages/ListUser"));
const ReporteAsistencia = lazy(
  () => import("../pages/AdminPages/ReporteAsistencia"),
);
const ConfiguracionesAdmin = lazy(
  () => import("../pages/AdminPages/ConfiguracionesAdmin"),
);
const ListaTrabajadores = lazy(() => import("./AdminPages/pass/ListaTrabajadores"));
const ReceptorTickets = lazy(
  () => import("../pages/AdminPages/ReceptorTickets"),
);

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [activeView, setActiveView] = useState("home");
  const [activeUserView, setActiveUserView] = useState("form");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ticketsNuevos, setTicketsNuevos] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token) {
      navigate("/login");
      return;
    }
    if (user) {
      try {
        const userObj = JSON.parse(user);
        setNombre(userObj.nombre || "Administrador");
      } catch {
        setNombre("Administrador");
      }
    }
  }, [navigate]);

  // ── Polling de tickets nuevos cada 30s ───────────────────
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const data = await contarTicketsNuevos();
        setTicketsNuevos(data.total || 0);
      } catch {
        /* silencioso */
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Limpiar badge al entrar a tickets
  const handleNav = (view) => {
    setActiveView(view);
    setSidebarOpen(false);
    if (view === "tickets") setTicketsNuevos(0);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sidebarOpen]);

  const fallback = (
    <div className="text-center py-5">
      <Spinner animation="border" />
    </div>
  );

  return (
    <div className="body-content">
      <div
        className="d-block d-md-flex"
        style={{ minHeight: "100vh", background: "rgba(255, 255, 255, 0.5)" }}
      >
        {/* Overlay móvil */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 999,
            }}
          />
        )}

        {/* ── Sidebar ── */}
        <div
          className={`sidebar d-flex flex-column p-3 ${sidebarOpen ? "open" : ""}`}
          style={{ zIndex: 1000, position: sidebarOpen ? "fixed" : undefined }}
        >
          <h3 className="text-center mb-4">Admin Panel</h3>
          <Nav className="flex-column nav-list flex-grow-1">
            <Nav.Link
              className={`text-white mb-2 ${activeView === "home" ? "fw-bold" : ""}`}
              onClick={() => handleNav("home")}
            >
              <FaHome className="me-2" /> Inicio
            </Nav.Link>

            <Nav.Link
              className={`text-white mb-2 ${activeView === "usuarios" ? "fw-bold" : ""}`}
              onClick={() => handleNav("usuarios")}
            >
              <FaUsers className="me-2" /> Trabajadores
            </Nav.Link>

            <Nav.Link
              className={`text-white mb-2 ${activeView === "lista-trabajadores" ? "fw-bold" : ""}`}
              onClick={() => handleNav("lista-trabajadores")}
            >
              <i className="bi bi-people-fill me-2"></i> Lista Trabajadores
            </Nav.Link>

            {/* ✅ Tickets con badge de notificación */}
            <Nav.Link
              className={`text-white mb-2 ${activeView === "tickets" ? "fw-bold" : ""}`}
              onClick={() => handleNav("tickets")}
              style={{ position: "relative" }}
            >
              <FaTicketAlt className="me-2" /> Tickets
              {ticketsNuevos > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 8,
                    background: "#ef4444",
                    color: "#fff",
                    borderRadius: "50%",
                    fontSize: 10,
                    fontWeight: 700,
                    minWidth: 18,
                    height: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px",
                  }}
                >
                  {ticketsNuevos > 99 ? "99+" : ticketsNuevos}
                </span>
              )}
            </Nav.Link>

            <Nav.Link
              className={`text-white mb-2 ${activeView === "reportes" ? "fw-bold" : ""}`}
              onClick={() => handleNav("reportes")}
            >
              <FaChartBar className="me-2" /> Reportes
            </Nav.Link>

            <Nav.Link
              className={`text-white mb-2 ${activeView === "config" ? "fw-bold" : ""}`}
              onClick={() => handleNav("config")}
            >
              <FaCogs className="me-2" /> Configuración
            </Nav.Link>
          </Nav>
          <LogoutButton />
        </div>

        {/* ── Main Content ── */}
        <div
          className="flex-grow-1 m-1 p-2 navbar-main-content"
          style={{ minWidth: 0 }}
        >
          <Navbar bg="light" className="shadow-sm px-2">
            <Button
              variant="outline-primary"
              className="d-lg-none me-3"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </Button>
            <Navbar.Brand className="text-truncate">
              Bienvenido <strong>{nombre}</strong>{" "}
              <i className="bi bi-person-check"></i>
            </Navbar.Brand>
          </Navbar>

          <Container
            fluid
            className="p-3 p-md-4"
            style={{ background: "#f5f6fa" }}
          >
            {/* HOME */}
            {activeView === "home" && (
              <>
                <Row className="mb-4 justify-content-center g-3">
                  <Col xs={12} sm={6} xl={5}>
                    <CantidadUsuarios />
                  </Col>
                  <Col xs={12} sm={6} xl={5}>
                    <ContadorAsistenciasDiarias />
                  </Col>
                </Row>

                <Row className="g-3">
                  <Col xs={12} sm={6} lg={4}>
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

                  {/* ✅ Card tickets con badge */}
                  <Col xs={12} sm={6} lg={4}>
                    <Card className="shadow-sm border-0 h-100">
                      <Card.Body style={{ position: "relative" }}>
                        {ticketsNuevos > 0 && (
                          <span
                            style={{
                              position: "absolute",
                              top: 12,
                              right: 12,
                              background: "#ef4444",
                              color: "#fff",
                              borderRadius: "50%",
                              fontSize: 11,
                              fontWeight: 700,
                              minWidth: 22,
                              height: 22,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "0 4px",
                            }}
                          >
                            {ticketsNuevos}
                          </span>
                        )}
                        <FaTicketAlt size={40} className="text-danger mb-3" />
                        <Card.Title>Tickets de Pago</Card.Title>
                        <Card.Text>
                          Gestiona los tickets de remuneración enviados por los
                          trabajadores.
                        </Card.Text>
                        <Button
                          variant="danger"
                          onClick={() => handleNav("tickets")}
                        >
                          Ver Tickets{" "}
                          {ticketsNuevos > 0 && `(${ticketsNuevos} nuevos)`}
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col xs={12} sm={6} lg={4}>
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

                  <Col xs={12} sm={6} lg={4}>
                    <Card className="shadow-sm border-0 h-100">
                      <Card.Body>
                        <FaCogs size={40} className="text-warning mb-3" />
                        <Card.Title>Configuración</Card.Title>
                        <Card.Text>
                          Ajusta turnos, tolerancias y feriados del sistema.
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
                <Suspense fallback={fallback}>
                  {activeUserView === "form" && <GestionUsuarios />}
                  {activeUserView === "list" && <ListUser />}
                </Suspense>
              </>
            )}

            {/* LISTA TRABAJADORES */}
            {activeView === "lista-trabajadores" && (
              <Suspense fallback={fallback}>
                <ListaTrabajadores />
              </Suspense>
            )}

            {/* ✅ TICKETS */}
            {activeView === "tickets" && (
              <Suspense fallback={fallback}>
                <div className="d-flex align-items-center gap-2 mb-4">
                  <FaTicketAlt size={24} className="text-danger" />
                  <h4 className="mb-0">Tickets de Remuneración</h4>
                  {ticketsNuevos > 0 && (
                    <span className="badge bg-danger">
                      {ticketsNuevos} nuevos
                    </span>
                  )}
                </div>
                <ReceptorTickets />
              </Suspense>
            )}

            {/* REPORTES */}
            {activeView === "reportes" && (
              <Suspense fallback={fallback}>
                <ReporteAsistencia />
              </Suspense>
            )}

            {/* CONFIGURACIÓN */}
            {activeView === "config" && (
              <Suspense fallback={fallback}>
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
