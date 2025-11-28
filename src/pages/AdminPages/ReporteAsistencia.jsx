// src/pages/AdminPages/ReporteAsistencia.jsx
import React, { useState, useEffect } from "react";
import { getUsers, getAsistenciasByUser, getUltimoReporteUsuario, guardarReporte } from "../../api/api";
import DataTable from "react-data-table-component";
import { Card, Form, Spinner, Button, Modal, Alert } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import moment from "moment-timezone";

const ReporteAsistencia = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingAsistencias, setLoadingAsistencias] = useState(false);
  const [turnoUsuario, setTurnoUsuario] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  
  // Último reporte desde BD
  const [ultimoReporte, setUltimoReporte] = useState(null);
  const [loadingReporte, setLoadingReporte] = useState(false);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const data = await getUsers();
        setUsuarios(data);
      } catch (err) {
        console.error("❌ Error al obtener usuarios:", err);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsuarios();
  }, []);

  // Cargar asistencias y último reporte por usuario
  const handleSelectUser = async (e) => {
    const id_usuario = e.target.value;
    setSelectedUser(id_usuario);
    setAsistencias([]);
    setTurnoUsuario("");
    setUltimoReporte(null);

    if (!id_usuario) return;

    setLoadingAsistencias(true);
    try {
      // Cargar asistencias
      const response = await getAsistenciasByUser(id_usuario);

      if (response.asistencias) {
        setAsistencias(response.asistencias);
        setTurnoUsuario(response.nombre_turno || "No asignado");
      } else {
        setAsistencias(response);
        setTurnoUsuario(response[0]?.nombre_turno || "No asignado");
      }

      // Cargar último reporte
      setLoadingReporte(true);
      const reporteData = await getUltimoReporteUsuario(id_usuario);
      if (reporteData) {
        setUltimoReporte(reporteData);
      }
    } catch (err) {
      console.error("❌ Error al obtener datos:", err);
    } finally {
      setLoadingAsistencias(false);
      setLoadingReporte(false);
    }
  };

  // Función helper para formatear fechas correctamente
  const formatFecha = (fecha) => {
    if (!fecha) return "—";
    return moment.parseZone(fecha).format("DD/MM/YYYY");
  };

  // Función helper para formatear horas
  const formatHora = (hora) => {
    if (!hora) return "—";
    return moment(hora).tz("America/Lima").format("HH:mm:ss");
  };

  // Columnas
  const columns = [
    {
      name: "📅 Fecha",
      selector: (row) => formatFecha(row.fecha),
      sortable: true,
    },
    {
      name: "⏰ Hora Entrada",
      selector: (row) => formatHora(row.hora_entrada),
      sortable: true,
    },
    {
      name: "🏁 Hora Salida",
      selector: (row) => formatHora(row.hora_salida),
      sortable: true,
    },
    {
      name: "📍 Estado",
      selector: (row) => row.estado || "—",
    },
    {
      name: "💰 Descuento (S/)",
      selector: (row) =>
        row.descuento && parseFloat(row.descuento) > 0
          ? parseFloat(row.descuento).toFixed(2)
          : "0.00",
      sortable: true,
    },
  ];

  // Filtrar rango
  const filtrarPorRango = () => {
    if (!fechaInicio || !fechaFin) return asistencias;

    const inicio = moment(fechaInicio).startOf("day");
    const fin = moment(fechaFin).endOf("day");

    return asistencias.filter((a) => {
      const fechaAsistencia = moment.parseZone(a.fecha);
      return fechaAsistencia.isBetween(inicio, fin, null, "[]");
    });
  };

  // Exportar PDF
  const exportarPDF = async () => {
    const usuario = usuarios.find((u) => u.id_usuario == selectedUser);
    const dataFiltrada = filtrarPorRango();

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("📋 Reporte de Asistencias", 14, 15);

    if (usuario) {
      doc.setFontSize(11);
      doc.text(`Empleado: ${usuario.nombre} ${usuario.apellidos}`, 14, 23);
      doc.text(`Turno: ${turnoUsuario}`, 14, 30);
    }

    if (fechaInicio && fechaFin) {
      doc.text(
        `Rango: ${moment(fechaInicio).format("DD/MM/YYYY")} - ${moment(
          fechaFin
        ).format("DD/MM/YYYY")}`,
        14,
        37
      );
    }

    autoTable(doc, {
      startY: 42,
      head: [["Fecha", "Entrada", "Salida", "Estado", "Descuento"]],
      body: dataFiltrada.map((a) => [
        formatFecha(a.fecha),
        formatHora(a.hora_entrada),
        formatHora(a.hora_salida),
        a.estado || "—",
        a.descuento && parseFloat(a.descuento) > 0
          ? parseFloat(a.descuento).toFixed(2)
          : "0.00",
      ]),
    });

    const nombreArchivo = `reporte_asistencias_${usuario?.nombre || "usuario"}.pdf`;
    doc.save(nombreArchivo);
    
    // Guardar en BD
    try {
      const reporteData = {
        id_usuario: selectedUser,
        tipo_reporte: "PDF",
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        nombre_archivo: nombreArchivo,
        total_registros: dataFiltrada.length
      };
      
      const resultado = await guardarReporte(reporteData);
      if (resultado) {
        setUltimoReporte(resultado);
      }
    } catch (err) {
      console.error("❌ Error al guardar reporte:", err);
    }
    
    setShowModal(false);
  };

  // Exportar Excel
  const exportarExcel = async () => {
    const usuario = usuarios.find((u) => u.id_usuario == selectedUser);
    const dataFiltrada = filtrarPorRango();

    const dataExcel = dataFiltrada.map((a) => ({
      Fecha: formatFecha(a.fecha),
      "Hora Entrada": formatHora(a.hora_entrada),
      "Hora Salida": formatHora(a.hora_salida),
      Estado: a.estado || "—",
      "Descuento (S/)":
        a.descuento && parseFloat(a.descuento) > 0
          ? parseFloat(a.descuento).toFixed(2)
          : "0.00",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataExcel);

    worksheet["!cols"] = [
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
      { wch: 12 },
      { wch: 14 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asistencias");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });

    const nombreArchivo = `reporte_asistencias_${usuario?.nombre || "usuario"}.xlsx`;
    saveAs(data, nombreArchivo);
    
    // Guardar en BD
    try {
      const reporteData = {
        id_usuario: selectedUser,
        tipo_reporte: "EXCEL",
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        nombre_archivo: nombreArchivo,
        total_registros: dataFiltrada.length
      };
      
      const resultado = await guardarReporte(reporteData);
      if (resultado) {
        setUltimoReporte(resultado);
      }
    } catch (err) {
      console.error("❌ Error al guardar reporte:", err);
    }
    
    setShowModal(false);
  };

  const conditionalRowStyles = [
    {
      when: (row) => row.descuento && parseFloat(row.descuento) > 0,
      style: {
        backgroundColor: "rgba(255, 0, 0, 0.15)",
        color: "#a00",
        fontWeight: "600",
      },
    },
  ];

  return (
    <div className="container py-4">
      <Card className="shadow-lg p-4 border-0" style={{ borderRadius: "20px" }}>
        <h3 className="text-center mb-4 fw-bold text-primary">
          📋 Reporte de Asistencias
        </h3>

        {/* Selección de usuario */}
        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold">Seleccionar Trabajador</Form.Label>
          {loadingUsers ? (
            <div className="text-center my-3">
              <Spinner animation="border" size="sm" /> Cargando usuarios...
            </div>
          ) : (
            <Form.Select
              value={selectedUser}
              onChange={handleSelectUser}
              className="shadow-sm"
            >
              <option value="">-- Selecciona un usuario --</option>
              {usuarios.map((u) => (
                <option key={u.id_usuario} value={u.id_usuario}>
                  {u.nombre} {u.apellidos}
                </option>
              ))}
            </Form.Select>
          )}
        </Form.Group>

        {/* Datos del empleado */}
        {selectedUser && (
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="text-muted mb-1">
                Trabajador:{" "}
                <span className="fw-bold text-dark">
                  {usuarios.find((u) => u.id_usuario == selectedUser)?.nombre}{" "}
                  {
                    usuarios.find((u) => u.id_usuario == selectedUser)
                      ?.apellidos
                  }
                </span>
              </h5>
              <p className="text-muted mb-0">
                Turno:{" "}
                <span className="fw-semibold text-dark">
                  {turnoUsuario}
                </span>
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
              📤 Exportar
            </Button>
          </div>
        )}

        {/* Último reporte generado */}
        {ultimoReporte && !loadingReporte && (
          <Alert variant="success" className="mb-3">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h6 className="fw-bold mb-2">✅ Último Reporte Generado</h6>
                <p className="mb-1 small">
                  <strong>Tipo:</strong>{" "}
                  <span className={ultimoReporte.tipo_reporte === "PDF" ? "text-danger" : "text-success"}>
                    {ultimoReporte.tipo_reporte === "PDF" ? "📄 PDF" : "📗 EXCEL"}
                  </span>
                </p>
                <p className="mb-1 small">
                  <strong>Generado:</strong> {moment(ultimoReporte.fecha_generacion).format("DD/MM/YYYY HH:mm:ss")}
                </p>
                <p className="mb-1 small">
                  <strong>Rango:</strong> {moment(ultimoReporte.fecha_inicio).format("DD/MM/YYYY")} - {moment(ultimoReporte.fecha_fin).format("DD/MM/YYYY")}
                </p>
                <p className="mb-0 small">
                  <strong>Registros:</strong> {ultimoReporte.total_registros}
                </p>
              </div>
            </div>
          </Alert>
        )}

        {/* Tabla */}
        {loadingAsistencias ? (
          <div className="text-center mt-4">
            <Spinner animation="border" variant="primary" /> Cargando asistencias...
          </div>
        ) : asistencias.length > 0 ? (
          <DataTable
            columns={columns}
            data={asistencias}
            pagination
            highlightOnHover
            striped
            responsive
            conditionalRowStyles={conditionalRowStyles}
          />
        ) : (
          selectedUser && (
            <p className="text-center text-muted mt-3">
              No hay registros de asistencia para este usuario.
            </p>
          )
        )}
      </Card>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>📤 Exportar Reporte</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Desde:</Form.Label>
              <Form.Control
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Hasta:</Form.Label>
              <Form.Control
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </Form.Group>
          </Form>

          {/* Información del último reporte en el modal también */}
          {ultimoReporte && (
            <div className="mt-3 p-3 bg-light rounded border">
              <h6 className="fw-bold text-success mb-2">
                📊 Último reporte guardado
              </h6>
              <div className="small">
                <p className="mb-1">
                  <strong>Tipo:</strong>{" "}
                  <span className={ultimoReporte.tipo_reporte === "PDF" ? "text-danger" : "text-success"}>
                    {ultimoReporte.tipo_reporte === "PDF" ? "📄 PDF" : "📗 EXCEL"}
                  </span>
                </p>
                <p className="mb-1">
                  <strong>Fecha:</strong> {moment(ultimoReporte.fecha_generacion).format("DD/MM/YYYY HH:mm")}
                </p>
                <p className="mb-0">
                  <strong>Rango:</strong> {moment(ultimoReporte.fecha_inicio).format("DD/MM/YYYY")} - {moment(ultimoReporte.fecha_fin).format("DD/MM/YYYY")}
                </p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={exportarExcel}
            disabled={!fechaInicio || !fechaFin}
          >
            📗 Excel
          </Button>
          <Button
            variant="danger"
            onClick={exportarPDF}
            disabled={!fechaInicio || !fechaFin}
          >
            📄 PDF
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReporteAsistencia;