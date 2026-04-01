// src/pages/AdminPages/ReceptorTickets.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  Card, Row, Col, Badge, Button, Spinner, Alert, Modal, Table
} from "react-bootstrap";
import {
  FaTicketAlt, FaCheckCircle, FaClock, FaUser,
  FaMapMarkerAlt, FaMoneyBillWave, FaTrash
} from "react-icons/fa";
import {
  getTicketsAdmin,
  marcarTicketsVistos,
  actualizarEstadoTicket,
  eliminarTicketAdmin,
} from "../../api/api";

const colorEstado = (estado) => {
  switch (estado) {
    case "pagado":    return "success";
    case "en_espera": return "warning";
    case "enviado":   return "info";
    default:          return "secondary";
  }
};

const labelEstado = (estado) => {
  switch (estado) {
    case "pagado":    return "✅ Pagado";
    case "en_espera": return "⏳ En espera";
    case "enviado":   return "📨 Nuevo";
    default:          return estado;
  }
};

const ReceptorTickets = () => {
  const [tickets, setTickets]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [accion, setAccion]               = useState(null);     // id_ticket cambiando estado
  const [eliminando, setEliminando]       = useState(null);     // id_ticket eliminando
  const [confirmEliminar, setConfirmEliminar] = useState(null); // ticket a confirmar
  const [mensaje, setMensaje]             = useState({ type: null, text: null });

  const mostrarMensaje = (type, text) => {
    setMensaje({ type, text });
    setTimeout(() => setMensaje({ type: null, text: null }), 4000);
  };

  const cargarTickets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTicketsAdmin();
      setTickets(Array.isArray(data) ? data : []);
      await marcarTicketsVistos();
    } catch {
      mostrarMensaje("danger", "Error al cargar los tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarTickets();
  }, [cargarTickets]);

  const handleEstado = async (id_ticket, estado) => {
    setAccion(id_ticket);
    try {
      await actualizarEstadoTicket(id_ticket, estado);
      setTickets((prev) =>
        prev.map((t) => t.id_ticket === id_ticket ? { ...t, estado } : t)
      );
      mostrarMensaje("success", `Estado actualizado a "${labelEstado(estado)}".`);
    } catch (err) {
      mostrarMensaje("danger", err.message || "Error al actualizar estado.");
    } finally {
      setAccion(null);
    }
  };

  const handleEliminar = async () => {
    if (!confirmEliminar) return;
    const { id_ticket, codigo_ticket } = confirmEliminar;
    setConfirmEliminar(null);
    setEliminando(id_ticket);
    try {
      await eliminarTicketAdmin(id_ticket);
      setTickets((prev) => prev.filter((t) => t.id_ticket !== id_ticket));
      mostrarMensaje("success", `Ticket ${codigo_ticket} eliminado correctamente.`);
    } catch (err) {
      mostrarMensaje("danger", err.message || "Error al eliminar el ticket.");
    } finally {
      setEliminando(null);
    }
  };

  const contadores = {
    nuevos:   tickets.filter((t) => t.estado === "enviado").length,
    enEspera: tickets.filter((t) => t.estado === "en_espera").length,
    pagados:  tickets.filter((t) => t.estado === "pagado").length,
  };

  return (
    <div>
      {/* ── Resumen ── */}
      <Row className="g-3 mb-4">
        <Col xs={6} md={4}>
          <Card className="border-0 shadow-sm text-center h-100">
            <Card.Body>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#0ea5e9" }}>
                {contadores.nuevos}
              </div>
              <div className="text-muted" style={{ fontSize: 13 }}>Nuevos</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={4}>
          <Card className="border-0 shadow-sm text-center h-100">
            <Card.Body>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#f59e0b" }}>
                {contadores.enEspera}
              </div>
              <div className="text-muted" style={{ fontSize: 13 }}>En espera</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={4}>
          <Card className="border-0 shadow-sm text-center h-100">
            <Card.Body>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#16a34a" }}>
                {contadores.pagados}
              </div>
              <div className="text-muted" style={{ fontSize: 13 }}>Pagados</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {mensaje.text && (
        <Alert variant={mensaje.type} dismissible
          onClose={() => setMensaje({ type: null, text: null })}>
          {mensaje.text}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-2 text-muted">Cargando tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <FaTicketAlt size={40} className="text-muted mb-3 opacity-25" />
            <p className="text-muted mb-0">No hay tickets enviados aún.</p>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-3">
          {tickets.map((t, index) => (
            <Col key={t.id_ticket} xs={12} sm={6} xl={4}>
              <Card className={`h-100 shadow-sm border-0 border-top border-3 border-${colorEstado(t.estado)}`}>
                <Card.Body className="p-3">

                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <div style={{ fontSize: 11, color: "#888" }}>N° {index + 1} · Ticket</div>
                      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, color: "#1a56db" }}>
                        {t.codigo_ticket}
                      </div>
                    </div>
                    <Badge bg={colorEstado(t.estado)} className="px-2 py-1">
                      {labelEstado(t.estado)}
                    </Badge>
                  </div>

                  {/* Info trabajador */}
                  <div className="mb-3">
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <FaUser size={11} className="text-muted" />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>
                        {t.nombre} {t.apellidos}
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <FaMapMarkerAlt size={11} className="text-muted" />
                      <span style={{ fontSize: 12, color: "#666" }}>{t.sede || "—"}</span>
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <FaClock size={11} className="text-muted" />
                      <span style={{ fontSize: 12, color: "#666" }}>{t.turno || "—"}</span>
                    </div>
                  </div>

                  {/* ✅ Desglose de monto */}
                  <div className="mb-3 p-2 rounded" style={{ background: "#f8fafc", fontSize: 12 }}>
                    <Table size="sm" className="mb-0" style={{ fontSize: 12 }}>
                      <tbody>
                        <tr>
                          <td className="text-muted border-0 ps-0">Base</td>
                          <td className="text-end border-0">
                            S/. {Number(t.monto_bruto || t.monto).toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-danger border-0 ps-0">Descuentos</td>
                          <td className="text-end text-danger border-0">
                            - S/. {Number(t.total_descuentos || 0).toFixed(2)}
                          </td>
                        </tr>
                        <tr style={{ borderTop: "1px solid #dee2e6" }}>
                          <td className="fw-bold ps-0 pt-1">
                            <FaMoneyBillWave className="text-success me-1" />
                            Total
                          </td>
                          <td className="text-end fw-bold pt-1" style={{ fontSize: 16, color: "#16a34a" }}>
                            S/. {Number(t.monto).toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>

                  {/* Fechas */}
                  <div className="mb-3" style={{ fontSize: 11, color: "#999" }}>
                    <div>Recibido: {new Date(t.fecha_emision).toLocaleString("es-PE", {
                      timeZone: "America/Lima", day: "2-digit", month: "2-digit",
                      year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}</div>
                    {t.fecha_accion && (
                      <div>Acción: {new Date(t.fecha_accion).toLocaleString("es-PE", {
                        timeZone: "America/Lima", day: "2-digit", month: "2-digit",
                        year: "numeric", hour: "2-digit", minute: "2-digit",
                      })}</div>
                    )}
                  </div>

                  {/* Acciones de estado */}
                  <div className="d-flex gap-2 flex-wrap mb-2">
                    {t.estado !== "pagado" && (
                      <Button variant="success" size="sm" className="flex-grow-1"
                        disabled={accion === t.id_ticket}
                        onClick={() => handleEstado(t.id_ticket, "pagado")}>
                        {accion === t.id_ticket
                          ? <Spinner size="sm" />
                          : <><FaCheckCircle className="me-1" />Pagado</>}
                      </Button>
                    )}
                    {t.estado !== "en_espera" && t.estado !== "pagado" && (
                      <Button variant="warning" size="sm" className="flex-grow-1"
                        disabled={accion === t.id_ticket}
                        onClick={() => handleEstado(t.id_ticket, "en_espera")}>
                        {accion === t.id_ticket
                          ? <Spinner size="sm" />
                          : <><FaClock className="me-1" />En espera</>}
                      </Button>
                    )}
                    {t.estado === "pagado" && (
                      <div className="text-success text-center w-100 fw-bold" style={{ fontSize: 13 }}>
                        <FaCheckCircle className="me-1" />Pago completado
                      </div>
                    )}
                  </div>

                  {/* ✅ Botón eliminar — admin puede eliminar cualquier estado */}
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="w-100"
                    disabled={eliminando === t.id_ticket}
                    onClick={() => setConfirmEliminar(t)}
                  >
                    {eliminando === t.id_ticket
                      ? <><Spinner size="sm" className="me-1" />Eliminando...</>
                      : <><FaTrash className="me-1" />Eliminar ticket</>}
                  </Button>

                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* ── Modal confirmar eliminar ── */}
      <Modal show={!!confirmEliminar} onHide={() => setConfirmEliminar(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>¿Eliminar ticket?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que deseas eliminar el ticket:</p>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1a56db", textAlign: "center" }}>
            {confirmEliminar?.codigo_ticket}
          </div>
          <div className="text-center mt-1 mb-2" style={{ fontSize: 13, color: "#666" }}>
            {confirmEliminar?.nombre} {confirmEliminar?.apellidos}
          </div>
          <Alert variant="warning" className="mb-0" style={{ fontSize: 13 }}>
            ⚠️ Esta acción no se puede deshacer.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setConfirmEliminar(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleEliminar}>
            <FaTrash className="me-2" /> Sí, eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReceptorTickets;
