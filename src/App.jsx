// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Componentes y páginas
import Login from "./components/Login";
import DashboardUser from "./pages/DashboardUser";
import DashboardAdmin from "./pages/DashboardAdmin";
import PrivateRoute from "./components/PrivateRoute";
import Asistencia from "./pages/Asistencia";   
// import AddUsuario from "./components/AddUsuario";   

import "./App.css";
import AggUsuario from "./pruebasHooks/AggUsuario";
// importaciones para trabajadr dentro de admin
import GestionUsuario from "./pages/AdminPages/GestionUsuario";
import ListUser from "./pages/AdminPages/ListUser";

function App() {
  return (
    <Router>
      <Routes>
        {/* Página de asistencia como raíz */}
        <Route path="/" element={<Asistencia />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />



        {/* Codigo para el formulario  temporal de registros */}
        <Route path="/agregar-usuario-test" element={<AggUsuario/>} />
        {/* Gestion de Administrador */}
        {/* <Route path="/GestionUser" element={<GestionUsuario/>} /> */}
        {/* <Route path="/ListaUsuarios" element={<ListUser/>} /> */}





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
        {/* Listar usuarios */}
        <Route
          path="/ListaUsuarios"
          element={
            <PrivateRoute roleRequired={1}>
              <ListUser />
            </PrivateRoute>
          }
        />

        {/* Ruta fallback */}
        <Route path="*" element={<h2 className="text-center mt-10">404 - Página no encontrada</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
