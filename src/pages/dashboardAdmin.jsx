// src/pages/DashboardAdmin.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardAdmin() {
  const navigate = useNavigate();

  useEffect(() => {
    // Si no hay token, se regresa al login
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-blue-600">Dashboard del Administrador</h1>
      <p className="mt-4">Bienvenido, admin@empresa.com</p>
      <button
        className="mt-6 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/login");
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
