// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Componentes y páginas
import Login from "./components/Login";
import DashboardUser from "./pages/dashboardUser";
import DashboardAdmin from "./pages/dashboardAdmin";
import PrivateRoute from "./components/PrivateRoute";
import Asistencia from "./pages/asistencia";
import AggUsuario from "./pruebasHooks/AggUsuario";

// Importaciones para trabajar dentro de admin
// justamente par aevitar errore se cargar de paginas
import GestionUsuario from "./pages/AdminPages/GestionUsuario";
import ListUser from "./pages/AdminPages/ListUser";

import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Página de asistencia como raíz */}
        <Route path="/" element={<Asistencia />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Formulario temporal de registros (sin protección) */}
        <Route path="/agregar-usuario-test" element={<AggUsuario />} />

        {/* Dashboard ADMIN */}
        <Route
          path="/dashboardAdmin"
          element={
            <PrivateRoute roleRequired={1}>
              <DashboardAdmin />
            </PrivateRoute>
          }
        />

        {/* Dashboard USER */}
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

        {/* Ruta fallback */}
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
