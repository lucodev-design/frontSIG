// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import DashboardUser from "./pages/dashboardUser";
import DashboardAdmin from "./pages/dashboardAdmin";

function App() {
  return (
    <Router>
      <Routes>
        {/* 👇 Por defecto "/" muestra el login */}
        <Route path="/" element={<Login />} />
        <Route path="/dashboardUser" element={<DashboardUser />} />
        <Route path="/dashboardAdmin" element={<DashboardAdmin />} />
      </Routes>
    </Router>
  );
}

export default App;
