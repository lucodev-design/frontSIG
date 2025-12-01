import React, { useEffect, useState } from "react";
import { Button, Form, Card, Row, Col, Table, Spinner, Alert, Badge } from "react-bootstrap";
import { 
  getSedes, 
  getUsuariosPorSede,
  generarReporteConsolidado,
  generarReportePorSede,
  generarReportePorTrabajador,
  exportarReporteExcel,
  exportarReportePDF
} from "../../api/api.js";
import { FaFileExcel, FaFilePdf, FaSearch, FaChartLine } from "react-icons/fa";

export default function ReportesGenerales() {
  // Estados principales
  const [sedes, setSedes] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filtros
  const [tipoReporte, setTipoReporte] = useState("consolidado"); // consolidado | sede | trabajador
  const [periodo, setPeriodo] = useState("mensual"); // mensual | quincenal | personalizado
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [quincena, setQuincena] = useState("1");
  const [sedeSeleccionada, setSedeSeleccionada] = useState("");
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // Datos del reporte
  const [reporteData, setReporteData] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);

  // Cargar sedes al montar
  useEffect(() => {
    cargarSedes();
  }, []);

  // Cargar trabajadores cuando cambia la sede
  useEffect(() => {
    if (sedeSeleccionada && tipoReporte === "trabajador") {
      cargarTrabajadores(sedeSeleccionada);
    }
  }, [sedeSeleccionada, tipoReporte]);

  // ====================================
  // FUNCIONES DE CARGA
  // ====================================
  const cargarSedes = async () => {
    const data = await getSedes();
    setSedes(data);
  };

  const cargarTrabajadores = async (sedeId) => {
    const data = await getUsuariosPorSede(sedeId);
    setTrabajadores(data);
  };

  // ====================================
  // GENERAR REPORTE
  // ====================================
  const handleGenerarReporte = async () => {
    // Validaciones
    if (periodo !== "personalizado" && (!mes || !anio)) {
      setError("Debe seleccionar mes y año");
      return;
    }

    if (periodo === "personalizado" && (!fechaInicio || !fechaFin)) {
      setError("Debe seleccionar fecha de inicio y fin");
      return;
    }

    if (tipoReporte === "sede" && !sedeSeleccionada) {
      setError("Debe seleccionar una sede");
      return;
    }

    if (tipoReporte === "trabajador" && !trabajadorSeleccionado) {
      setError("Debe seleccionar un trabajador");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const params = {
        mes,
        anio,
        periodo,
        quincena,
        fechaInicio,
        fechaFin,
      };

      let data = null;

      if (tipoReporte === "consolidado") {
        data = await generarReporteConsolidado(params);
      } else if (tipoReporte === "sede") {
        data = await generarReportePorSede({ ...params, sedeId: sedeSeleccionada });
      } else if (tipoReporte === "trabajador") {
        data = await generarReportePorTrabajador({ ...params, usuarioId: trabajadorSeleccionado });
      }

      setReporteData(data.reporte || []);
      setEstadisticas(data.estadisticas || null);
      setSuccess("Reporte generado exitosamente");
    } catch (err) {
      setError(err.message || "Error al generar reporte");
    } finally {
      setLoading(false);
    }
  };

  // ====================================
  // EXPORTAR
  // ====================================
  const handleExportarExcel = async () => {
    if (reporteData.length === 0) {
      setError("No hay datos para exportar");
      return;
    }

    try {
      setLoading(true);
      await exportarReporteExcel({
        tipoReporte,
        mes,
        anio,
        periodo,
        sedeId: sedeSeleccionada,
        usuarioId: trabajadorSeleccionado,
        datos: reporteData,
      });
      setSuccess("Reporte exportado a Excel exitosamente");
    } catch (err) {
      setError("Error al exportar a Excel");
    } finally {
      setLoading(false);
    }
  };

  const handleExportarPDF = async () => {
    if (reporteData.length === 0) {
      setError("No hay datos para exportar");
      return;
    }

    try {
      setLoading(true);
      await exportarReportePDF({
        tipoReporte,
        mes,
        anio,
        periodo,
        sedeId: sedeSeleccionada,
        usuarioId: trabajadorSeleccionado,
        datos: reporteData,
      });
      setSuccess("Reporte exportado a PDF exitosamente");
    } catch (err) {
      setError("Error al exportar a PDF");
    } finally {
      setLoading(false);
    }
  };

  // ====================================
  // RENDERIZADO
  // ====================================
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return (
    <div className="p-4">
      <h3 className="mb-4">
        <FaChartLine className="me-2" />
        Reportes Generales de Asistencia
      </h3>

      {/* ALERTAS */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* FORMULARIO DE FILTROS */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white">
          <strong>Filtros de Búsqueda</strong>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            {/* Tipo de Reporte */}
            <Col md={4}>
              <Form.Label>Tipo de Reporte</Form.Label>
              <Form.Select
                value={tipoReporte}
                onChange={(e) => {
                  setTipoReporte(e.target.value);
                  setReporteData([]);
                  setEstadisticas(null);
                }}
              >
                <option value="consolidado">Consolidado General (Todas las Sedes)</option>
                <option value="sede">Por Sede Específica</option>
                <option value="trabajador">Por Trabajador</option>
              </Form.Select>
            </Col>

            {/* Período */}
            <Col md={4}>
              <Form.Label>Período</Form.Label>
              <Form.Select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
              >
                <option value="mensual">Mensual</option>
                <option value="quincenal">Quincenal</option>
                <option value="personalizado">Personalizado (Rango de Fechas)</option>
              </Form.Select>
            </Col>

            {/* Mes (si no es personalizado) */}
            {periodo !== "personalizado" && (
              <Col md={2}>
                <Form.Label>Mes</Form.Label>
                <Form.Select value={mes} onChange={(e) => setMes(e.target.value)}>
                  {meses.map((m, idx) => (
                    <option key={idx} value={idx + 1}>{m}</option>
                  ))}
                </Form.Select>
              </Col>
            )}

            {/* Año (si no es personalizado) */}
            {periodo !== "personalizado" && (
              <Col md={2}>
                <Form.Label>Año</Form.Label>
                <Form.Control
                  type="number"
                  value={anio}
                  onChange={(e) => setAnio(e.target.value)}
                  min="2020"
                  max="2099"
                />
              </Col>
            )}
          </Row>

          <Row className="mb-3">
            {/* Quincena (solo si es quincenal) */}
            {periodo === "quincenal" && (
              <Col md={3}>
                <Form.Label>Quincena</Form.Label>
                <Form.Select value={quincena} onChange={(e) => setQuincena(e.target.value)}>
                  <option value="1">1ra Quincena (1-15)</option>
                  <option value="2">2da Quincena (16-fin)</option>
                </Form.Select>
              </Col>
            )}

            {/* Fecha Inicio/Fin (solo si es personalizado) */}
            {periodo === "personalizado" && (
              <>
                <Col md={3}>
                  <Form.Label>Fecha Inicio</Form.Label>
                  <Form.Control
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </Col>
                <Col md={3}>
                  <Form.Label>Fecha Fin</Form.Label>
                  <Form.Control
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                </Col>
              </>
            )}

            {/* Sede (si es por sede o trabajador) */}
            {(tipoReporte === "sede" || tipoReporte === "trabajador") && (
              <Col md={tipoReporte === "trabajador" ? 4 : 6}>
                <Form.Label>Sede</Form.Label>
                <Form.Select
                  value={sedeSeleccionada}
                  onChange={(e) => setSedeSeleccionada(e.target.value)}
                >
                  <option value="">Seleccione una sede</option>
                  {sedes.map((sede) => (
                    <option key={sede.id_sede} value={sede.id_sede}>
                      {sede.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            )}

            {/* Trabajador (solo si es por trabajador) */}
            {tipoReporte === "trabajador" && (
              <Col md={4}>
                <Form.Label>Trabajador</Form.Label>
                <Form.Select
                  value={trabajadorSeleccionado}
                  onChange={(e) => setTrabajadorSeleccionado(e.target.value)}
                  disabled={!sedeSeleccionada}
                >
                  <option value="">
                    {sedeSeleccionada ? "Seleccione un trabajador" : "Primero seleccione una sede"}
                  </option>
                  {trabajadores.map((trabajador) => (
                    <option key={trabajador.id_usuario} value={trabajador.id_usuario}>
                      {trabajador.nombre} {trabajador.apellidos}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            )}
          </Row>

          {/* BOTONES DE ACCIÓN */}
          <Row>
            <Col>
              <Button
                variant="primary"
                className="me-2"
                onClick={handleGenerarReporte}
                disabled={loading}
              >
                <FaSearch className="me-1" />
                {loading ? <Spinner size="sm" className="me-1" /> : null}
                Generar Reporte
              </Button>

              <Button
                variant="success"
                className="me-2"
                onClick={handleExportarExcel}
                disabled={loading || reporteData.length === 0}
              >
                <FaFileExcel className="me-1" />
                Exportar Excel
              </Button>

              <Button
                variant="danger"
                onClick={handleExportarPDF}
                disabled={loading || reporteData.length === 0}
              >
                <FaFilePdf className="me-1" />
                Exportar PDF
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ESTADÍSTICAS RESUMEN */}
      {estadisticas && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <h6 className="text-muted">Total Asistencias</h6>
                <h3 className="text-success">{estadisticas.total_asistencias}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <h6 className="text-muted">Total Tardanzas</h6>
                <h3 className="text-warning">{estadisticas.total_tardanzas}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <h6 className="text-muted">Total Faltas</h6>
                <h3 className="text-danger">{estadisticas.total_faltas}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <h6 className="text-muted">% Asistencia</h6>
                <h3 className="text-primary">{estadisticas.porcentaje_asistencia}%</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* TABLA DE RESULTADOS */}
      <Card className="shadow-sm">
        <Card.Header className="bg-light">
          <strong>Resultados del Reporte</strong>
          {reporteData.length > 0 && (
            <Badge bg="info" className="ms-2">
              {reporteData.length} registros
            </Badge>
          )}
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Generando reporte...</p>
            </div>
          ) : reporteData.length === 0 ? (
            <div className="text-center text-muted py-5">
              <FaChartLine size={50} className="mb-3 opacity-25" />
              <p>No hay datos para mostrar. Genere un reporte para ver los resultados.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead className="table-primary">
                  <tr>
                    {Object.keys(reporteData[0]).map((key) => (
                      <th key={key}>{key.replace(/_/g, " ").toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reporteData.map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map((val, i) => (
                        <td key={i}>{val !== null && val !== undefined ? val : "-"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}