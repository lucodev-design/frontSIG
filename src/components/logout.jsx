// src/components/LogoutButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    navigate("/"); // 👈 Te manda al login
  };

  return (
    <button 
      onClick={handleLogout} 
      className="btn btn-danger"
    >
      Cerrar sesión
    </button>
  );
}
