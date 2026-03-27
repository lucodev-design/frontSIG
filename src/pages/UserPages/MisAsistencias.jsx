import React, { useEffect, useState } from "react";
import { Card, Table, Spinner, Alert, Button, Modal } from "react-bootstrap";
import { FaClock, FaInfoCircle } from "react-icons/fa";
import { getAsistenciasByUser } from "../../api/api";

// ─── Helpers de formato (zona horaria Perú) ───────────────────
const LOCALE = "es-PE";
const TZ = "America/Lima";

const formatSoloFecha = (valor) => {
  if (!valor) return "-";
  try {
    return new Date(valor).toLocaleDateString(LOCALE, {
      timeZone: TZ,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return valor;
  }
};

const formatSoloHora = (valor) => {
  if (!valor) return "-";
  try {
    return new Date(valor).toLocaleTimeString(LOCALE, {
      timeZone: TZ,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return valor;
  }
};

const formatFechaHora = (valor) => {
  if (!valor) return "-";
  try {
    return new Date(valor).toLocaleString(LOCALE, {
      timeZone: TZ,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return valor;
  }
};

// ─── Componente ───────────────────────────────────────────────
const MisAsistencias = ({ usuario }) => {
  const [asistencias, setAsistencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [activityModal, setActivityModal] = useState({
    show: false,
    data: null,
  });

  const fetchAsistencias = async () => {
    if (!usuario?.id_usuario) {
      setError("Error: ID de usuario no disponible.");
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      const response = await getAsistenciasByUser(usuario.id_usuario);

      let asistenciasList = response;

      if (response?.data && Array.isArray(response.data)) {
        asistenciasList = response.data;
      } else if (response?.asistencias && Array.isArray(response.asistencias)) {
        asistenciasList = response.asistencias;
      } else if (!Array.isArray(response)) {
        console.warn("Respuesta de API inesperada:", response);
        asistenciasList = [];
      }

      setAsistencias(asistenciasList);
      setError(null);
    } catch (err) {
      console.error("❌ Error al obtener asistencias:", err);
      setError(err.message || "No se pudieron cargar las asistencias.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchAsistencias();
    const interval = setInterval(fetchAsistencias, 5000);
    return () => clearInterval(interval);
  }, [usuario]);

  const handleShowActivity = (a) => setActivityModal({ show: true, data: a });
  const handleCloseActivity = () =>
    setActivityModal({ show: false, data: null });

  const getStateClass = (estado) => {
    switch (estado) {
      case "Salida":
        return "text-danger";
      case "Tarde":
        return "text-warning";
      case "A tiempo":
      case "Entrada":
        return "text-success";
      default:
        return "text-muted";
    }
  };

  const getStateBadgeClass = (estado) => {
    switch (estado) {
      case "Salida":
        return "bg-danger";
      case "Tarde":
        return "bg-warning text-dark";
      case "A tiempo":
      case "Entrada":
        return "bg-success";
      default:
        return "bg-secondary";
    }
  };

  return (
    <Card className="shadow-sm border-0 p-1">
      <Card.Body className=" p-1 ">
        <div className="d-flex align-items-center mb-3">
          <FaClock size={35} className="text-success me-2" />
          <h5 className="m-0">Mis Registros de Asistencia</h5>
        </div>

        {cargando ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Cargando asistencias...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : asistencias.length === 0 ? (
          <Alert variant="warning">
            No hay asistencias registradas para su usuario.
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table
              striped
              bordered
              hover
              size="sm"
              className="text-center align-middle"
            >
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Hora Entrada</th>
                  <th>Hora Salida</th>
                  <th>Turno</th>
                  <th>Descuento</th>
                  <th>Estado</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {asistencias.map((a, i) => (
                  <tr key={a.id_asistencia || a.id || i}>
                    <td>{i + 1}</td>
                    {/* ✅ fecha y horas formateadas a Perú */}
                    <td>{formatSoloFecha(a.fecha)}</td>
                    <td>{formatSoloHora(a.hora_entrada)}</td>
                    <td>{formatSoloHora(a.hora_salida)}</td>
                    <td>{a.turno || "-"}</td>
                    <td>
                      {a.descuento != null
                        ? parseFloat(a.descuento).toFixed(2)
                        : a.minutos_tarde != null
                          ? parseFloat(a.minutos_tarde).toFixed(2)
                          : "0.00"}
                    </td>
                    <td>
                      <span className={`fw-bold ${getStateClass(a.estado)}`}>
                        {a.estado || "-"}
                      </span>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="info"
                        onClick={() => handleShowActivity(a)}
                      >
                        <FaInfoCircle />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {/* ── Modal detalle ── */}
        <Modal show={activityModal.show} onHide={handleCloseActivity} centered>
          <Modal.Header closeButton className="bg-light">
            <Modal.Title>Detalle de Actividad</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {activityModal.data && (
              <Table striped bordered size="sm" className="mb-0">
                <tbody>
                  <tr>
                    <td className="fw-bold">Fecha:</td>
                    {/* ✅ fecha formateada */}
                    <td>{formatSoloFecha(activityModal.data.fecha)}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Hora Entrada:</td>
                    {/* ✅ hora formateada */}
                    <td>{formatSoloHora(activityModal.data.hora_entrada)}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Hora Salida:</td>
                    {/* ✅ hora formateada */}
                    <td>{formatSoloHora(activityModal.data.hora_salida)}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Turno:</td>
                    <td>{activityModal.data.turno || "N/A"}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Descuento/Atraso:</td>
                    <td>
                      {parseFloat(activityModal.data.descuento || 0).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Estado:</td>
                    <td>
                      <span
                        className={`badge ${getStateBadgeClass(activityModal.data.estado)}`}
                      >
                        {activityModal.data.estado || "N/A"}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </Table>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseActivity}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      </Card.Body>
    </Card>
  );
};

export default MisAsistencias;
