import React, { useEffect, useState, useCallback } from "react";
import {
  Button,
  Form,
  Card,
  Row,
  Col,
  Table,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";
import {
  getSedes,
  getUsuariosPorSede,
  generarReporteConsolidado,
  generarReportePorSede,
  generarReportePorTrabajador,
  exportarReporteExcel,
  exportarReportePDF,
} from "../../api/api.js";
import { FaFileExcel, FaFilePdf, FaSearch, FaChartLine } from "react-icons/fa";

const FILTROS_INICIAL = {
  tipoReporte: "consolidado",
  periodo: "mensual",
  mes: new Date().getMonth() + 1,
  anio: new Date().getFullYear(),
  quincena: "1",
  sedeSeleccionada: "",
  trabajadorSeleccionado: "",
  fechaInicio: "",
  fechaFin: "",
};

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// ✅ Calcula estadísticas desde las filas según el tipo de reporte
const calcularEstadisticasFrontend = (rows, tipoReporte) => {
  if (!rows || rows.length === 0) return null;

  let total_asistencias = 0;
  let total_tardanzas = 0;
  let total_faltas = 0;

  if (tipoReporte === "consolidado") {
    // Cada fila es una sede con columnas: asistencias, tardanzas, faltas
    total_asistencias = rows.reduce(
      (s, r) => s + (parseInt(r.asistencias) || 0),
      0,
    );
    total_tardanzas = rows.reduce(
      (s, r) => s + (parseInt(r.tardanzas) || 0),
      0,
    );
    total_faltas = rows.reduce((s, r) => s + (parseInt(r.faltas) || 0), 0);
  } else if (tipoReporte === "sede") {
    // Cada fila es un trabajador con: dias_presente, dias_tardanza, dias_falta
    total_asistencias = rows.reduce(
      (s, r) => s + (parseInt(r.dias_presente) || 0),
      0,
    );
    total_tardanzas = rows.reduce(
      (s, r) => s + (parseInt(r.dias_tardanza) || 0),
      0,
    );
    total_faltas = rows.reduce((s, r) => s + (parseInt(r.dias_falta) || 0), 0);
  } else if (tipoReporte === "trabajador") {
    // Cada fila es un día con columna: estado
    total_asistencias = rows.filter((r) => r.estado === "Presente").length;
    total_tardanzas = rows.filter((r) => r.estado === "Tardanza").length;
    total_faltas = rows.filter((r) => r.estado === "Falta").length;
  }

  const total = total_asistencias + total_tardanzas + total_faltas;
  const porcentaje_asistencia =
    total > 0 ? ((total_asistencias / total) * 100).toFixed(2) : "0.00";

  return {
    total_asistencias,
    total_tardanzas,
    total_faltas,
    porcentaje_asistencia,
  };
};

export default function ReportesGenerales() {
  const [sedes, setSedes] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);

  const [loadingCatalogo, setLoadingCatalogo] = useState(false);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [filtros, setFiltros] = useState(FILTROS_INICIAL);
  const [reporteData, setReporteData] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);

  const setFiltro = (campo, valor) =>
    setFiltros((prev) => ({ ...prev, [campo]: valor }));

  const handleTipoReporteChange = (valor) => {
    setFiltros((prev) => ({
      ...prev,
      tipoReporte: valor,
      sedeSeleccionada: "",
      trabajadorSeleccionado: "",
    }));
    setTrabajadores([]);
    setReporteData([]);
    setEstadisticas(null);
    setError("");
    setSuccess("");
  };

  const cargarSedes = useCallback(async () => {
    setLoadingCatalogo(true);
    setError("");
    try {
      const data = await getSedes();
      setSedes(data);
    } catch (err) {
      setError("No se pudieron cargar las sedes. Intente recargar la página.");
      console.error("Error cargarSedes:", err);
    } finally {
      setLoadingCatalogo(false);
    }
  }, []);

  const cargarTrabajadores = useCallback(async (sedeId) => {
    setLoadingCatalogo(true);
    setError("");
    setTrabajadores([]);
    setFiltro("trabajadorSeleccionado", "");
    try {
      const data = await getUsuariosPorSede(sedeId);
      setTrabajadores(data);
    } catch (err) {
      setError(
        "No se pudieron cargar los trabajadores de la sede seleccionada.",
      );
      console.error("Error cargarTrabajadores:", err);
    } finally {
      setLoadingCatalogo(false);
    }
  }, []);

  useEffect(() => {
    cargarSedes();
  }, [cargarSedes]);

  useEffect(() => {
    if (filtros.sedeSeleccionada && filtros.tipoReporte === "trabajador") {
      cargarTrabajadores(filtros.sedeSeleccionada);
    }
  }, [filtros.sedeSeleccionada, filtros.tipoReporte, cargarTrabajadores]);

  const validar = () => {
    const {
      tipoReporte,
      periodo,
      mes,
      anio,
      fechaInicio,
      fechaFin,
      sedeSeleccionada,
      trabajadorSeleccionado,
    } = filtros;
    if (periodo !== "personalizado" && (!mes || !anio))
      return "Debe seleccionar mes y año.";
    if (periodo === "personalizado") {
      if (!fechaInicio || !fechaFin)
        return "Debe seleccionar fecha de inicio y fin.";
      if (new Date(fechaInicio) > new Date(fechaFin))
        return "La fecha de inicio no puede ser mayor a la fecha fin.";
    }
    if (tipoReporte === "sede" && !sedeSeleccionada)
      return "Debe seleccionar una sede.";
    if (tipoReporte === "trabajador" && !sedeSeleccionada)
      return "Debe seleccionar una sede.";
    if (tipoReporte === "trabajador" && !trabajadorSeleccionado)
      return "Debe seleccionar un trabajador.";
    return null;
  };

  const handleGenerarReporte = async () => {
    const mensajeError = validar();
    if (mensajeError) {
      setError(mensajeError);
      return;
    }

    setLoadingReporte(true);
    setError("");
    setSuccess("");
    setReporteData([]);
    setEstadisticas(null);

    const {
      tipoReporte,
      mes,
      anio,
      periodo,
      quincena,
      fechaInicio,
      fechaFin,
      sedeSeleccionada,
      trabajadorSeleccionado,
    } = filtros;
    const params = { mes, anio, periodo, quincena, fechaInicio, fechaFin };

    try {
      let data = null;

      if (tipoReporte === "consolidado") {
        data = await generarReporteConsolidado(params);
      } else if (tipoReporte === "sede") {
        data = await generarReportePorSede({
          ...params,
          sedeId: sedeSeleccionada,
        });
      } else if (tipoReporte === "trabajador") {
        data = await generarReportePorTrabajador({
          ...params,
          usuarioId: trabajadorSeleccionado,
        });
      }

      if (!data || !data.reporte)
        throw new Error(
          "La respuesta del servidor no tiene el formato esperado.",
        );

      const filas = data.reporte;
      setReporteData(filas);

      // ✅ Siempre calcular desde el frontend para garantizar consistencia
      const stats = calcularEstadisticasFrontend(filas, tipoReporte);
      setEstadisticas(stats);

      setSuccess(
        filas.length > 0
          ? `Reporte generado exitosamente — ${filas.length} registros encontrados.`
          : "Reporte generado, pero no se encontraron registros para los filtros seleccionados.",
      );
    } catch (err) {
      setError(
        err.message || "Error al generar el reporte. Intente nuevamente.",
      );
      console.error("Error handleGenerarReporte:", err);
    } finally {
      setLoadingReporte(false);
    }
  };

  const handleExportarExcel = async () => {
    if (reporteData.length === 0) {
      setError("No hay datos para exportar. Genere un reporte primero.");
      return;
    }
    setLoadingExcel(true);
    setError("");
    try {
      const {
        tipoReporte,
        mes,
        anio,
        periodo,
        quincena,
        fechaInicio,
        fechaFin,
        sedeSeleccionada,
        trabajadorSeleccionado,
      } = filtros;
      await exportarReporteExcel({
        tipoReporte,
        mes,
        anio,
        periodo,
        quincena,
        fechaInicio,
        fechaFin,
        sedeId: sedeSeleccionada,
        usuarioId: trabajadorSeleccionado,
      });
      setSuccess("Reporte exportado a Excel exitosamente.");
    } catch (err) {
      setError("Error al exportar a Excel. Intente nuevamente.");
      console.error("Error handleExportarExcel:", err);
    } finally {
      setLoadingExcel(false);
    }
  };

  const handleExportarPDF = async () => {
    if (reporteData.length === 0) {
      setError("No hay datos para exportar. Genere un reporte primero.");
      return;
    }
    setLoadingPDF(true);
    setError("");
    try {
      const {
        tipoReporte,
        mes,
        anio,
        periodo,
        quincena,
        fechaInicio,
        fechaFin,
        sedeSeleccionada,
        trabajadorSeleccionado,
      } = filtros;
      await exportarReportePDF({
        tipoReporte,
        mes,
        anio,
        periodo,
        quincena,
        fechaInicio,
        fechaFin,
        sedeId: sedeSeleccionada,
        usuarioId: trabajadorSeleccionado,
      });
      setSuccess("Reporte exportado a PDF exitosamente.");
    } catch (err) {
      setError("Error al exportar a PDF. Intente nuevamente.");
      console.error("Error handleExportarPDF:", err);
    } finally {
      setLoadingPDF(false);
    }
  };

  const {
    tipoReporte,
    periodo,
    mes,
    anio,
    quincena,
    sedeSeleccionada,
    trabajadorSeleccionado,
    fechaInicio,
    fechaFin,
  } = filtros;

  const hayAccionEnCurso = loadingReporte || loadingExcel || loadingPDF;

  // ✅ Labels de tarjetas según tipo de reporte
  const labelAsistencias =
    tipoReporte === "consolidado"
      ? "Total Asistencias"
      : tipoReporte === "sede"
        ? "Días Presentes"
        : "Días Presente";
  const labelTardanzas =
    tipoReporte === "consolidado" ? "Total Tardanzas" : "Días Tardanza";
  const labelFaltas =
    tipoReporte === "consolidado" ? "Total Faltas" : "Días Falta";

  return (
    <div className="p-4">
      <h3 className="mb-4">
        <FaChartLine className="me-2" />
        Reportes Generales de Asistencia
      </h3>

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
        <Card.Body className="p-1">
          <Row className="mb-3 p-1">
            <Col md={4}>
              <Form.Label>Tipo de Reporte</Form.Label>
              <Form.Select
                value={tipoReporte}
                onChange={(e) => handleTipoReporteChange(e.target.value)}
                disabled={loadingReporte}
              >
                <option value="consolidado">
                  Consolidado General (Todas las Sedes)
                </option>
                <option value="sede">Por Sede Específica</option>
                <option value="trabajador">Por Trabajador</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label>Período</Form.Label>
              <Form.Select
                value={periodo}
                onChange={(e) => setFiltro("periodo", e.target.value)}
                disabled={loadingReporte}
              >
                <option value="mensual">Mensual</option>
                <option value="quincenal">Quincenal</option>
                <option value="personalizado">
                  Personalizado (Rango de Fechas)
                </option>
              </Form.Select>
            </Col>
            {periodo !== "personalizado" && (
              <Col md={2}>
                <Form.Label>Mes</Form.Label>
                <Form.Select
                  value={mes}
                  onChange={(e) => setFiltro("mes", Number(e.target.value))}
                  disabled={loadingReporte}
                >
                  {MESES.map((m, idx) => (
                    <option key={idx} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            )}
            {periodo !== "personalizado" && (
              <Col md={2}>
                <Form.Label>Año</Form.Label>
                <Form.Control
                  type="number"
                  value={anio}
                  onChange={(e) => setFiltro("anio", Number(e.target.value))}
                  min="2020"
                  max="2099"
                  disabled={loadingReporte}
                />
              </Col>
            )}
          </Row>

          <Row className="mb-3">
            {periodo === "quincenal" && (
              <Col md={3}>
                <Form.Label>Quincena</Form.Label>
                <Form.Select
                  value={quincena}
                  onChange={(e) => setFiltro("quincena", e.target.value)}
                  disabled={loadingReporte}
                >
                  <option value="1">1ra Quincena (1-15)</option>
                  <option value="2">2da Quincena (16-fin)</option>
                </Form.Select>
              </Col>
            )}
            {periodo === "personalizado" && (
              <>
                <Col md={3}>
                  <Form.Label>Fecha Inicio</Form.Label>
                  <Form.Control
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFiltro("fechaInicio", e.target.value)}
                    disabled={loadingReporte}
                  />
                </Col>
                <Col md={3}>
                  <Form.Label>Fecha Fin</Form.Label>
                  <Form.Control
                    type="date"
                    value={fechaFin}
                    min={fechaInicio}
                    onChange={(e) => setFiltro("fechaFin", e.target.value)}
                    disabled={loadingReporte}
                  />
                </Col>
              </>
            )}
            {(tipoReporte === "sede" || tipoReporte === "trabajador") && (
              <Col md={tipoReporte === "trabajador" ? 4 : 6}>
                <Form.Label>Sede</Form.Label>
                <Form.Select
                  value={sedeSeleccionada}
                  onChange={(e) =>
                    setFiltro("sedeSeleccionada", e.target.value)
                  }
                  disabled={loadingReporte || loadingCatalogo}
                >
                  <option value="">
                    {loadingCatalogo
                      ? "Cargando sedes..."
                      : "Seleccione una sede"}
                  </option>
                  {sedes.map((sede) => (
                    <option key={sede.id_sede} value={sede.id_sede}>
                      {sede.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            )}
            {tipoReporte === "trabajador" && (
              <Col md={4}>
                <Form.Label>Trabajador</Form.Label>
                <Form.Select
                  value={trabajadorSeleccionado}
                  onChange={(e) =>
                    setFiltro("trabajadorSeleccionado", e.target.value)
                  }
                  disabled={
                    !sedeSeleccionada || loadingReporte || loadingCatalogo
                  }
                >
                  <option value="">
                    {loadingCatalogo
                      ? "Cargando trabajadores..."
                      : sedeSeleccionada
                        ? "Seleccione un trabajador"
                        : "Primero seleccione una sede"}
                  </option>
                  {trabajadores.map((t) => (
                    <option key={t.id_usuario} value={t.id_usuario}>
                      {t.nombre} {t.apellidos}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            )}
          </Row>

          <Row>
            <Col>
              <Button
                variant="primary"
                className="me-2"
                onClick={handleGenerarReporte}
                disabled={hayAccionEnCurso || loadingCatalogo}
              >
                {loadingReporte ? (
                  <>
                    <Spinner size="sm" className="me-1" />
                    Generando...
                  </>
                ) : (
                  <>
                    <FaSearch className="me-1" />
                    Generar Reporte
                  </>
                )}
              </Button>
              <Button
                variant="success"
                className="me-2"
                onClick={handleExportarExcel}
                disabled={hayAccionEnCurso || reporteData.length === 0}
              >
                {loadingExcel ? (
                  <>
                    <Spinner size="sm" className="me-1" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <FaFileExcel className="me-1" />
                    Exportar Excel
                  </>
                )}
              </Button>
              <Button
                variant="danger"
                onClick={handleExportarPDF}
                disabled={hayAccionEnCurso || reporteData.length === 0}
              >
                {loadingPDF ? (
                  <>
                    <Spinner size="sm" className="me-1" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <FaFilePdf className="me-1" />
                    Exportar PDF
                  </>
                )}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ✅ TARJETAS DE ESTADÍSTICAS */}
      {estadisticas && (
        <Row className="mb-4">
          {[
            {
              label: labelAsistencias,
              value: estadisticas.total_asistencias,
              color: "text-success",
              border: "border-success",
            },
            {
              label: labelTardanzas,
              value: estadisticas.total_tardanzas,
              color: "text-warning",
              border: "border-warning",
            },
            {
              label: labelFaltas,
              value: estadisticas.total_faltas,
              color: "text-danger",
              border: "border-danger",
            },
            {
              label: "% Asistencia",
              value: `${estadisticas.porcentaje_asistencia}%`,
              color:
                parseFloat(estadisticas.porcentaje_asistencia) >= 80
                  ? "text-success"
                  : "text-danger",
              border:
                parseFloat(estadisticas.porcentaje_asistencia) >= 80
                  ? "border-success"
                  : "border-danger",
            },
          ].map(({ label, value, color, border }) => (
            <Col md={3} key={label}>
              <Card
                className={`text-center shadow-sm ${border}`}
                style={{ borderWidth: "2px" }}
              >
                <Card.Body>
                  <h6 className="text-muted mb-1">{label}</h6>
                  <h2 className={`fw-bold ${color}`}>{value}</h2>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* TABLA DE RESULTADOS */}
      <Card className="shadow-sm p-1">
        <Card.Header className="bg-light d-flex align-items-center">
          <strong>Resultados del Reporte</strong>
          {reporteData.length > 0 && (
            <Badge bg="info" className="ms-2">
              {reporteData.length} registros
            </Badge>
          )}
        </Card.Header>
        <Card.Body>
          {loadingReporte ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Generando reporte...</p>
            </div>
          ) : reporteData.length === 0 ? (
            <div className="text-center text-muted py-5">
              <FaChartLine size={50} className="mb-3 opacity-25" />
              <p>
                No hay datos para mostrar. Genere un reporte para ver los
                resultados.
              </p>
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
                        <td key={i}>
                          {val !== null && val !== undefined
                            ? String(val)
                            : "—"}
                        </td>
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
