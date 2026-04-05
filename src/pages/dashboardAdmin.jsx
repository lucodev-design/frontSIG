import React, { useEffect, useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { Nav, Spinner } from "react-bootstrap";
import {
  FaUsers, FaChartBar, FaCogs, FaHome,
  FaUserPlus, FaList, FaTicketAlt,
} from "react-icons/fa";
import LogoutButton from "../components/logout";
import ContadorAsistenciasDiarias from "../components/panelConponents/ContadorAsistenciasDiarias";
import CantidadUsuarios from "../components/panelConponents/CantidadUsuarios";
import { contarTicketsNuevos } from "../api/api";
import "../templates/dashboard/dashboardAdmin-shared.css";

import "bootstrap-icons/font/bootstrap-icons.css";

// ── Lazy loads ────────────────────────────────────────────────
const GestionUsuarios    = lazy(() => import("../pages/AdminPages/GestionUsuario"));
const ListUser           = lazy(() => import("../pages/AdminPages/ListUser"));
const ReporteAsistencia  = lazy(() => import("../pages/AdminPages/ReporteAsistencia"));
const ConfiguracionesAdmin = lazy(() => import("../pages/AdminPages/ConfiguracionesAdmin"));
const ListaTrabajadores  = lazy(() => import("./AdminPages/pass/ListaTrabajadores"));
const ReceptorTickets    = lazy(() => import("../pages/AdminPages/ReceptorTickets"));

// ─── Stat Card ────────────────────────────────────────────────
const StatCard = ({ label, value, loading, color, icon: Icon, onClick, subtitle, badge }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (loading || value === 0) { setDisplay(0); return; }
    let start = 0;
    const step = Math.ceil(value / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(timer);
  }, [value, loading]);

  return (
    <div className="sa-stat-card" onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <div className="sa-stat-icon" style={{ background: color }}>
        <Icon size={22} color="#fff" />
      </div>
      <div className="sa-stat-body">
        <span className="sa-stat-label">{label}</span>
        {loading
          ? <div className="sa-stat-skeleton" />
          : <span className="sa-stat-value">{display.toLocaleString()}</span>
        }
        {subtitle && <span className="sa-stat-sub">{subtitle}</span>}
      </div>
      {badge > 0 && (
        <div className="sa-stat-badge">{badge > 99 ? "99+" : badge}</div>
      )}
      <div className="sa-stat-bar" style={{ background: color }} />
    </div>
  );
};

// ─── Action Card ──────────────────────────────────────────────
const ActionCard = ({ title, desc, color, icon: Icon, btnLabel, onClick, badge }) => (
  <div className="sa-action-card">
    <div style={{ position: "relative", display: "inline-block" }}>
      <div className="sa-action-icon" style={{ background: color }}>
        <Icon size={28} color="#fff" />
      </div>
      {badge > 0 && (
        <span className="sa-action-badge">{badge > 99 ? "99+" : badge}</span>
      )}
    </div>
    <h6 className="sa-action-title">{title}</h6>
    <p className="sa-action-desc">{desc}</p>
    <button className="sa-action-btn" style={{ background: color }} onClick={onClick}>
      {btnLabel}{badge > 0 ? ` (${badge} nuevos)` : ""}
    </button>
  </div>
);

// ─── Fallback ─────────────────────────────────────────────────
const Fallback = () => (
  <div className="sa-fallback">
    <Spinner animation="border" size="sm" />
    <span>Cargando...</span>
  </div>
);

// ─── Dashboard Admin ──────────────────────────────────────────
const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [nombre, setNombre]           = useState("");
  const [activeView, setActiveView]   = useState("home");
  const [activeUserView, setActiveUserView] = useState("form");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ticketsNuevos, setTicketsNuevos] = useState(0);

  // ── Sesión ──────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user  = localStorage.getItem("user");
    if (!token) { navigate("/login"); return; }
    if (user) {
      try { setNombre(JSON.parse(user).nombre || "Administrador"); }
      catch { setNombre("Administrador"); }
    }
  }, [navigate]);

  // ── Polling tickets ──────────────────────────────────────────
  useEffect(() => {
    const fetch_ = async () => {
      try {
        const data = await contarTicketsNuevos();
        setTicketsNuevos(data.total || 0);
      } catch { /* silencioso */ }
    };
    fetch_();
    const id = setInterval(fetch_, 30000);
    return () => clearInterval(id);
  }, []);

  // ── Scroll cierra sidebar ─────────────────────────────────
  useEffect(() => {
    const fn = () => { if (sidebarOpen) setSidebarOpen(false); };
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, [sidebarOpen]);

  const go = (view) => {
    setActiveView(view);
    setSidebarOpen(false);
    if (view === "tickets") setTicketsNuevos(0);
  };

  return (
    <div className="sa-root">
      {/* ── Sidebar ── */}
      <aside className={`sa-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sa-sidebar-brand">
          <span className="sa-brand-dot" style={{ background: "#0ea5e9" }} />
          Admin Panel
        </div>

        <Nav className="flex-column sa-nav">
          <Nav.Link className={`sa-nav-link ${activeView === "home" ? "active" : ""}`} onClick={() => go("home")}>
            <FaHome className="sa-nav-icon" /> Inicio
          </Nav.Link>

          <Nav.Link className={`sa-nav-link ${activeView === "usuarios" ? "active" : ""}`} onClick={() => go("usuarios")}>
            <FaUsers className="sa-nav-icon" /> Trabajadores
          </Nav.Link>

          <Nav.Link className={`sa-nav-link ${activeView === "lista-trabajadores" ? "active" : ""}`} onClick={() => go("lista-trabajadores")}>
            <i className="bi bi-people-fill sa-nav-icon" /> Remuneraciones
          </Nav.Link>

          <Nav.Link
            className={`sa-nav-link ${activeView === "tickets" ? "active" : ""}`}
            onClick={() => go("tickets")}
            style={{ position: "relative" }}
          >
            <FaTicketAlt className="sa-nav-icon" /> Tickets
            {ticketsNuevos > 0 && (
              <span className="sa-nav-badge">{ticketsNuevos > 99 ? "99+" : ticketsNuevos}</span>
            )}
          </Nav.Link>

          <Nav.Link className={`sa-nav-link ${activeView === "reportes" ? "active" : ""}`} onClick={() => go("reportes")}>
            <FaChartBar className="sa-nav-icon" /> Reportes
          </Nav.Link>

          <Nav.Link className={`sa-nav-link ${activeView === "config" ? "active" : ""}`} onClick={() => go("config")}>
            <FaCogs className="sa-nav-icon" /> Configuración
          </Nav.Link>
        </Nav>

        <div className="sa-sidebar-footer">
          <LogoutButton />
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="sa-main">
        {/* Topbar */}
        <header className="sa-topbar">
          <button className="sa-burger d-lg-none" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span /><span /><span />
          </button>
          <div className="sa-topbar-user">
            <div className="sa-user-avatar" style={{ background: "linear-gradient(135deg,#0ea5e9,#6366f1)" }}>
              {nombre.charAt(0)}
            </div>
            <div>
              <p className="sa-user-greeting">Bienvenido de vuelta</p>
              <p className="sa-user-name">{nombre}</p>
            </div>
            <LogoutButton/>
          </div>
        </header>

        <div className="sa-content">
          {/* ── HOME ── */}
          {activeView === "home" && (
            <>
              <div className="sa-page-title">
                <h4>Panel de Administración</h4>
                <span className="sa-page-date">
                  {new Date().toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>

              {/* Stats row — reutiliza los componentes existentes + stat cards */}
              <div className="sa-stats-grid sa-stats-grid--admin">
                {/* Componentes originales envueltos */}
                <div className="sa-wrapped-stat"><CantidadUsuarios /></div>
                <div className="sa-wrapped-stat"><ContadorAsistenciasDiarias /></div>
                <StatCard
                  label="Tickets Nuevos"
                  value={ticketsNuevos}
                  loading={false}
                  color="#ef4444"
                  icon={FaTicketAlt}
                  onClick={() => go("tickets")}
                  subtitle="Pendientes de revisión"
                  badge={ticketsNuevos}
                />
              </div>

              {/* Action cards */}
              <h6 className="sa-section-title">Accesos rápidos</h6>
              <div className="sa-actions-grid">
                <ActionCard title="Gestión de Trabajadores" desc="Registrar y administrar el personal de tu sede."            color="#6366f1" icon={FaUsers}     btnLabel="Gestionar"     onClick={() => go("usuarios")} />
                <ActionCard title="Tickets de Pago"         desc="Revisa los tickets de remuneración enviados por el personal." color="#ef4444" icon={FaTicketAlt} btnLabel="Ver Tickets"   onClick={() => go("tickets")} badge={ticketsNuevos} />
                <ActionCard title="Reportes"                desc="Visualiza reportes de asistencia, pagos y actividades."      color="#10b981" icon={FaChartBar}  btnLabel="Ver Reportes"  onClick={() => go("reportes")} />
                <ActionCard title="Configuración"           desc="Ajusta turnos, tolerancias y feriados del sistema."          color="#f59e0b" icon={FaCogs}      btnLabel="Configurar"    onClick={() => go("config")} />
              </div>
            </>
          )}

          {/* ── TRABAJADORES ── */}
          {activeView === "usuarios" && (
            <>
              <div className="sa-tab-bar">
                <button className={`sa-tab ${activeUserView === "form" ? "active" : ""}`} onClick={() => setActiveUserView("form")}><FaUserPlus className="me-2" />Registrar Usuario</button>
                <button className={`sa-tab ${activeUserView === "list" ? "active" : ""}`} onClick={() => setActiveUserView("list")}><FaList className="me-2" />Lista de Trabajadores</button>
              </div>
              <Suspense fallback={<Fallback />}>
                {activeUserView === "form" && <GestionUsuarios />}
                {activeUserView === "list" && <ListUser />}
              </Suspense>
            </>
          )}

          {/* ── REMUNERACIONES ── */}
          {activeView === "lista-trabajadores" && (
            <Suspense fallback={<Fallback />}><ListaTrabajadores /></Suspense>
          )}

          {/* ── TICKETS ── */}
          {activeView === "tickets" && (
            <Suspense fallback={<Fallback />}>
              <div className="sa-page-title">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h4 style={{ margin: 0 }}>Tickets de Remuneración</h4>
                  {ticketsNuevos > 0 && (
                    <span style={{ background: "#ef4444", color: "#fff", borderRadius: 20, fontSize: 12, fontWeight: 700, padding: "2px 10px" }}>
                      {ticketsNuevos} nuevos
                    </span>
                  )}
                </div>
              </div>
              <ReceptorTickets />
            </Suspense>
          )}

          {/* ── REPORTES ── */}
          {activeView === "reportes" && (
            <Suspense fallback={<Fallback />}><ReporteAsistencia /></Suspense>
          )}

          {/* ── CONFIG ── */}
          {activeView === "config" && (
            <Suspense fallback={<Fallback />}><ConfiguracionesAdmin /></Suspense>
          )}
        </div>
      </div>

      {/* Overlay móvil */}
      {sidebarOpen && <div className="sa-overlay" onClick={() => setSidebarOpen(false)} />}


    </div>
  );
};

export default DashboardAdmin;
