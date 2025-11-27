// src/components/AccessSelector.jsx
import React, { useState } from "react";
import Login from "../components/Login.jsx";
import LoginSuperAdmin from "../components/admin/LoginSuperAdmin";
import "../templates/styles/AccessSelector.css"; // ← IMPORTA EL CSS

export default function AccessSelector() {
  const [formType, setFormType] = useState("user"); 
  const [animKey, setAnimKey] = useState(0); // clave para animación

  const switchForm = (type) => {
    setAnimKey((prev) => prev + 1); // fuerza animación
    setFormType(type);
  };

  return (
    <div className="access-container">
      <div className="access-box">
        
        {/* Contenido animado */}
        <div key={animKey} className="fade-slide">
          {formType === "user" ? (
            <div className="view-container">
              {/* FORM TRABAJADOR */}
              <div className="form-side">
                <Login />
              </div>

              {/* PANEL DESCRIPTIVO */}
              <div className="info-side">
                <h1>Sistema de <br /> asistencias</h1>
                <p>Ingrese sus credenciales</p>
              </div>
            </div>
          ) : (
            <div className="view-container">
              {/* PANEL DESCRIPTIVO */}
              <div className="info-side">
                <h1> Sistema de <br /> asistencias</h1>
                <p>Ingrese sus credenciales, <br />para comenzar la gestión</p>
              </div>

              {/* FORM SUPER ADMIN */}
              <div className="form-side">
                <LoginSuperAdmin />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTONES ABAJO */}
      <div className="selector-buttons">
        <button
          onClick={() => switchForm("user")}
          className={formType === "user" ? "btn active" : "btn"}
        >
          Trabajador
        </button>

        <button
          onClick={() => switchForm("superadmin")}
          className={formType === "superadmin" ? "btn active" : "btn"}
        >
          S.A.
        </button>
      </div>
    </div>
  );
}
