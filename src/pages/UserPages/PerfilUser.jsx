// src/modules/user/PerfilUser.jsx
import React from "react";
import { Card } from "react-bootstrap";

const PerfilUser = ({ usuario }) => {
  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <h5>Mi Perfil</h5>
        <p><strong>Nombre:</strong> {usuario.nombre} {usuario.apellidos}</p>
        <p><strong>Email:</strong> {usuario.email}</p>
        <p><strong>Rol:</strong> {usuario.rol}</p>
      </Card.Body>
    </Card>
  );
};

export default PerfilUser;
