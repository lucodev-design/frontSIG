import React, { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import {  Container,  Row,  Col,  Card,  Button,  Navbar,  Nav,  Spinner,} from "react-bootstrap";
import {  FaGlobe,  FaUsers,  FaBuilding,  FaCogs,  FaChartLine,  FaAngleDown,  FaAngleUp,  FaUserPlus, FaList,  FaHome, } from "react-icons/fa";
import "../templates/styles/DashAdmin.css";
import LogoutButton from "../components/logout.jsx";

// Lazy loads
const GestionUsuarios = lazy(() =>
  import("../pages/AdminPages/GestionUsuario.jsx")
);
const ListUser = lazy(() =>
  import("../pages/AdminPages/ListUser.jsx")
);
const GestionSedes = lazy(() =>
  import("../pages/SuperAdminPages/GestionSedesSuperAdmin.jsx")
);
const GestionRoles = lazy(() =>
  import("../pages/SuperAdminPages/GestionRolesSuperAdmin.jsx")
);
const ConfiguracionGlobal = lazy(() =>
  import("../pages/AdminPages/ConfiguracionGlobal.jsx")
);
const ReportesGenerales = lazy(() =>
  import("./SuperAdminPages/ReportesGenerales.jsx")
);

// COMPONENTES PARA ADMINISTRADORES
const CrearAdmin = lazy(() =>
  import("../pages/SuperAdminPages/CrearAdmin.jsx")
);
const ListaAdmins = lazy(() =>
  import("../pages/SuperAdminPages/ListAdmin.jsx")
);

const AggUsuario = lazy(() => import("../pruebasHooks/AggUsuario"));

const DashboardSuperAdmin = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [activeView, setActiveView] = useState("home");
  const [activeAdminView, setActiveAdminView] = useState("form");
  const [activeUserView, setActiveUserView] = useState("form"); // Nuevo estado para trabajadores
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Estado del submenú Gestión
  const [gestionOpen, setGestionOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const userObj = JSON.parse(userData);
        setNombre(`${userObj.nombre || ""} ${userObj.apellidos || ""}`);
      } catch (err) {
        console.error("Error parsing user from localStorage", err);
        setNombre("Super Administrador");
      }
    } else {
      navigate("/login");
    }

    // Cerrar sidebar al hacer scroll
    const handleScroll = () => {
      if (sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navigate, sidebarOpen]);

  const handleSidebarClick = (view) => {
    setActiveView(view);
    setSidebarOpen(false);
  };

  return (
    <div className="body-content">
      <div
        className="d-block d-md-flex conta"
        style={{ minHeight: "100vh", background: "rgba(255,255,255,0.5)" }}
      >
        {/* Sidebar */}
        <div
          className={`sidebar d-flex flex-column p-3 ${
            sidebarOpen ? "open" : ""
          }`}
        >
          <h3 className="text-center mb-4">Super Admin</h3>

          <Nav className="flex-column nav-list">
            {/* Home */}
            <Nav.Link
              className={`text-white mb-2 ${
                activeView === "home" ? "active" : ""
              }`}
              onClick={() => handleSidebarClick("home")}
            >
              <FaHome className="me-2" /> Panel Principal
            </Nav.Link>

            {/* Usuarios o trabajadores */}
            <Nav.Link
              className={`text-white mb-2 ${
                activeView === "usuarios" ? "active" : ""
              }`}
              onClick={() => handleSidebarClick("usuarios")}
            >
              <FaUsers className="me-2" /> Gestión de Trabajadores
            </Nav.Link>

            {/* Gestión de Administradores */}
            <Nav.Link
              className={`text-white mb-2 ${
                activeView === "gestionAdmins" ? "active" : ""
              }`}
              onClick={() => handleSidebarClick("gestionAdmins")}
            >
              <FaUsers className="me-2" /> Gestión de Administradores
            </Nav.Link>

            {/* GESTIÓN GENERAL */}
            <div>
              <Nav.Link
                className={`text-white mb-2 d-flex justify-content-between align-items-center ${
                  gestionOpen ? "active" : ""
                }`}
                onClick={() => setGestionOpen(!gestionOpen)}
                style={{ cursor: "pointer" }}
              >
                <span>
                  <FaBuilding className="me-2" /> Gestión
                </span>
                {gestionOpen ? <FaAngleUp /> : <FaAngleDown />}
              </Nav.Link>

              {/* SUBMENÚ */}
              {gestionOpen && (
                <div className="ms-4">
                  <Nav.Link
                    className={`text-white mb-2 ${
                      activeView === "sedes" ? "active" : ""
                    }`}
                    onClick={() => handleSidebarClick("sedes")}
                  >
                    • Sedes
                  </Nav.Link>

                  <Nav.Link
                    className={`text-white mb-2 ${
                      activeView === "roles" ? "active" : ""
                    }`}
                    onClick={() => handleSidebarClick("roles")}
                  >
                    • Roles
                  </Nav.Link>
                </div>
              )}
            </div>

            {/* Config avanzada */}
            <Nav.Link
              className={`text-white mb-2 ${
                activeView === "configuracionesAdmin" ? "active" : ""
              }`}
              onClick={() => handleSidebarClick("configuracionesAdmin")}
            >
              <FaCogs className="me-2" /> Config. Avanzadas
            </Nav.Link>

            {/* Config global */}
            <Nav.Link
              className={`text-white mb-2 ${
                activeView === "config" ? "active" : ""
              }`}
              onClick={() => handleSidebarClick("config")}
            >
              <FaCogs className="me-2" /> Configuración Global
            </Nav.Link>

            {/* Reportes */}
            <Nav.Link
              className={`text-white mb-2 ${
                activeView === "reportes" ? "active" : ""
              }`}
              onClick={() => handleSidebarClick("reportes")}
            >
              <FaChartLine className="me-2" /> Reportes Generales
            </Nav.Link>

            
          </Nav>

          <LogoutButton />

          <Button
            variant="outline-light"
            className="mt-auto d-lg-none"
            onClick={() => setSidebarOpen(false)}
          >
            Cerrar menú ✖
          </Button>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="flex-grow-1 m-1 p-2 navbar-main-content">
          <Navbar bg="light" className="shadow-sm">
            <Button
              variant="outline-primary"
              className="d-lg-none me-3"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </Button>
            <Navbar.Brand>
              Bienvenido <strong>{nombre}</strong> 
            </Navbar.Brand>
          </Navbar>

          <Container fluid className="p-4" style={{ background: "#f5f6fa" }}>
            {/* HOME - Estilo de Tarjetas */}
            {activeView === "home" && (
              <>
                <Row className="mb-4">
                  <Col md={4}>
                    <Card className="shadow-sm border-0">
                      <Card.Body>
                        <h6 className="text-muted">Total de Sedes</h6>
                        <h3 className="text-primary">5</h3>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="shadow-sm border-0">
                      <Card.Body>
                        <h6 className="text-muted">Total de Administradores</h6>
                        <h3 className="text-success">12</h3>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="shadow-sm border-0">
                      <Card.Body>
                        <h6 className="text-muted">Total de Trabajadores</h6>
                        <h3 className="text-warning">500</h3>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Row>
                  <Col md={4} className="mb-3">
                    <Card className="shadow-sm border-0 h-100">
                      <Card.Body>
                        <FaUsers size={40} className="text-primary mb-3" />
                        <Card.Title>Gestión de Administradores</Card.Title>
                        <Card.Text>
                          Registrar, editar y ver la lista de administradores del sistema.
                        </Card.Text>
                        <Button
                          variant="primary"
                          onClick={() => handleSidebarClick("gestionAdmins")}
                        >
                          Gestionar Admins
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={4} className="mb-3">
                    <Card className="shadow-sm border-0 h-100">
                      <Card.Body>
                        <FaBuilding size={40} className="text-success mb-3" />
                        <Card.Title>Gestión de Sedes y Roles</Card.Title>
                        <Card.Text>
                          Administra las ubicaciones (Sedes) y los cargos (Roles) de la organización.
                        </Card.Text>
                        <Button
                          variant="success"
                          onClick={() => {
                            setActiveView("sedes");
                            setGestionOpen(true);
                          }}
                        >
                          Gestionar Sedes
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={4} className="mb-3">
                    <Card className="shadow-sm border-0 h-100">
                      <Card.Body>
                        <FaCogs size={40} className="text-warning mb-3" />
                        <Card.Title>Configuración Global</Card.Title>
                        <Card.Text>
                          Ajustes globales que afectan a todas las sedes y administradores.
                        </Card.Text>
                        <Button
                          variant="warning"
                          onClick={() => handleSidebarClick("config")}
                        >
                          Configurar
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </>
            )}

            {/* GESTIÓN DE TRABAJADORES - Con botones como en Admin Dashboard */}
            {activeView === "usuarios" && (
              <>
                <div className="mb-3 d-flex gap-2 flex-wrap">
                  <Button
                    variant={
                      activeUserView === "form" ? "primary" : "outline-primary"
                    }
                    onClick={() => setActiveUserView("form")}
                  >
                    <FaUserPlus className="me-1" /> Registrar Trabajador
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

            {/* GESTIÓN DE ADMINISTRADORES */}
            {activeView === "gestionAdmins" && (
              <>
                <div className="mb-3 d-flex gap-2 flex-wrap">
                  <Button
                    variant={
                      activeAdminView === "form" ? "primary" : "outline-primary"
                    }
                    onClick={() => setActiveAdminView("form")}
                  >
                    <FaUserPlus className="me-1" /> Registrar Administrador
                  </Button>
                  <Button
                    variant={
                      activeAdminView === "list" ? "primary" : "outline-primary"
                    }
                    onClick={() => setActiveAdminView("list")}
                  >
                    <FaList className="me-1" /> Lista de Administradores
                  </Button>
                </div>

                <Suspense
                  fallback={
                    <div className="text-center py-5">
                      <Spinner animation="border" />
                    </div>
                  }
                >
                  {activeAdminView === "form" && <CrearAdmin />}
                  {activeAdminView === "list" && <ListaAdmins />}
                </Suspense>
              </>
            )}

            {/* SEDES */}
            {activeView === "sedes" && (
              <Suspense fallback={<Spinner animation="border" className="d-block mx-auto mt-5" />}>
                <GestionSedes />
              </Suspense>
            )}

            {/* ROLES */}
            {activeView === "roles" && (
              <Suspense fallback={<Spinner animation="border" className="d-block mx-auto mt-5" />}>
                <GestionRoles />
              </Suspense>
            )}

            {/* CONFIG AVANZADAS */}
            {activeView === "configuracionesAdmin" && (
              <Suspense fallback={<Spinner animation="border" className="d-block mx-auto mt-5" />}>
                <AggUsuario />
              </Suspense>
            )}

            {/* CONFIG GLOBAL */}
            {activeView === "config" && (
              <Suspense fallback={<Spinner animation="border" className="d-block mx-auto mt-5" />}>
                <ConfiguracionGlobal />
              </Suspense>
            )}

            {/* REPORTES */}
            {activeView === "reportes" && (
              <Suspense fallback={<Spinner animation="border" className="d-block mx-auto mt-5" />}>
                <ReportesGenerales />
              </Suspense>
            )}
          </Container>
        </div>
      </div>
    </div>
  );
};

export default DashboardSuperAdmin;