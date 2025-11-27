// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Componentes y páginas
// import Login from "./components/Login";
// import LoginSuperAdmin from "./components/admin/LoginSuperAdmin";   // <-- AGREGADO
import DashboardUser from "./pages/dashboardUser";
import DashboardAdmin from "./pages/dashboardAdmin";
import DashboardSuperAdmin from "./pages/DashboardSuperAdmin";
import PrivateRoute from "./components/PrivateRoute";
// import Asistencia from "./pages/Asistencia";
import AggUsuario from "./pruebasHooks/AggUsuario";
import GestionUsuario from "./pages/AdminPages/GestionUsuario";
import ListUser from "./pages/AdminPages/ListUser";

// Super Administrador
import CrearAdmin from "./pages/SuperAdminPages/CrearAdmin";

// Asistencias actual en uso y producción
import Asistencias from "./pages/Asistencias";

// Access Selector
import AccessSelector from "./components/AccessSelector";

import "./App.css";

function App() {
  return (
    <Router>
      <Routes>

        {/* Página principal: Selector de acceso */}
        <Route path="/selector" element={<AccessSelector />} />

        {/* Asistencias */}
        {/* <Route path="/asistencia" element={<Asistencia />} /> */}
        {/* Asistencias actual */}
        <Route path="/" element={<Asistencias />} />

        {/* Login Usuarios */}
        {/* <Route path="/login" element={<Login />} /> */}

        {/* Login SuperAdmin */}
        {/* <Route path="/loginSuperAdmin" element={<LoginSuperAdmin />} /> */}

        {/* Formulario temporal (tests) */}
        <Route path="/agregar-usuario-test" element={<AggUsuario />} />

        {/* Crear Admin */}
        <Route path="/CrearAdmin" element={<CrearAdmin />} />

        {/* Dashboard SuperAdmin */}
        <Route
          path="/dashboardSuperAdmin"
          element={
            <PrivateRoute roleRequired={3}>
              <DashboardSuperAdmin />
            </PrivateRoute>
          }
        />

        {/* Dashboard Admin */}
        <Route
          path="/dashboardAdmin"
          element={
            <PrivateRoute roleRequired={1}>
              <DashboardAdmin />
            </PrivateRoute>
          }
        />

        {/* Dashboard Usuario */}
        <Route
          path="/dashboardUser"
          element={
            <PrivateRoute roleRequired={2}>
              <DashboardUser />
            </PrivateRoute>
          }
        />

        {/* Registrar usuario (solo Admin) */}
        <Route
          path="/add-user"
          element={
            <PrivateRoute roleRequired={1}>
              <GestionUsuario />
            </PrivateRoute>
          }
        />

        {/* Listar usuarios (solo Admin) */}
        <Route
          path="/ListaUsuarios"
          element={
            <PrivateRoute roleRequired={1}>
              <ListUser />
            </PrivateRoute>
          }
        />

        {/* Fallback 404 */}
        <Route
          path="*"
          element={
            <h2 className="text-center mt-10">404 - Página no encontrada</h2>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
