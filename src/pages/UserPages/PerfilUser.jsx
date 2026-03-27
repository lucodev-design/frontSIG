// src/modules/user/PerfilUser.jsx
import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";

const PerfilUser = ({ usuario, AsistenciasComponent }) => {
  return (
    <div className="container py-4">

      {/* TARJETA PRINCIPAL */}
      <Card className="shadow-lg border-0 p-4">
        <h3 className="text-center mb-4">Mi Perfil</h3>

        <Row className="g-4">

          {/* FOTO CIRCULAR */}
          <Col
            xs={12}
            md={4}
            className="d-flex justify-content-center align-items-center"
          >
            <div
              style={{
                width: "190px",
                height: "190px",
                borderRadius: "50%",
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#e9ecef",
                border: "3px solid #ccc",
              }}
            >
              <FaUserCircle size={160} color="#4a90e2" />
            </div>
          </Col>

          {/* INFORMACIÓN */}
          <Col xs={12} md={8}>
            <Card
              className="p-4 shadow-sm"
              style={{ background: "#a0a0a0", borderRadius: "12px" }}
            >
              <Row className="mb-3">
                <Col md={6}>
                  <label className="fw-bold">Nombres</label>
                  <div className="info-box">{usuario.nombre}</div>
                </Col>

                <Col md={6}>
                  <label className="fw-bold">Apellidos</label>
                  <div className="info-box">{usuario.apellidos}</div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <label className="fw-bold">Correo</label>
                  <div className="info-box">{usuario.email}</div>
                </Col>

                <Col md={6}>
                  <label className="fw-bold">Rol</label>
                  <div className="info-box">{usuario.rol}</div>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <label className="fw-bold">Sede</label>
                  <div className="info-box">{usuario.sede}</div>
                </Col>

                <Col md={6}>
                  <label className="fw-bold">Turno</label>
                  <div className="info-box">{usuario.turno}</div>
                </Col>
              </Row>
            </Card>
          </Col>

        </Row>
      </Card>

      {/* CONTENEDOR MIS ASISTENCIAS */}
      <Card className="shadow-lg border-0 p-1 mt-4" style={{ minHeight: "300px" }}>
        <h4 className="mb-3">Mis Asistencias</h4>

        {/* Render dinámica del componente */}
        {AsistenciasComponent ? (
          <AsistenciasComponent usuario={usuario} />
        ) : (
          <p className="text-muted">Cargando asistencias...</p>
        )}
      </Card>

    </div>
  );
};

export default PerfilUser;