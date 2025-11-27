// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children, roleRequired }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roleRequired && user?.rol_id !== roleRequired) {
    // si no tiene permisos, lo mandamos a asistencia
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PrivateRoute;
