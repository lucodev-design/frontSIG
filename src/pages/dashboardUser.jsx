// src/pages/DashboardUser.jsx
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
  Alert,
  Modal,
  Table,
} from "react-bootstrap";
import { FaUser, FaClock, FaLifeRing, FaHome, FaInfoCircle } from "react-icons/fa";
import LogoutButton from "../components/logout";
import { getAsistenciasByUser, marcarAsistencia } from "../api/api";
import "../templates/styles/DashAdmin.css"; // mismo CSS que usa Admin

// Lazy load de los módulos
const Perfil = lazy(() => import("../pages/UserPages/PerfilUser"));
const MisAsistencias = lazy(() => import("../pages/UserPages/MisAsistencias"));
const Soporte = lazy(() => import("../pages/UserPages/SoporteUser"));

const DashboardUser = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [activeModule, setActiveModule] = useState("inicio");
  const [asistencias, setAsistencias] = useState([]);
  const [cargandoAsistencias, setCargandoAsistencias] = useState(true);
  const [errorAsistencias, setErrorAsistencias] = useState(null);

  const [registrando, setRegistrando] = useState(false);
  const [registroMensaje, setRegistroMensaje] = useState({ type: null, text: null });

  const [activityModal, setActivityModal] = useState({ show: false, data: null });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 1) Validación de sesión
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    try {
      const userObj = JSON.parse(storedUser);

      if (userObj && (userObj.id_usuario || userObj.id)) {
        // Acepta ambas formas (id or id_usuario) para compatibilidad
        if (!userObj.id_usuario && userObj.id) userObj.id_usuario = userObj.id;
        setUsuario(userObj);
      } else {
        console.error("Usuario almacenado incompleto (falta id_usuario). Forzando logout.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("rol");
        navigate("/login");
      }
    } catch (err) {
      console.error("Error al leer usuario desde localStorage:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("rol");
      navigate("/login");
    }
  }, [navigate]);

  // 2) Lógica de asistencias (sin recarga automática)
  const fetchAsistencias = async () => {
    if (!usuario?.id_usuario) return;
    try {
      setCargandoAsistencias(true);
      const data = await getAsistenciasByUser(usuario.id_usuario);
      const asistenciasList = Array.isArray(data) ? data : data.asistencias || [];
      setAsistencias(asistenciasList);
      setErrorAsistencias(null);
    } catch (err) {
      console.error("❌ Error al obtener asistencias:", err);
      setErrorAsistencias("No se pudieron cargar las asistencias.");
    } finally {
      setCargandoAsistencias(false);
    }
  };

  useEffect(() => {
    if (usuario?.id_usuario) {
      fetchAsistencias();
      // Recarga automática eliminada
    }
  }, [usuario]);

  useEffect(() => {
    if (registroMensaje.text) {
      const timer = setTimeout(() => setRegistroMensaje({ type: null, text: null }), 5000);
      return () => clearTimeout(timer);
    }
  }, [registroMensaje]);

  const handleMarcarAsistencia = async () => {
    if (!usuario?.id_usuario) {
      setRegistroMensaje({ type: "danger", text: "❌ Error de sesión: ID de usuario no disponible." });
      return;
    }
    setRegistroMensaje({ type: null, text: null });
    try {
      setRegistrando(true);
      const qrCode = usuario.qr_code || "default_qr";
      const turno = usuario.turno || "diurno";
      const response = await marcarAsistencia(qrCode, turno);

      setRegistroMensaje({
        type: "success",
        text: response?.message || "✅ Asistencia registrada correctamente.",
      });

      await fetchAsistencias();
    } catch (err) {
      console.error("❌ Error al registrar asistencia:", err);
      const errorText = err.response?.data?.message || err.message || "Error al registrar asistencia.";
      setRegistroMensaje({ type: "danger", text: errorText });
    } finally {
      setRegistrando(false);
    }
  };

  // 3) UI handlers
  const handleSidebarClick = (module) => {
    setActiveModule(module);
    setSidebarOpen(false);
  };

  const handleShowActivity = (asistencia) => setActivityModal({ show: true, data: asistencia });
  const handleCloseActivity = () => setActivityModal({ show: false, data: null });

  // Cerrar sidebar al hacer scroll (comportamiento igual que admin)
  useEffect(() => {
    const handleScroll = () => {
      if (sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sidebarOpen]);

  // Render inicio (cards similares a admin)
  const renderInicio = () => (
    <Container fluid className="p-4" style={{ background: "#f5f6fa" }}>
      {/* Mensaje */}
      {registroMensaje.text && (
        <Alert variant={registroMensaje.type} className="mb-4 rounded-3 shadow-sm">
          {registroMensaje.text}
        </Alert>
      )}

      {/* Small summary cards (alineado al Admin) */}
      <Row className="mb-4">
        <Col md={4} sm={12} className="mb-3">
          <Card className="shadow-sm border-0 h-100 rounded-3">
            <Card.Body>
              <h6 className="text-muted">Nombre</h6>
              <h3 className="text-primary">{usuario?.nombre || "Trabajador"}</h3>
              <div className="text-muted text-truncate">{usuario?.email}</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} sm={12} className="mb-3">
          <Card className="shadow-sm border-0 h-100 rounded-3">
            <Card.Body>
              <h6 className="text-muted">Asistencias Registradas</h6>
              <h3 className="text-success">{asistencias.length}</h3>
              <div className="text-muted">Últimos registros: {Math.min(asistencias.length, 5)}</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} sm={12} className="mb-3">
          <Card className="shadow-sm border-0 h-100 rounded-3">
            <Card.Body>
              <h6 className="text-muted">Estado</h6>
              <h3 className="text-warning">Activo</h3>
              <div className="text-muted">Turno: {usuario?.turno || "diurno"}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tarjetas principales (perfil, resumen descuentos, asistencias) */}
      <Row>
        <Col md={4} sm={12} className="mb-3">
          <Card className="shadow-sm border-0 h-100 rounded-3">
            <Card.Body>
              <FaUser size={40} className="text-primary mb-3" />
              <Card.Title className="text-primary">Mi Perfil</Card.Title>
              <Card.Text style={{ whiteSpace: "pre-line" }}>
                <strong>Nombre:</strong> {usuario?.nombre} {usuario?.apellidos}{"\n"}
                <strong>Correo:</strong> {usuario?.email}{"\n"}
                <strong>Rol:</strong> {usuario?.rol || "Trabajador"}
              </Card.Text>
              <Button variant="outline-primary" size="sm" onClick={() => handleSidebarClick("perfil")}>
                Ver Perfil Completo
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} sm={12} className="mb-3">
          <Card className="shadow-sm border-0 h-100 rounded-3">
            <Card.Body>
              <h5 className="text-success mb-3">Resumen de Descuentos (Últimos 5)</h5>
              {cargandoAsistencias ? (
                <Spinner animation="border" variant="primary" size="sm" />
              ) : asistencias.length === 0 ? (
                <Alert variant="info" className="mb-0">
                  No hay asistencias recientes registradas.
                </Alert>
              ) : (
                <ul className="list-group list-group-flush">
                  {asistencias.slice(0, 5).map((a, i) => (
                    <li
                      key={a.id_asistencia || i}
                      className="list-group-item d-flex justify-content-between align-items-center py-2 px-2"
                      style={{ wordBreak: "break-word" }}
                    >
                      <div className="text-truncate">
                        <strong className="text-muted">{a.fecha}</strong> - {a.turno || "-"}
                      </div>
                      <span className={`badge ${a.descuento > 0 ? "bg-danger" : "bg-success"} rounded-pill`}>
                        {a.descuento ? `${a.descuento}%` : "0%"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} sm={12} className="mb-3">
          <Card className="shadow-sm border-0 h-100 rounded-3">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <FaClock size={35} className="text-success me-2" />
                <h5 className="m-0">Mis Asistencias</h5>
              </div>

              <Button
                variant="primary"
                className="mb-3 w-100 shadow-sm"
                onClick={handleMarcarAsistencia}
                disabled={registrando || !usuario?.id_usuario}
              >
                {registrando ? <Spinner animation="border" size="sm" className="me-2" /> : "Marcar Entrada/Salida"}
              </Button>

              {cargandoAsistencias ? (
                <div className="text-center">
                  <Spinner animation="border" variant="primary" size="sm" />
                </div>
              ) : errorAsistencias ? (
                <Alert variant="danger" size="sm" className="mb-0">
                  {errorAsistencias}
                </Alert>
              ) : asistencias.length === 0 ? (
                <Alert variant="warning" size="sm" className="mb-0">
                  Aún no hay registros de asistencia.
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table striped hover size="sm" bordered className="text-center mb-0 align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th>Fecha</th>
                        <th>Entrada</th>
                        <th>Detalle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asistencias.slice(0, 5).map((a, i) => (
                        <tr key={a.id_asistencia || i}>
                          <td className="align-middle">{a.fecha}</td>
                          <td className="align-middle">{a.hora_entrada || "-"}</td>
                          <td className="align-middle">
                            <Button size="sm" variant="info" onClick={() => handleShowActivity(a)}>
                              <FaInfoCircle size={14} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal */}
      <Modal show={activityModal.show} onHide={handleCloseActivity} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Detalle de Actividad</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {activityModal.data && (
            <Table striped bordered size="sm" className="mb-0">
              <tbody>
                <tr>
                  <td className="fw-bold">Fecha:</td>
                  <td>{activityModal.data.fecha}</td>
                </tr>
                <tr>
                  <td className="fw-bold">Hora Entrada:</td>
                  <td>{activityModal.data.hora_entrada || "N/A"}</td>
                </tr>
                <tr>
                  <td className="fw-bold">Hora Salida:</td>
                  <td>{activityModal.data.hora_salida || "N/A"}</td>
                </tr>
                <tr>
                  <td className="fw-bold">Turno:</td>
                  <td>{activityModal.data.turno || "N/A"}</td>
                </tr>
                <tr>
                  <td className="fw-bold">Descuento:</td>
                  <td>{activityModal.data.descuento ? `${activityModal.data.descuento}%` : "0%"}</td>
                </tr>
                <tr>
                  <td className="fw-bold">Estado:</td>
                  <td>{activityModal.data.estado || "N/A"}</td>
                </tr>
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseActivity}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );

  // Render dinámico de módulos con Suspense
  const renderModule = () => {
    const fallback = (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Cargando módulo...</p>
      </div>
    );

    if (!usuario?.id_usuario) return renderInicio();

    switch (activeModule) {
      case "perfil":
        return (
          <Suspense fallback={fallback}>
            <Perfil usuario={usuario} />
          </Suspense>
        );
      case "asistencias":
        return (
          <Suspense fallback={fallback}>
            <MisAsistencias usuario={usuario} />
          </Suspense>
        );
      case "soporte":
        return (
          <Suspense fallback={fallback}>
            <Soporte usuario={usuario} />
          </Suspense>
        );
      default:
        return renderInicio();
    }
  };

  // Mientras carga el usuario
  if (!usuario) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <Spinner animation="border" variant="primary" />
        <p className="ms-3 mt-2">Cargando Trabajador...</p>
      </div>
    );
  }

  // Layout principal (estética igual a DashboardAdmin)
  return (
    <div className="body-content">
      <div className="d-block d-md-flex" style={{ minHeight: "100vh", background: "rgba(255,255,255,0.5)" }}>
        {/* Sidebar */}
        <div className={`sidebar d-flex flex-column p-3 ${sidebarOpen ? "open" : ""}`}>
          <h3 className="text-center mb-4">Panel Trabajador</h3>
          <Nav className="flex-column nav-list">
            <Nav.Link
              className="text-white mb-2"
              onClick={() => {
                handleSidebarClick("inicio");
              }}
            >
              <FaHome className="me-2" /> Inicio
            </Nav.Link>

            <Nav.Link
              className="text-white mb-2"
              onClick={() => {
                handleSidebarClick("perfil");
              }}
            >
              <FaUser className="me-2" /> Perfil
            </Nav.Link>

            <Nav.Link
              className="text-white mb-2"
              onClick={() => {
                handleSidebarClick("asistencias");
              }}
            >
              <FaClock className="me-2" /> Mis Asistencias
            </Nav.Link>

            <Nav.Link
              className="text-white mb-2"
              onClick={() => {
                handleSidebarClick("soporte");
              }}
            >
              <FaLifeRing className="me-2" /> Soporte
            </Nav.Link>

            
          </Nav>
          <LogoutButton />
          <Button variant="outline-light" className="mt-auto d-lg-none" onClick={() => setSidebarOpen(false)}>
            Cerrar menú ✖
          </Button>
        </div>

        {/* Main content */}
        <div className="flex-grow-1 m-1 p-2 navbar-main-content">
          <Navbar bg="light" className="shadow-sm">
            <Button variant="outline-primary" className="d-lg-none me-3" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </Button>
            <Navbar.Brand>
              Bienvenido <strong>{usuario.nombre} {usuario.apellidos}</strong> 👋
            </Navbar.Brand>
          </Navbar>

          <Container fluid className="p-4" style={{ background: "#f5f6fa" }}>
            {renderModule()}
          </Container>
        </div>
      </div>
    </div>
  );
};

export default DashboardUser;
