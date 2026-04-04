import React, { useEffect, useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { Nav, Spinner, Modal, Table } from "react-bootstrap";
import {
  FaUser,
  FaClock,
  FaLifeRing,
  FaHome,
  FaInfoCircle,
  FaTicketAlt,
} from "react-icons/fa";
import LogoutButton from "../components/logout";
import { getAsistenciasByUser } from "../api/api";

import "../templates/dashboard/dashboardUser-shared.css";

// ── Lazy loads ────────────────────────────────────────────────
const Perfil = lazy(() => import("../pages/UserPages/PerfilUser"));
const Soporte = lazy(() => import("../pages/UserPages/SoporteUser"));
const MisAsistencias = lazy(() => import("../pages/UserPages/MisAsistencias"));
const TicketRemuneracion = lazy(() => import("./UserPages/TicketRemuneracion"));

// ── Helpers ───────────────────────────────────────────────────
const LOCALE = "es-PE";
const TZ = "America/Lima";

const formatFecha = (v) => {
  if (!v) return "-";
  try {
    return new Date(v).toLocaleDateString(LOCALE, {
      timeZone: TZ,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return v;
  }
};
const formatHora = (v) => {
  if (!v) return "-";
  try {
    return new Date(v).toLocaleTimeString(LOCALE, {
      timeZone: TZ,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return v;
  }
};

// ── Stat Card ─────────────────────────────────────────────────
const StatCard = ({ label, value, color, icon: Icon, onClick, subtitle }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }
    let s = 0;
    const step = Math.ceil(value / 30);
    const t = setInterval(() => {
      s += step;
      if (s >= value) {
        setDisplay(value);
        clearInterval(t);
      } else setDisplay(s);
    }, 30);
    return () => clearInterval(t);
  }, [value]);

  return (
    <div
      className="sa-stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className="sa-stat-icon" style={{ background: color }}>
        <Icon size={22} color="#fff" />
      </div>
      <div className="sa-stat-body">
        <span className="sa-stat-label">{label}</span>
        <span className="sa-stat-value">{display.toLocaleString()}</span>
        {subtitle && <span className="sa-stat-sub">{subtitle}</span>}
      </div>
      <div className="sa-stat-bar" style={{ background: color }} />
    </div>
  );
};

// ── Fallback ──────────────────────────────────────────────────
const Fallback = () => (
  <div className="sa-fallback">
    <Spinner animation="border" size="sm" />
    <span>Cargando...</span>
  </div>
);

// ── Badge de estado ───────────────────────────────────────────
const EstadoBadge = ({ descuento }) => {
  const d = parseFloat(descuento || 0);
  return (
    <span className={`ud-badge ${d > 0 ? "ud-badge--red" : "ud-badge--green"}`}>
      S/ {d.toFixed(2)}
    </span>
  );
};

// ── Dashboard User ────────────────────────────────────────────
const DashboardUser = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [activeModule, setActiveModule] = useState("inicio");
  const [asistencias, setAsistencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorAsis, setErrorAsis] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState({ show: false, data: null });

  const primerNombre = usuario?.nombre?.split(" ")[0] || "";
  const primerApellido = usuario?.apellidos?.split(" ")[0] || "";

  // ── Sesión ────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");
    if (!token || !stored) {
      navigate("/login");
      return;
    }
    try {
      const u = JSON.parse(stored);
      if (u && (u.id_usuario || u.id)) {
        if (!u.id_usuario && u.id) u.id_usuario = u.id;
        setUsuario(u);
      } else {
        ["token", "user", "rol"].forEach((k) => localStorage.removeItem(k));
        navigate("/login");
      }
    } catch {
      ["token", "user", "rol"].forEach((k) => localStorage.removeItem(k));
      navigate("/login");
    }
  }, [navigate]);

  // ── Asistencias ───────────────────────────────────────────
  const fetchAsistencias = async () => {
    if (!usuario?.id_usuario) return;
    try {
      setCargando(true);
      const data = await getAsistenciasByUser(usuario.id_usuario);
      setAsistencias(Array.isArray(data) ? data : data.asistencias || []);
      setErrorAsis(null);
    } catch {
      setErrorAsis("No se pudieron cargar las asistencias.");
    } finally {
      setCargando(false);
    }
  };
  useEffect(() => {
    if (usuario?.id_usuario) fetchAsistencias();
  }, [usuario]);

  // ── Scroll cierra sidebar ─────────────────────────────────
  useEffect(() => {
    const fn = () => {
      if (sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, [sidebarOpen]);

  const go = (mod) => {
    setActiveModule(mod);
    setSidebarOpen(false);
  };

  // ── Pantalla de carga inicial ─────────────────────────────
  if (!usuario)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: 12,
          fontFamily: "'Plus Jakarta Sans',sans-serif",
        }}
      >
        <Spinner animation="border" variant="primary" />
        <span>Cargando...</span>
      </div>
    );

  // ── Vista inicio ──────────────────────────────────────────
  const renderInicio = () => (
    <div className="sa-content">
      <div className="sa-page-title">
        <h4>Inicio</h4>
        <span className="sa-page-date">
          {new Date().toLocaleDateString("es-PE", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Stats */}
      <div className="sa-stats-grid">
        <StatCard
          label="Asistencias Registradas"
          value={asistencias.length}
          color="#10b981"
          icon={FaClock}
          subtitle="Total acumulado"
          onClick={() => go("perfil")}
        />
        <StatCard
          label="Descuento Acumulado"
          value={asistencias.reduce(
            (acc, a) => acc + parseFloat(a.descuento || 0),
            0,
          )}
          color="#ef4444"
          icon={FaUser}
          subtitle="S/ en descuentos"
        />
      </div>

      {/* Perfil rápido */}
      <div className="ud-profile-card">
        <div className="ud-profile-avatar">
          {primerNombre.charAt(0)}
          {primerApellido.charAt(0)}
        </div>
        <div className="ud-profile-info">
          <p className="ud-profile-name">
            {primerNombre} {primerApellido}
          </p>
          <p className="ud-profile-email">{usuario?.email}</p>
          <span className="ud-profile-role">
            {usuario?.rol || "Trabajador"}
          </span>
        </div>
        <button className="ud-profile-btn" onClick={() => go("perfil")}>
          Ver perfil completo
        </button>
      </div>

      <h6 className="sa-section-title">Mis últimas asistencias</h6>

      {/* Tabla */}
      <div className="ud-table-card">
        {cargando ? (
          <div className="sa-fallback">
            <Spinner animation="border" size="sm" />
            <span>Cargando asistencias...</span>
          </div>
        ) : errorAsis ? (
          <div className="ud-alert ud-alert--danger">{errorAsis}</div>
        ) : asistencias.length === 0 ? (
          <div className="ud-alert ud-alert--info">
            Aún no hay registros de asistencia.
          </div>
        ) : (
          <div className="ud-table-wrap">
            <table className="ud-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Turno</th>
                  <th>Entrada</th>
                  <th>Descuento</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {asistencias.slice(0, 5).map((a, i) => (
                  <tr key={a.id_asistencia || i}>
                    <td>
                      <strong>{formatFecha(a.fecha)}</strong>
                    </td>
                    <td>
                      <span className="ud-turno-chip">{a.turno || "-"}</span>
                    </td>
                    <td>{formatHora(a.hora_entrada)}</td>
                    <td>
                      <EstadoBadge descuento={a.descuento} />
                    </td>
                    <td>
                      <button
                        className="ud-detail-btn"
                        onClick={() => setModal({ show: true, data: a })}
                      >
                        <FaInfoCircle size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        show={modal.show}
        onHide={() => setModal({ show: false, data: null })}
        centered
      >
        <Modal.Header
          closeButton
          style={{ background: "#1e1f2e", color: "#fff", border: "none" }}
        >
          <Modal.Title style={{ fontSize: 16, fontWeight: 700 }}>
            Detalle de Asistencia
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: 24 }}>
          {modal.data && (
            <div className="ud-modal-grid">
              {[
                ["Fecha", formatFecha(modal.data.fecha)],
                ["Hora Entrada", formatHora(modal.data.hora_entrada)],
                ["Hora Salida", formatHora(modal.data.hora_salida)],
                ["Turno", modal.data.turno || "N/A"],
                ["Estado", modal.data.estado || "N/A"],
                [
                  "Descuento",
                  `S/ ${parseFloat(modal.data.descuento || 0).toFixed(2)}`,
                ],
              ].map(([k, v]) => (
                <div key={k} className="ud-modal-row">
                  <span className="ud-modal-key">{k}</span>
                  <span className="ud-modal-val">{v}</span>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ border: "none", padding: "0 24px 20px" }}>
          <button
            className="sa-action-btn"
            style={{ background: "#6366f1" }}
            onClick={() => setModal({ show: false, data: null })}
          >
            Cerrar
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );

  return (
    <div className="sa-root">
      {/* ── Sidebar ── */}
      <aside className={`sa-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sa-sidebar-brand">
          <span className="sa-brand-dot" style={{ background: "#10b981" }} />
          Panel Trabajador
        </div>

        <Nav className="flex-column sa-nav">
          <Nav.Link
            className={`sa-nav-link ${activeModule === "inicio" ? "active" : ""}`}
            onClick={() => go("inicio")}
          >
            <FaHome className="sa-nav-icon" /> Inicio
          </Nav.Link>
          <Nav.Link
            className={`sa-nav-link ${activeModule === "perfil" ? "active" : ""}`}
            onClick={() => go("perfil")}
          >
            <FaUser className="sa-nav-icon" /> Perfil
          </Nav.Link>
          <Nav.Link
            className={`sa-nav-link ${activeModule === "ticket" ? "active" : ""}`}
            onClick={() => go("ticket")}
          >
            <FaTicketAlt className="sa-nav-icon" /> Mis Tickets
          </Nav.Link>
          <Nav.Link
            className={`sa-nav-link ${activeModule === "soporte" ? "active" : ""}`}
            onClick={() => go("soporte")}
          >
            <FaLifeRing className="sa-nav-icon" /> Soporte
          </Nav.Link>
        </Nav>

        <div className="sa-sidebar-footer">
          <LogoutButton />
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="sa-main">
        <header className="sa-topbar">
          <button
            className="sa-burger d-lg-none"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="sa-topbar-user">
            <div
              className="sa-user-avatar"
              style={{ background: "linear-gradient(135deg,#10b981,#0ea5e9)" }}
            >
              {primerNombre.charAt(0)}
            </div>
            <div>
              <p className="sa-user-greeting">Bienvenido de vuelta</p>
              <p className="sa-user-name">
                {primerNombre} {primerApellido}
              </p>
            </div>
          </div>
        </header>

        {activeModule === "inicio" && renderInicio()}

        {activeModule === "perfil" && (
          <div className="sa-content">
            <Suspense fallback={<Fallback />}>
              <Perfil usuario={usuario} AsistenciasComponent={MisAsistencias} />
            </Suspense>
          </div>
        )}

        {activeModule === "soporte" && (
          <div className="sa-content">
            <Suspense fallback={<Fallback />}>
              <Soporte usuario={usuario} />
            </Suspense>
          </div>
        )}

        {activeModule === "ticket" && (
          <div className="sa-content">
            <div className="sa-page-title">
              <h4>Mi Ticket de Remuneración</h4>
            </div>
            <Suspense fallback={<Fallback />}>
              <TicketRemuneracion usuario={usuario} />
            </Suspense>
          </div>
        )}
      </div>

      {sidebarOpen && (
        <div className="sa-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      
    </div>
  );
};

export default DashboardUser;
