// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, roleRequired }) => {
  const token = localStorage.getItem("token");
  const rol = parseInt(localStorage.getItem("rol")); // guardas el rol al hacer login

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si el rol no coincide pero sí hay token, mostramos mensaje de acceso denegado
  if (roleRequired && rol !== roleRequired) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold text-red-600">🚫 Acceso denegado</h1>
        <p className="text-gray-600 mt-2">
          No tienes permisos para acceder a esta sección.
        </p>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;
