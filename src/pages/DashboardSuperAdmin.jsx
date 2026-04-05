import React, { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner, Nav, Navbar, Button } from "react-bootstrap";
import { FaUsers,  FaBuilding, FaCogs,  FaChartLine,  FaAngleDown,  FaAngleUp,  FaUserPlus,  FaList,  FaHome,} from "react-icons/fa";
import LogoutButton from "../components/logout.jsx";
import { getSedes, getAdmins, getUsers } from "../api/api.js";

import "../templates/styles/dashboardSuperAdmin-shared.css";

// Lazy loads
const GestionUsuarios = lazy(() => import("./AdminPages/GestionUsuario.jsx"));
const ListUser = lazy(() => import("./AdminPages/ListUser.jsx"));
const GestionSedes = lazy(
  () => import("./SuperAdminPages/GestionSedesSuperAdmin.jsx"),
);
const GestionRoles = lazy(
  () => import("./SuperAdminPages/GestionRolesSuperAdmin.jsx"),
);
const ConfiguracionGlobal = lazy(
  () => import("./SuperAdminPages/SoporteSuperAdmin/SoporteAdmin.jsx"),
);
const ReportesGenerales = lazy(
  () => import("./SuperAdminPages/ReportesGenerales.jsx"),
);
const CrearAdmin = lazy(() => import("./SuperAdminPages/CrearAdmin.jsx"));
const ListaAdmins = lazy(() => import("./SuperAdminPages/ListAdmin.jsx"));
const ListGeneral = lazy(() => import("./SuperAdminPages/ListGeneral.jsx"));
const AggUsuario = lazy(() => import("../pruebasHooks/AggUsuario.jsx"));

// ─── Componente de stat card animada ─────────────────────────────────────────
const StatCard = ({
  label,
  value,
  loading,
  color,
  icon: Icon,
  onClick,
  subtitle,
}) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (loading || value === 0) {
      setDisplay(0);
      return;
    }
    let start = 0;
    const step = Math.ceil(value / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else setDisplay(start);
    }, 30);
    return () => clearInterval(timer);
  }, [value, loading]);

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
        {loading ? (
          <div className="sa-stat-skeleton" />
        ) : (
          <span className="sa-stat-value">{display.toLocaleString()}</span>
        )}
        {subtitle && <span className="sa-stat-sub">{subtitle}</span>}
      </div>
      <div className="sa-stat-bar" style={{ background: color }} />
    </div>
  );
};

// ─── Componente de acción card ────────────────────────────────────────────────
const ActionCard = ({ title, desc, color, icon: Icon, btnLabel, onClick }) => (
  <div className="sa-action-card">
    <div className="sa-action-icon" style={{ background: color }}>
      <Icon size={28} color="#fff" />
    </div>
    <h6 className="sa-action-title">{title}</h6>
    <p className="sa-action-desc">{desc}</p>
    <button
      className="sa-action-btn"
      style={{ background: color }}
      onClick={onClick}
    >
      {btnLabel}
    </button>
  </div>
);

// ─── Suspense fallback ────────────────────────────────────────────────────────
const Fallback = () => (
  <div className="sa-fallback">
    <Spinner animation="border" size="sm" />
    <span>Cargando...</span>
  </div>
);

// ─── Dashboard principal ──────────────────────────────────────────────────────
const DashboardSuperAdmin = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [activeView, setActiveView] = useState("home");
  const [activeAdminView, setActiveAdminView] = useState("form");
  const [activeUserView, setActiveUserView] = useState("form");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [gestionOpen, setGestionOpen] = useState(false);
  const [gestionPersonalOpen, setGestionPersonalOpen] = useState(false);

  // Conteos reales
  const [counts, setCounts] = useState({
    sedes: 0,
    admins: 0,
    trabajadores: 0,
  });
  const [loadingCounts, setLoadingCounts] = useState(true);

  // ─── Cargar conteos ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCounts = async () => {
      setLoadingCounts(true);
      try {
        const [sedes, admins, users] = await Promise.allSettled([
          getSedes(),
          getAdmins(),
          getUsers(),
        ]);

        const toArray = (r) =>
          r.status === "fulfilled" && Array.isArray(r.value) ? r.value : [];

        setCounts({
          sedes: toArray(sedes).length,
          admins: toArray(admins).length,
          trabajadores: toArray(users).length,
        });
      } catch (err) {
        console.error("[Dashboard] Error al cargar conteos:", err);
      } finally {
        setLoadingCounts(false);
      }
    };
    fetchCounts();
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const u = JSON.parse(userData);
        setNombre(`${u.nombre || ""} ${u.apellidos || ""}`.trim());
      } catch {
        setNombre("Super Administrador");
      }
    } else {
      navigate("/login");
    }
    const onScroll = () => {
      if (sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [navigate, sidebarOpen]);

  const go = (view) => {
    setActiveView(view);
    setSidebarOpen(false);
  };

  return (
    <div className="sa-root">
      {/* ── Sidebar ── */}
      <aside className={`sa-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sa-sidebar-brand">
          <span className="sa-brand-dot" />
          Super Admin
        </div>

        <Nav className="flex-column sa-nav">
          <Nav.Link
            className={`sa-nav-link ${activeView === "home" ? "active" : ""}`}
            onClick={() => go("home")}
          >
            <FaHome className="sa-nav-icon" /> Panel Principal
          </Nav.Link>

          {/* Administrar */}
          <div>
            <Nav.Link
              className={`sa-nav-link sa-nav-parent ${gestionPersonalOpen ? "active" : ""}`}
              onClick={() => setGestionPersonalOpen(!gestionPersonalOpen)}
            >
              <span>
                <FaUsers className="sa-nav-icon" /> Administrar
              </span>
              {gestionPersonalOpen ? (
                <FaAngleUp size={12} />
              ) : (
                <FaAngleDown size={12} />
              )}
            </Nav.Link>
            {gestionPersonalOpen && (
              <div className="sa-submenu">
                <Nav.Link
                  className={`sa-nav-link sa-sub-link ${activeView === "usuarios" ? "active" : ""}`}
                  onClick={() => go("usuarios")}
                >
                  Trabajadores
                </Nav.Link>
                <Nav.Link
                  className={`sa-nav-link sa-sub-link ${activeView === "gestionAdmins" ? "active" : ""}`}
                  onClick={() => go("gestionAdmins")}
                >
                  General
                </Nav.Link>
              </div>
            )}
          </div>

          {/* Gestión */}
          <div>
            <Nav.Link
              className={`sa-nav-link sa-nav-parent ${gestionOpen ? "active" : ""}`}
              onClick={() => setGestionOpen(!gestionOpen)}
            >
              <span>
                <FaBuilding className="sa-nav-icon" /> Gestión
              </span>
              {gestionOpen ? (
                <FaAngleUp size={12} />
              ) : (
                <FaAngleDown size={12} />
              )}
            </Nav.Link>
            {gestionOpen && (
              <div className="sa-submenu">
                <Nav.Link
                  className={`sa-nav-link sa-sub-link ${activeView === "sedes" ? "active" : ""}`}
                  onClick={() => go("sedes")}
                >
                  Sedes
                </Nav.Link>
                <Nav.Link
                  className={`sa-nav-link sa-sub-link ${activeView === "roles" ? "active" : ""}`}
                  onClick={() => go("roles")}
                >
                  Roles
                </Nav.Link>
              </div>
            )}
          </div>

          <Nav.Link
            className={`sa-nav-link ${activeView === "config" ? "active" : ""}`}
            onClick={() => go("config")}
          >
            <FaCogs className="sa-nav-icon" /> Mensajería
          </Nav.Link>
          <Nav.Link
            className={`sa-nav-link ${activeView === "reportes" ? "active" : ""}`}
            onClick={() => go("reportes")}
          >
            <FaChartLine className="sa-nav-icon" /> Reportes
          </Nav.Link>
        </Nav>

        <div className="sa-sidebar-footer">
          <LogoutButton />
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="sa-main">
        {/* Navbar */}
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
            <div className="sa-user-avatar">{nombre.charAt(0)}</div>
            <div>
              <p className="sa-user-greeting">Bienvenido de vuelta</p>
              <p className="sa-user-name">{nombre}</p>
            </div>
          </div>
        </header>

        <div className="sa-content">
          {/* ── HOME ── */}
          {activeView === "home" && (
            <>
              <div className="sa-page-title">
                <h4>Panel Principal</h4>
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
                  label="Total de Sedes"
                  value={counts.sedes}
                  loading={loadingCounts}
                  color="#6366f1"
                  icon={FaBuilding}
                  onClick={() => {
                    go("sedes");
                    setGestionOpen(true);
                  }}
                  subtitle="Ubicaciones activas"
                />
                <StatCard
                  label="Administradores"
                  value={counts.admins}
                  loading={loadingCounts}
                  color="#0ea5e9"
                  icon={FaUsers}
                  onClick={() => go("gestionAdmins")}
                  subtitle="Cuentas de admin"
                />
                <StatCard
                  label="Total de Trabajadores"
                  value={counts.trabajadores}
                  loading={loadingCounts}
                  color="#10b981"
                  icon={FaUserPlus}
                  onClick={() => go("usuarios")}
                  subtitle="Personal registrado"
                />
              </div>

              {/* Action cards */}
              <h6 className="sa-section-title">Accesos rápidos</h6>
              <div className="sa-actions-grid">
                <ActionCard
                  title="Gestión de Administradores"
                  desc="Registrar, editar y ver la lista de administradores del sistema."
                  color="#6366f1"
                  icon={FaUsers}
                  btnLabel="Gestionar Admins"
                  onClick={() => go("gestionAdmins")}
                />
                <ActionCard
                  title="Sedes y Roles"
                  desc="Administra las ubicaciones y los cargos de la organización."
                  color="#0ea5e9"
                  icon={FaBuilding}
                  btnLabel="Gestionar Sedes"
                  onClick={() => {
                    go("sedes");
                    setGestionOpen(true);
                  }}
                />
                <ActionCard
                  title="Reportes Generales"
                  desc="Visualiza y exporta reportes consolidados de asistencia."
                  color="#10b981"
                  icon={FaChartLine}
                  btnLabel="Ver Reportes"
                  onClick={() => go("reportes")}
                />
              </div>
            </>
          )}

          {/* ── TRABAJADORES ── */}
          {activeView === "usuarios" && (
            <>
              <div className="sa-tab-bar">
                <button
                  className={`sa-tab ${activeUserView === "form" ? "active" : ""}`}
                  onClick={() => setActiveUserView("form")}
                >
                  <FaUserPlus className="me-2" />
                  Registrar Trabajador
                </button>
                <button
                  className={`sa-tab ${activeUserView === "list" ? "active" : ""}`}
                  onClick={() => setActiveUserView("list")}
                >
                  <FaList className="me-2" />
                  Lista de Trabajadores
                </button>
              </div>
              <Suspense fallback={<Fallback />}>
                {activeUserView === "form" && <GestionUsuarios />}
                {activeUserView === "list" && <ListUser />}
              </Suspense>
            </>
          )}

          {/* ── ADMINISTRADORES ── */}
          {activeView === "gestionAdmins" && (
            <>
              <div className="sa-tab-bar">
                <button
                  className={`sa-tab ${activeAdminView === "form" ? "active" : ""}`}
                  onClick={() => setActiveAdminView("form")}
                >
                  <FaUserPlus className="me-2" />
                  Registro General
                </button>
                <button
                  className={`sa-tab ${activeAdminView === "list" ? "active" : ""}`}
                  onClick={() => setActiveAdminView("list")}
                >
                  <FaList className="me-2" />
                  Lista de Admins
                </button>
                <button
                  className={`sa-tab ${activeAdminView === "listG" ? "active" : ""}`}
                  onClick={() => setActiveAdminView("listG")}
                >
                  <FaList className="me-2" />
                  Lista General
                </button>
              </div>
              <Suspense fallback={<Fallback />}>
                {activeAdminView === "form" && <CrearAdmin />}
                {activeAdminView === "list" && <ListaAdmins />}
                {activeAdminView === "listG" && <ListGeneral />}
              </Suspense>
            </>
          )}

          {/* ── SEDES / ROLES / CONFIG / REPORTES ── */}
          {activeView === "sedes" && (
            <Suspense fallback={<Fallback />}>
              <GestionSedes />
            </Suspense>
          )}
          {activeView === "roles" && (
            <Suspense fallback={<Fallback />}>
              <GestionRoles />
            </Suspense>
          )}
          {activeView === "config" && (
            <Suspense fallback={<Fallback />}>
              <ConfiguracionGlobal />
            </Suspense>
          )}
          {activeView === "reportes" && (
            <Suspense fallback={<Fallback />}>
              <ReportesGenerales />
            </Suspense>
          )}
          {activeView === "configuracionesAdmin" && (
            <Suspense fallback={<Fallback />}>
              <AggUsuario />
            </Suspense>
          )}
        </div>
      </div>

      {/* ── Overlay móvil ── */}
      {sidebarOpen && (
        <div className="sa-overlay" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default DashboardSuperAdmin;
