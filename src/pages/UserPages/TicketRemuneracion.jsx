// src/pages/UserPages/TicketRemuneracion.jsx
import React, { useEffect, useState } from "react";
import {
  Card, Button, Spinner, Alert, Badge, Row, Col, Modal, Table
} from "react-bootstrap";
import {
  FaTicketAlt, FaFilePdf, FaPaperPlane, FaCheckCircle, FaTrash
} from "react-icons/fa";
import {
  generarTicket, getMisTickets, enviarTicket, eliminarTicketUsuario
} from "../../api/api";

// ─── PDF con desglose ─────────────────────────────────────────
const imprimirTicketPDF = (ticket, usuario) => {
  const ventana = window.open("", "_blank");
  const fecha = new Date(ticket.fecha_emision).toLocaleString("es-PE", {
    timeZone: "America/Lima",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const monto_bruto      = Number(ticket.monto_bruto || ticket.monto).toFixed(2);
  const total_descuentos = Number(ticket.total_descuentos || 0).toFixed(2);
  const monto_neto       = Number(ticket.monto).toFixed(2);

  ventana.document.write(`
    <!DOCTYPE html><html>
    <head>
      <meta charset="utf-8"/>
      <title>Ticket ${ticket.codigo_ticket}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #222; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 16px; margin-bottom: 24px; }
        .header h2 { margin: 0; font-size: 22px; }
        .header p  { margin: 4px 0; color: #555; font-size: 13px; }
        .codigo { text-align: center; font-size: 28px; font-weight: bold;
                  letter-spacing: 4px; color: #1a56db; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        td { padding: 10px 14px; border-bottom: 1px solid #e5e5e5; font-size: 14px; }
        td:first-child { font-weight: bold; width: 50%; color: #444; }
        .descuento { color: #dc2626; }
        .monto-neto { font-size: 26px; font-weight: bold; color: #16a34a; }
        .divider td { border-top: 2px solid #333; }
        .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>Ticket de Remuneración</h2>
        <p>Fecha de emisión: ${fecha}</p>
      </div>
      <div class="codigo">${ticket.codigo_ticket}</div>
      <table>
        <tr><td>Trabajador</td><td>${usuario.nombre} ${usuario.apellidos}</td></tr>
        <tr><td>Sede</td><td>${usuario.sede || "—"}</td></tr>
        <tr><td>Turno</td><td>${usuario.turno || "—"}</td></tr>
        <tr><td>Estado</td><td>${ticket.estado}</td></tr>
      </table>
      <table style="margin-top:24px;">
        <tr><td>Remuneración base</td><td>S/. ${monto_bruto}</td></tr>
        <tr>
          <td class="descuento">Descuentos por tardanzas</td>
          <td class="descuento">- S/. ${total_descuentos}</td>
        </tr>
        <tr class="divider">
          <td>Total a cobrar</td><td class="monto-neto">S/. ${monto_neto}</td>
        </tr>
      </table>
      <div class="footer">Documento generado automáticamente — Sistema de Asistencia</div>
    </body></html>
  `);
  ventana.document.close();
  ventana.focus();
  setTimeout(() => { ventana.print(); ventana.close(); }, 400);
};

// ─── Helpers ──────────────────────────────────────────────────
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
    case "enviado":   return "📨 Enviado";
    default:          return "Pendiente";
  }
};

// ─── Componente principal ─────────────────────────────────────
const TicketRemuneracion = ({ usuario }) => {
  const [tickets, setTickets]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [generando, setGenerando]         = useState(false);
  const [enviando, setEnviando]           = useState(null);
  const [eliminando, setEliminando]       = useState(null);
  const [ticketNuevo, setTicketNuevo]     = useState(null);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [confirmEliminar, setConfirmEliminar] = useState(null); // ticket a eliminar
  const [mensaje, setMensaje]             = useState({ type: null, text: null });

  const remuneracion = usuario?.remuneracion;

  const mostrarMensaje = (type, text) => {
    setMensaje({ type, text });
    setTimeout(() => setMensaje({ type: null, text: null }), 4000);
  };

  const cargarTickets = async () => {
    if (!usuario?.id_usuario) return;
    try {
      setLoading(true);
      const data = await getMisTickets(usuario.id_usuario);
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      mostrarMensaje("danger", "No se pudieron cargar tus tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarTickets(); }, [usuario]);

  const handleGenerar = async () => {
    setShowConfirm(false);
    setGenerando(true);
    try {
      const data = await generarTicket(usuario.id_usuario);
      setTicketNuevo(data);
      await cargarTickets();
      mostrarMensaje("success", "✅ Ticket generado correctamente.");
    } catch (err) {
      mostrarMensaje("danger", err.message || "Error al generar el ticket.");
    } finally {
      setGenerando(false);
    }
  };

  const handleEnviar = async (id_ticket) => {
    setEnviando(id_ticket);
    try {
      await enviarTicket(id_ticket);
      await cargarTickets();
      mostrarMensaje("success", "📨 Ticket enviado al administrador.");
    } catch (err) {
      mostrarMensaje("danger", err.message || "Error al enviar el ticket.");
    } finally {
      setEnviando(null);
    }
  };

  const handleEliminar = async () => {
    if (!confirmEliminar) return;
    setEliminando(confirmEliminar.id_ticket);
    setConfirmEliminar(null);
    try {
      await eliminarTicketUsuario(confirmEliminar.id_ticket, usuario.id_usuario);
      // Si era el ticket recién generado, limpiarlo
      if (ticketNuevo?.ticket?.id_ticket === confirmEliminar.id_ticket) {
        setTicketNuevo(null);
      }
      await cargarTickets();
      mostrarMensaje("success", "🗑️ Ticket eliminado correctamente.");
    } catch (err) {
      mostrarMensaje("danger", err.message || "Error al eliminar el ticket.");
    } finally {
      setEliminando(null);
    }
  };

  const puedeEliminar = (estado) => ["pendiente", "enviado"].includes(estado);

  return (
    <>
      {/* ── Mensaje global ── */}
      {mensaje.text && (
        <Alert variant={mensaje.type} className="mb-3" dismissible
          onClose={() => setMensaje({ type: null, text: null })}>
          {mensaje.text}
        </Alert>
      )}

      {/* ── Card principal ── */}
      <Card className="shadow-sm border-0 rounded-3 mb-4">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
            <div className="d-flex align-items-center gap-2">
              <FaTicketAlt size={28} className="text-primary" />
              <div>
                <h5 className="mb-0">Mi Remuneración</h5>
                <small className="text-muted">Genera y gestiona tus tickets de pago</small>
              </div>
            </div>
            <div className="text-end">
              <div className="text-muted" style={{ fontSize: 12 }}>Remuneración base</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: "#16a34a" }}>
                {remuneracion
                  ? `S/. ${Number(remuneracion).toFixed(2)}`
                  : <span className="text-muted fs-6">Sin asignar</span>}
              </div>
            </div>
          </div>

          <div className="text-center mb-2">
            <p className="text-muted mb-3">¿Generar ticket de pago?</p>
            <Button
              variant="primary" size="lg" className="px-5"
              onClick={() => setShowConfirm(true)}
              disabled={generando || !remuneracion}
            >
              {generando
                ? <><Spinner size="sm" className="me-2" />Generando...</>
                : <><FaTicketAlt className="me-2" />Generar Ticket</>}
            </Button>
            {!remuneracion && (
              <div className="text-danger mt-2" style={{ fontSize: 13 }}>
                No tienes remuneración asignada. Contacta al administrador.
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* ── Ticket recién generado ── */}
      {ticketNuevo && (
        <Card className="border-2 border-primary rounded-3 mb-4 shadow">
          <Card.Header className="bg-primary text-white d-flex align-items-center justify-content-between">
            <span><FaTicketAlt className="me-2" />Ticket generado</span>
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => setConfirmEliminar(ticketNuevo.ticket)}
              disabled={eliminando === ticketNuevo.ticket.id_ticket}
            >
              {eliminando === ticketNuevo.ticket.id_ticket
                ? <Spinner size="sm" />
                : <><FaTrash className="me-1" />Eliminar</>}
            </Button>
          </Card.Header>
          <Card.Body className="p-4">
            <Row className="align-items-start g-3">
              <Col xs={12} md={7}>
                <div className="mb-2">
                  <span className="text-muted" style={{ fontSize: 12 }}>Código</span>
                  <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, color: "#1a56db" }}>
                    {ticketNuevo.ticket.codigo_ticket}
                  </div>
                </div>
                <div className="mb-3">
                  <span className="text-muted" style={{ fontSize: 12 }}>Fecha de emisión</span>
                  <div style={{ fontSize: 14 }}>
                    {new Date(ticketNuevo.ticket.fecha_emision).toLocaleString("es-PE", {
                      timeZone: "America/Lima", day: "2-digit", month: "2-digit",
                      year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                </div>
                <Table size="sm" className="mb-0" style={{ fontSize: 14 }}>
                  <tbody>
                    <tr>
                      <td className="text-muted border-0">Remuneración base</td>
                      <td className="text-end border-0">
                        S/. {Number(ticketNuevo.ticket.monto_bruto).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-danger border-0">Descuentos por tardanzas</td>
                      <td className="text-end text-danger border-0">
                        - S/. {Number(ticketNuevo.ticket.total_descuentos).toFixed(2)}
                      </td>
                    </tr>
                    <tr style={{ borderTop: "2px solid #dee2e6" }}>
                      <td className="fw-bold pt-2">Total a cobrar</td>
                      <td className="text-end fw-bold pt-2" style={{ fontSize: 22, color: "#16a34a" }}>
                        S/. {Number(ticketNuevo.ticket.monto).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
              <Col xs={12} md={5} className="d-flex flex-column gap-2 justify-content-center">
                <Button variant="outline-danger"
                  onClick={() => imprimirTicketPDF(ticketNuevo.ticket, ticketNuevo.usuario)}>
                  <FaFilePdf className="me-2" /> Guardar como PDF
                </Button>
                <Button variant="success"
                  onClick={() => handleEnviar(ticketNuevo.ticket.id_ticket)}
                  disabled={enviando === ticketNuevo.ticket.id_ticket}>
                  {enviando === ticketNuevo.ticket.id_ticket
                    ? <><Spinner size="sm" className="me-2" />Enviando...</>
                    : <><FaPaperPlane className="me-2" />Enviar al Administrador</>}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* ── Historial de tickets ── */}
      <Card className="shadow-sm border-0 rounded-3 p-1 ">
        <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
          <strong>Historial de Tickets</strong>
          <Badge bg="secondary">{tickets.length}</Badge>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-4"><Spinner animation="border" size="sm" /></div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <FaTicketAlt size={32} className="mb-2 opacity-25" />
              <p className="mb-0">Aún no has generado tickets.</p>
            </div>
          ) : (
            <Row className="g-3 p-3">
              {tickets.map((t) => (
                <Col key={t.id_ticket} xs={12} sm={6} xl={4}>
                  <Card className="h-100 border shadow-sm">
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, color: "#1a56db" }}>
                          {t.codigo_ticket}
                        </span>
                        <Badge bg={colorEstado(t.estado)}>{labelEstado(t.estado)}</Badge>
                      </div>

                      <div className="text-muted mb-2" style={{ fontSize: 12 }}>
                        {new Date(t.fecha_emision).toLocaleString("es-PE", {
                          timeZone: "America/Lima", day: "2-digit", month: "2-digit",
                          year: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </div>

                      <Table size="sm" className="mb-3" style={{ fontSize: 12 }}>
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
                            <td className="fw-bold ps-0 pt-1">Total</td>
                            <td className="text-end fw-bold pt-1" style={{ fontSize: 16, color: "#16a34a" }}>
                              S/. {Number(t.monto).toFixed(2)}
                            </td>
                          </tr>
                        </tbody>
                      </Table>

                      <div className="d-flex flex-column gap-2">
                        <Button variant="outline-danger" size="sm"
                          onClick={() => imprimirTicketPDF(t, {
                            nombre: t.nombre, apellidos: t.apellidos,
                            sede: t.sede, turno: t.turno,
                          })}>
                          <FaFilePdf className="me-1" /> Guardar PDF
                        </Button>

                        {t.estado === "pendiente" && (
                          <Button variant="success" size="sm"
                            onClick={() => handleEnviar(t.id_ticket)}
                            disabled={enviando === t.id_ticket}>
                            {enviando === t.id_ticket
                              ? <><Spinner size="sm" className="me-1" />Enviando...</>
                              : <><FaPaperPlane className="me-1" />Enviar</>}
                          </Button>
                        )}

                        {t.estado === "enviado" && (
                          <div className="text-info text-center" style={{ fontSize: 12 }}>
                            <FaCheckCircle className="me-1" />Ticket enviado
                          </div>
                        )}
                        {t.estado === "pagado" && (
                          <div className="text-success text-center fw-bold" style={{ fontSize: 13 }}>
                            <FaCheckCircle className="me-1" />Pago confirmado
                          </div>
                        )}
                        {t.estado === "en_espera" && (
                          <div className="text-warning text-center" style={{ fontSize: 12 }}>
                            ⏳ En espera de pago
                          </div>
                        )}

                        {/* ✅ Botón eliminar — solo pendiente o enviado */}
                        {puedeEliminar(t.estado) && (
                          <Button variant="outline-secondary" size="sm"
                            onClick={() => setConfirmEliminar(t)}
                            disabled={eliminando === t.id_ticket}>
                            {eliminando === t.id_ticket
                              ? <><Spinner size="sm" className="me-1" />Eliminando...</>
                              : <><FaTrash className="me-1" />Eliminar</>}
                          </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* ── Modal confirmar generar ── */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>¿Generar ticket?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">Resumen de tu ticket de remuneración:</p>
          <Table bordered size="sm" className="mb-3">
            <tbody>
              <tr>
                <td className="text-muted">Remuneración base</td>
                <td className="text-end fw-bold">
                  S/. {remuneracion ? Number(remuneracion).toFixed(2) : "0.00"}
                </td>
              </tr>
              <tr>
                <td className="text-danger">Descuentos por tardanzas</td>
                <td className="text-end text-danger fw-bold">Se calculará al confirmar</td>
              </tr>
              <tr className="table-success">
                <td className="fw-bold">Monto final</td>
                <td className="text-end fw-bold">Remuneración − descuentos</td>
              </tr>
            </tbody>
          </Table>
          <p className="text-muted text-center" style={{ fontSize: 12 }}>
            Los descuentos se calculan desde tu último ticket generado.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowConfirm(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleGenerar}>
            <FaTicketAlt className="me-2" /> Confirmar y Generar
          </Button>
        </Modal.Footer>
      </Modal>

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
          <p className="text-muted text-center mt-2" style={{ fontSize: 13 }}>
            Esta acción no se puede deshacer.
          </p>
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
    </>
  );
};

export default TicketRemuneracion;
