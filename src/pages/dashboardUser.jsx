// src/pages/DashboardUser.jsx
import React, { useEffect, useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Navbar, Nav, Spinner, Alert, Modal, Table } from "react-bootstrap";
import { FaUser, FaClock, FaLifeRing, FaHome, FaInfoCircle } from "react-icons/fa";
import LogoutButton from "../components/logout";
import { getAsistenciasByUser, marcarAsistencia } from "../api/api";
import "../templates/styles/DashAdmin.css";

// ─── Lazy loads ───────────────────────────────────────────────
const Perfil         = lazy(() => import("../pages/UserPages/PerfilUser"));
const Soporte        = lazy(() => import("../pages/UserPages/SoporteUser"));
const MisAsistencias = lazy(() => import("../pages/UserPages/MisAsistencias"));

// ─── Helpers de formato (zona horaria Perú) ───────────────────
const LOCALE = "es-PE";
const TZ     = "America/Lima";

const formatSoloFecha = (valor) => {
  if (!valor) return "-";
  try {
    return new Date(valor).toLocaleDateString(LOCALE, {
      timeZone: TZ,
      day:   "2-digit",
      month: "2-digit",
      year:  "numeric",
    });
  } catch { return valor; }
};

const formatSoloHora = (valor) => {
  if (!valor) return "-";
  try {
    return new Date(valor).toLocaleTimeString(LOCALE, {
      timeZone: TZ,
      hour:   "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch { return valor; }
};

const formatFechaHora = (valor) => {
  if (!valor) return "-";
  try {
    return new Date(valor).toLocaleString(LOCALE, {
      timeZone: TZ,
      day:      "2-digit",
      month:    "2-digit",
      year:     "numeric",
      hour:     "2-digit",
      minute:   "2-digit",
      hour12:   true,
    });
  } catch { return valor; }
};

// ─── Componente principal ─────────────────────────────────────
const DashboardUser = () => {
  const navigate = useNavigate();

  const [usuario,             setUsuario]             = useState(null);
  const [activeModule,        setActiveModule]        = useState("inicio");
  const [asistencias,         setAsistencias]         = useState([]);
  const [cargandoAsistencias, setCargandoAsistencias] = useState(true);
  const [errorAsistencias,    setErrorAsistencias]    = useState(null);
  const [registrando,         setRegistrando]         = useState(false);
  const [registroMensaje,     setRegistroMensaje]     = useState({ type: null, text: null });
  const [activityModal,       setActivityModal]       = useState({ show: false, data: null });
  const [sidebarOpen,         setSidebarOpen]         = useState(false);

  const primerNombre   = usuario?.nombre?.split(" ")[0]   || "";
  const primerApellido = usuario?.apellidos?.split(" ")[0] || "";

  // ── Validación de sesión ──────────────────────────────────
  useEffect(() => {
    const token      = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) { navigate("/login"); return; }

    try {
      const userObj = JSON.parse(storedUser);
      if (userObj && (userObj.id_usuario || userObj.id)) {
        if (!userObj.id_usuario && userObj.id) userObj.id_usuario = userObj.id;
        setUsuario(userObj);
      } else {
        ["token", "user", "rol"].forEach(k => localStorage.removeItem(k));
        navigate("/login");
      }
    } catch {
      ["token", "user", "rol"].forEach(k => localStorage.removeItem(k));
      navigate("/login");
    }
  }, [navigate]);

  // ── Fetch asistencias ─────────────────────────────────────
  const fetchAsistencias = async () => {
    if (!usuario?.id_usuario) return;
    try {
      setCargandoAsistencias(true);
      const data = await getAsistenciasByUser(usuario.id_usuario);
      const lista = Array.isArray(data) ? data : data.asistencias || [];
      setAsistencias(lista);
      setErrorAsistencias(null);
    } catch {
      setErrorAsistencias("No se pudieron cargar las asistencias.");
    } finally {
      setCargandoAsistencias(false);
    }
  };

  useEffect(() => {
    if (usuario?.id_usuario) fetchAsistencias();
  }, [usuario]);

  // ── Auto-ocultar mensaje tras 5s ──────────────────────────
  useEffect(() => {
    if (!registroMensaje.text) return;
    const t = setTimeout(() => setRegistroMensaje({ type: null, text: null }), 5000);
    return () => clearTimeout(t);
  }, [registroMensaje]);

  // ── Marcar asistencia ─────────────────────────────────────
  const handleMarcarAsistencia = async () => {
    if (!usuario?.id_usuario) {
      setRegistroMensaje({ type: "danger", text: "❌ Error de sesión: ID de usuario no disponible." });
      return;
    }
    setRegistroMensaje({ type: null, text: null });
    try {
      setRegistrando(true);
      const response = await marcarAsistencia(
        usuario.qr_code || "default_qr",
        usuario.turno   || "diurno"
      );
      setRegistroMensaje({
        type: "success",
        text: response?.message || "✅ Asistencia registrada correctamente.",
      });
      await fetchAsistencias();
    } catch (err) {
      setRegistroMensaje({
        type: "danger",
        text: err.response?.data?.message || err.message || "Error al registrar asistencia.",
      });
    } finally {
      setRegistrando(false);
    }
  };

  // ── UI handlers ───────────────────────────────────────────
  const handleSidebarClick  = (mod) => { setActiveModule(mod); setSidebarOpen(false); };
  const handleShowActivity  = (a)   => setActivityModal({ show: true,  data: a });
  const handleCloseActivity = ()    => setActivityModal({ show: false, data: null });

  useEffect(() => {
    const onScroll = () => { if (sidebarOpen) setSidebarOpen(false); };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [sidebarOpen]);

  // ── Render Inicio ─────────────────────────────────────────
  const renderInicio = () => (
    <Container fluid className="p-3 p-md-4" style={{ background: "#f5f6fa" }}>

      {registroMensaje.text && (
        <Alert variant={registroMensaje.type} className="mb-4 rounded-3 shadow-sm">
          {registroMensaje.text}
        </Alert>
      )}

      {/* ── Fila superior: Asistencias · Perfil ── */}
      <Row className="mb-4 g-3">

        {/* ✅ Card de Nombre eliminado — solo quedan 2 cards en md={6} */}
        <Col xs={12} sm={6} md={6}>
          <Card className="shadow-sm border-0 h-100 rounded-3">
            <Card.Body>
              <h6 className="text-muted">Asistencias Registradas</h6>
              <h3 className="text-success">{asistencias.length}</h3>
              <div className="text-muted">Últimos registros: {Math.min(asistencias.length, 5)}</div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={6}>
          <Card className="shadow-sm border-0 h-100 rounded-3">
            <Card.Body>
              <FaUser size={36} className="text-primary mb-3" />
              <Card.Title className="text-primary">Mi Perfil</Card.Title>
              <Card.Text style={{ whiteSpace: "pre-line" }}>
                <strong>Nombre:</strong> {primerNombre} {primerApellido}{"\n"}
                <strong>Correo:</strong> {usuario?.email}{"\n"}
                <strong>Rol:</strong>    {usuario?.rol || "Trabajador"}
              </Card.Text>
              <Button
                variant="outline-primary"
                size="sm"
                className="w-100"
                onClick={() => handleSidebarClick("perfil")}
              >
                Ver Perfil Completo
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── Fila inferior: Descuentos · Asistencias ── */}
      <Row className="g-3">

        {/* Resumen de descuentos */}
        <Col xs={12} md={6}>
          <Card className="shadow-sm border-0 h-100 rounded-3">
            <Card.Body>
              <h5 className="text-success mb-3">Resumen de Descuentos (Últimos 5)</h5>

              {cargandoAsistencias ? (
                <Spinner animation="border" variant="primary" size="sm" />
              ) : asistencias.length === 0 ? (
                <Alert variant="info" className="mb-0">No hay asistencias recientes registradas.</Alert>
              ) : (
                <ul className="list-group list-group-flush">
                  {asistencias.slice(0, 5).map((a, i) => (
                    <li
                      key={a.id_asistencia || i}
                      className="list-group-item d-flex justify-content-between align-items-center py-2 px-2"
                      style={{ wordBreak: "break-word" }}
                    >
                      <div className="text-truncate">
                        <strong className="text-muted">{formatSoloFecha(a.fecha)}</strong>
                        {" "}- {a.turno || "-"}
                      </div>
                      {/* ✅ Sin % — solo número con 2 decimales */}
                      <span className={`badge rounded-pill ${a.descuento > 0 ? "bg-danger" : "bg-success"}`}>
                        {parseFloat(a.descuento || 0).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Tabla asistencias + botón marcar */}
        <Col xs={12} md={6}>
          <Card className="shadow-sm border-0 h-100 rounded-3">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <FaClock size={32} className="text-success me-2" />
                <h5 className="m-0">Mis Asistencias</h5>
              </div>

              <Button
                variant="primary"
                className="mb-3 w-100 shadow-sm"
                onClick={handleMarcarAsistencia}
                disabled={registrando || !usuario?.id_usuario}
              >
                {registrando
                  ? <><Spinner animation="border" size="sm" className="me-2" />Registrando...</>
                  : "Marcar Entrada/Salida"}
              </Button>

              {cargandoAsistencias ? (
                <div className="text-center">
                  <Spinner animation="border" variant="primary" size="sm" />
                </div>
              ) : errorAsistencias ? (
                <Alert variant="danger" className="mb-0">{errorAsistencias}</Alert>
              ) : asistencias.length === 0 ? (
                <Alert variant="warning" className="mb-0">Aún no hay registros de asistencia.</Alert>
              ) : (
                <div className="table-responsive">
                  <Table striped hover bordered size="sm" className="text-center mb-0 align-middle">
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
                          <td className="align-middle">{formatSoloFecha(a.fecha)}</td>
                          <td className="align-middle">{formatSoloHora(a.hora_entrada)}</td>
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

      {/* ── Modal detalle ── */}
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
                  <td>{formatSoloFecha(activityModal.data.fecha)}</td>
                </tr>
                <tr>
                  <td className="fw-bold">Hora Entrada:</td>
                  <td>{formatSoloHora(activityModal.data.hora_entrada)}</td>
                </tr>
                <tr>
                  <td className="fw-bold">Hora Salida:</td>
                  <td>{formatSoloHora(activityModal.data.hora_salida)}</td>
                </tr>
                <tr>
                  <td className="fw-bold">Turno:</td>
                  <td>{activityModal.data.turno || "N/A"}</td>
                </tr>
                <tr>
                  <td className="fw-bold">Descuento:</td>
                  {/* ✅ Sin % — solo número con 2 decimales */}
                  <td>{parseFloat(activityModal.data.descuento || 0).toFixed(2)}</td>
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
          <Button variant="secondary" onClick={handleCloseActivity}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );

  // ── Render módulo activo ──────────────────────────────────
  const renderModule = () => {
    const fallback = (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Cargando módulo...</p>
      </div>
    );

    if (!usuario?.id_usuario) return renderInicio();

    switch (activeModule) {
      case "inicio":
        return renderInicio();
      case "perfil":
        return (
          <Suspense fallback={fallback}>
            <Perfil usuario={usuario} AsistenciasComponent={MisAsistencias} />
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

  // ── Loading inicial ───────────────────────────────────────
  if (!usuario) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <Spinner animation="border" variant="primary" />
        <p className="ms-3 mt-2">Cargando Trabajador...</p>
      </div>
    );
  }

  // ── Layout principal ──────────────────────────────────────
  return (
    <div className="body-content">
      <div className="d-block d-md-flex" style={{ minHeight: "100vh", background: "rgba(255,255,255,0.5)" }}>

        {/* Sidebar */}
        <div className={`sidebar d-flex flex-column p-3 ${sidebarOpen ? "open" : ""}`}>
          <h3 className="text-center mb-4">Panel Trabajador</h3>
          <Nav className="flex-column nav-list">
            <Nav.Link className="text-white mb-2" onClick={() => handleSidebarClick("inicio")}>
              <FaHome className="me-2" /> Inicio
            </Nav.Link>
            <Nav.Link className="text-white mb-2" onClick={() => handleSidebarClick("perfil")}>
              <FaUser className="me-2" /> Perfil
            </Nav.Link>
            <Nav.Link className="text-white mb-2" onClick={() => handleSidebarClick("soporte")}>
              <FaLifeRing className="me-2" /> Soporte
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

        {/* Contenido principal */}
        <div className="flex-grow-1 m-1 p-2 navbar-main-content">
          <Navbar bg="light" className="shadow-sm px-3">
            <Button
              variant="outline-primary"
              className="d-lg-none me-3"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </Button>
            <Navbar.Brand className="text-truncate" style={{ maxWidth: "70vw" }}>
              Bienvenido <strong>{primerNombre} {primerApellido}</strong> 👋
            </Navbar.Brand>
          </Navbar>

          <Container fluid className="p-3 p-md-4" style={{ background: "#f5f6fa" }}>
            {renderModule()}
          </Container>
        </div>

      </div>
    </div>
  );
};

export default DashboardUser;