// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import DashboardUser from "./pages/dashboardUser";
import DashboardAdmin from "./pages/dashboardAdmin";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* 👇 Por defecto "/" muestra el login */}
        <Route path="/" element={<Login />} />
        <Route path="/dashboardAdmin" element={
          <PrivateRoute><DashboardAdmin /></PrivateRoute>} />
        <Route path="/dashboardUser" element={
          <PrivateRoute><DashboardUser /></PrivateRoute>} />        
      </Routes>
    </Router>
  );
}

export default App;
