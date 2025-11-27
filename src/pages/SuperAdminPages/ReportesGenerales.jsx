import React, { useEffect, useState } from "react";
import { getSedes, getReporteConsolidado, getReporteTrabajador,
   getGraficosDesempeno } from "../../api/api.js";
import { Button, Form, Card, Row, Col } from "react-bootstrap";
import { Line, Pie } from "react-chartjs-2";
import "chart.js/auto";

export default function ReportesGenerales() {
  const [sedes, setSedes] = useState([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState("todas");
  const [tipoReporte, setTipoReporte] = useState("mensual");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");
  const [quincena, setQuincena] = useState("1");
  const [reporteData, setReporteData] = useState([]);
  const [desempenoData, setDesempenoData] = useState(null);

  // Auto-refresh gráfico cada 5 minutos
  useEffect(() => {
    cargarSedes();
    cargarGraficos();
    const interval = setInterval(cargarGraficos, 300000);
    return () => clearInterval(interval);
  }, []);

  const cargarSedes = async () => {
    const data = await getSedes();
    setSedes(data);
  };

  const cargarGraficos = async () => {
    const data = await getGraficosDesempeno(sedeSeleccionada);
    setDesempenoData(data);
  };

  const generarReporte = async () => {
    if (!mes || !anio)
      return alert("Debe seleccionar mes y año");

    const params = {
      mes,
      anio,
      tipoReporte,
      quincena,
      sede: sedeSeleccionada,
    };

    const data =
      tipoReporte === "trabajador"
        ? await getReporteTrabajador(params)
        : await getReporteConsolidado(params);

    setReporteData(data);
  };

  const exportarExcel = () => {
    alert("Exportando a Excel (pendiente de integrar API)...");
  };

  const exportarPDF = () => {
    alert("Exportando a PDF (pendiente de integrar API)...");
  };

  return (
    <div className="card p-4">

      <h3 className="mb-3">📊 Reportes Generales</h3>

      {/* FILTROS PRINCIPALES */}
      <Card className="p-3 mb-4 sombra">
        <Row>
          <Col md={3}>
            <Form.Label>Tipo de reporte</Form.Label>
            <Form.Select value={tipoReporte} onChange={(e) => setTipoReporte(e.target.value)}>
              <option value="mensual">Consolidado Mensual</option>
              <option value="quincenal">Consolidado Quincenal</option>
              <option value="trabajador">Por Trabajador</option>
            </Form.Select>
          </Col>

          <Col md={3}>
            <Form.Label>Mes</Form.Label>
            <Form.Select value={mes} onChange={(e) => setMes(e.target.value)}>
              <option value="">Seleccione</option>
              {[...Array(12).keys()].map((m) => (
                <option key={m} value={m + 1}>{m + 1}</option>
              ))}
            </Form.Select>
          </Col>

          <Col md={2}>
            <Form.Label>Año</Form.Label>
            <Form.Control
              type="number"
              placeholder="2025"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
            />
          </Col>

          {tipoReporte === "quincenal" && (
            <Col md={2}>
              <Form.Label>Quincena</Form.Label>
              <Form.Select value={quincena} onChange={(e) => setQuincena(e.target.value)}>
                <option value="1">1ra Quincena</option>
                <option value="2">2da Quincena</option>
              </Form.Select>
            </Col>
          )}

          <Col md={2}>
            <Form.Label>Sede</Form.Label>
            <Form.Select value={sedeSeleccionada} onChange={(e) => setSedeSeleccionada(e.target.value)}>
              <option value="todas">Todas</option>
              {sedes?.map((s) => (
                <option key={s.id_sede} value={s.id_sede}>{s.nombre}</option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col>
            <Button className="me-2" onClick={generarReporte}>Generar Reporte</Button>
            <Button variant="success" className="me-2" onClick={exportarExcel}>Exportar Excel</Button>
            <Button variant="danger" onClick={exportarPDF}>Exportar PDF</Button>
          </Col>
        </Row>
      </Card>

      {/* RESULTADOS DEL REPORTE */}
      <Card className="p-3 mb-4">
        <h5>📄 Resultados del Reporte</h5>
        {reporteData.length === 0 ? (
          <p>No hay datos para mostrar. Genere un reporte.</p>
        ) : (
          <pre>{JSON.stringify(reporteData, null, 2)}</pre>
        )}
      </Card>

      {/* GRÁFICO DE DESEMPEÑO */}
      <Card className="p-3">
        <h5>📈 Gráfico de Desempeño</h5>

        {desempenoData ? (
          <Line
            data={{
              labels: ["Puntualidad", "Tardanzas", "Faltas"],
              datasets: [
                {
                  label: "Desempeño",
                  data: [
                    desempenoData.puntualidad,
                    desempenoData.tardanzas,
                    desempenoData.faltas,
                  ],
                },
              ],
            }}
          />
        ) : (
          <p>Cargando gráfico...</p>
        )}
      </Card>
    </div>
  );
}
