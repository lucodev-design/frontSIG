import React, { useState } from "react";
import {
  getReporteConsolidado,
  getReporteTrabajador,
  exportarExcel,
  exportarPDF,
} from "../../../api/api";

export default function FiltrosReportes({
  sedes,
  setDataReporte,
  tipoVista,
  setTipoVista,
  setGraficoDesempeno,
  setGraficoTotales,
}) {
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");
  const [sede_id, setSedeId] = useState("todas");   // ← CORREGIDO
  const [tipoReporte, setTipoReporte] = useState("mensual");
  const [quincena, setQuincena] = useState("1");

  const generar = async () => {
    if (!mes || !anio) return alert("Seleccione mes y año");

    const params = {
      mes: Number(mes),
      anio: Number(anio),
      sede_id: sede_id === "todas" ? "todas" : Number(sede_id), // ← CORRECTO
      tipo_reporte: tipoReporte,                                 // ← CORRECTO
      quincena: Number(quincena),
    };

    const res =
      tipoVista === "consolidado"
        ? await getReporteConsolidado(params)
        : await getReporteTrabajador(params);

    if (!res.success) {
      alert("No se pudo generar el reporte");
      return;
    }

    setDataReporte(res.data || []);
    setGraficoDesempeno(res.desempeno || null);
    setGraficoTotales(res.totales || null);
  };

  const exportExcel = async () => {
    const params = {
      mes: Number(mes),
      anio: Number(anio),
      sede_id: sede_id === "todas" ? "todas" : Number(sede_id),
      tipo_reporte: tipoReporte,
      quincena: Number(quincena),
      vista: tipoVista,
    };
    const res = await exportarExcel(params);
    if (!res.success) alert("No se pudo exportar a Excel");
  };

  const exportPDF = async () => {
    const params = {
      mes: Number(mes),
      anio: Number(anio),
      sede_id: sede_id === "todas" ? "todas" : Number(sede_id),
      tipo_reporte: tipoReporte,
      quincena: Number(quincena),
      vista: tipoVista,
    };
    const res = await exportarPDF(params);
    if (!res.success) alert("No se pudo exportar a PDF");
  };

  return (
    <div className="filters-container">
      <div className="row">
        <div className="col-md-2">
          <label>Mes:</label>
          <input
            type="number"
            className="form-control"
            min="1"
            max="12"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
          />
        </div>

        <div className="col-md-2">
          <label>Año:</label>
          <input
            type="number"
            className="form-control"
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <label>Sede:</label>
          <select
            className="form-control"
            value={sede_id}
            onChange={(e) => setSedeId(e.target.value)}
          >
            <option value="todas">Todas</option>
            {sedes.map((s) => (
              <option key={s.id_sede} value={s.id_sede}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-2">
          <label>Tipo Reporte:</label>
          <select
            className="form-control"
            value={tipoReporte}
            onChange={(e) => setTipoReporte(e.target.value)}
          >
            <option value="mensual">Mensual</option>
            <option value="quincenal">Quincenal</option>
          </select>
        </div>

        {tipoReporte === "quincenal" && (
          <div className="col-md-2">
            <label>Quincena:</label>
            <select
              className="form-control"
              value={quincena}
              onChange={(e) => setQuincena(e.target.value)}
            >
              <option value="1">1ra (1-15)</option>
              <option value="2">2da (16-31)</option>
            </select>
          </div>
        )}
      </div>

      <div className="mt-3 d-flex gap-3">
        <button className="btn btn-primary" onClick={generar}>
          Generar Reporte
        </button>

        <button className="btn btn-success" onClick={exportExcel}>
          Exportar Excel
        </button>

        <button className="btn btn-danger" onClick={exportPDF}>
          Exportar PDF
        </button>

        <select
          className="form-select w-auto ms-auto"
          value={tipoVista}
          onChange={(e) => setTipoVista(e.target.value)}
        >
          <option value="consolidado">Consolidado</option>
          <option value="trabajador">Por Trabajador</option>
        </select>
      </div>
    </div>
  );
}
