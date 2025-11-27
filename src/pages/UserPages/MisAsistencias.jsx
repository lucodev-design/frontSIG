import React, { useEffect, useState } from "react";
import { Card, Table, Spinner, Alert, Button, Modal } from "react-bootstrap";
import { FaClock, FaInfoCircle } from "react-icons/fa";
// Asegúrate de que esta ruta a la API sea correcta
import { getAsistenciasByUser } from "../../api/api"; 

const MisAsistencias = ({ usuario }) => {
  const [asistencias, setAsistencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [activityModal, setActivityModal] = useState({ show: false, data: null });

  const fetchAsistencias = async () => {
    // Si el usuario no está definido o no tiene ID, salimos
    if (!usuario?.id_usuario) {
        setError("Error: ID de usuario no disponible.");
        setCargando(false);
        return;
    }

    try {
      setCargando(true);
      // Llamamos a la API
      const response = await getAsistenciasByUser(usuario.id_usuario);
      
      let asistenciasList = response;

      // 1. Manejo de la Respuesta: Verificar si la API anida la lista en una propiedad (ej: 'data' o 'asistencias')
      if (response && response.data && Array.isArray(response.data)) {
          asistenciasList = response.data;
      } else if (response && response.asistencias && Array.isArray(response.asistencias)) {
          asistenciasList = response.asistencias;
      } else if (!Array.isArray(response)) {
          // Si no es un array y no tiene las propiedades esperadas, podría ser un error de formato
          console.warn("Respuesta de API inesperada:", response);
          asistenciasList = [];
      }
      
      setAsistencias(asistenciasList);
      setError(null);
    } catch (err) {
      console.error("❌ Error al obtener asistencias:", err);
      // Incluimos el mensaje de error de la respuesta si está disponible
      setError(err.message || "No se pudieron cargar las asistencias.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    // 1. Ejecutar inmediatamente al cargar
    fetchAsistencias(); 
    
    // 2. Establecer intervalo de refresco (5 segundos)
    const interval = setInterval(fetchAsistencias, 5000); 
    
    // 3. Limpiar el intervalo al desmontar el componente
    return () => clearInterval(interval);
  }, [usuario]); // Dependencia en 'usuario' para recargar si el objeto 'usuario' cambia

  const handleShowActivity = (asistencia) => {
    setActivityModal({ show: true, data: asistencia });
  };

  const handleCloseActivity = () => {
    setActivityModal({ show: false, data: null });
  };
  
  // Helper para determinar el color del estado
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

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
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
          <Alert variant="warning">No hay asistencias registradas para su usuario.</Alert>
        ) : (
          <div className="table-responsive">
            <Table striped bordered hover size="sm" className="text-center">
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
                {/* Usamos a.id_asistencia o a.id como key si están disponibles, sino i */}
                {asistencias.map((a, i) => (
                  <tr key={a.id_asistencia || a.id || i}>
                    <td>{i + 1}</td>
                    <td>{a.fecha}</td>
                    <td>{a.hora_entrada || "-"}</td>
                    <td>{a.hora_salida || "-"}</td>
                    <td>{a.turno || "-"}</td>
                    {/* Asumiendo que 'descuento' es un porcentaje o un valor numérico */}
                    <td>{a.descuento || a.minutos_tarde ? `${a.descuento || a.minutos_tarde}%` : "-"}</td> 
                    <td>
                      <span className={`fw-bold ${getStateClass(a.estado)}`}>
                        {a.estado}
                      </span>
                    </td>
                    <td>
                      <Button size="sm" variant="info" onClick={() => handleShowActivity(a)}>
                        <FaInfoCircle />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {/* Modal Activity View */}
        <Modal show={activityModal.show} onHide={handleCloseActivity} centered>
          <Modal.Header closeButton className="bg-light">
            <Modal.Title>Detalle de Actividad</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {activityModal.data && (
              <Table striped bordered hover size="sm">
                <tbody>
                    <tr>
                        <td><strong>Fecha:</strong></td>
                        <td>{activityModal.data.fecha}</td>
                    </tr>
                    <tr>
                        <td><strong>Hora Entrada:</strong></td>
                        <td>{activityModal.data.hora_entrada || "N/A"}</td>
                    </tr>
                    <tr>
                        <td><strong>Hora Salida:</strong></td>
                        <td>{activityModal.data.hora_salida || "N/A"}</td>
                    </tr>
                    <tr>
                        <td><strong>Turno:</strong></td>
                        <td>{activityModal.data.turno || "N/A"}</td>
                    </tr>
                    <tr>
                        <td><strong>Descuento/Atraso:</strong></td>
                        <td>{activityModal.data.descuento ? `${activityModal.data.descuento}%` : "0%"}</td>
                    </tr>
                    <tr>
                        <td><strong>Estado:</strong></td>
                        <td><span className={`badge ${getStateClass(activityModal.data.estado).replace('text-', 'bg-')}`}>{activityModal.data.estado}</span></td>
                    </tr>
                </tbody>
            </Table>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseActivity}>Cerrar</Button>
          </Modal.Footer>
        </Modal>
      </Card.Body>
    </Card>
  );
};

export default MisAsistencias;