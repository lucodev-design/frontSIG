// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import DashboardUser from "./pages/dashboardUser";
import DashboardAdmin from "./pages/dashboardAdmin";
import PrivateRoute from "./components/PrivateRoute";
import Asistencia from "./pages/Asistencia";   // 👈 nueva página para asistencia con QR

function App() {
  return (
    <Router>
      <Routes>
        {/* 👇 Ahora la raíz "/" será la página de asistencia */}
        <Route path="/" element={<Asistencia />} />

        {/* 👇 Login se moverá a /login */}
        <Route path="/login" element={<Login />} />

        {/* 👇 Dashboards protegidos */}
        <Route
          path="/dashboardAdmin"
          element={
            <PrivateRoute>
              <DashboardAdmin />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboardUser"
          element={
            <PrivateRoute>
              <DashboardUser />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
