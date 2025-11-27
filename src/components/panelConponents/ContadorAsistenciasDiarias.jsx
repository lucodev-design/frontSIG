// ContadorAsistenciasDiarias.jsx
import React, { useState, useEffect } from "react";
import { getConteoDiario } from "../../api/api"; // 👈 Importar desde tu API

const ContadorAsistenciasDiarias = () => {
  const [contadorHoy, setContadorHoy] = useState(0);
  const [loading, setLoading] = useState(true);

  // Obtener la fecha actual en formato YYYY-MM-DD
  const obtenerFechaHoy = () => {
    const hoy = new Date();
    return hoy.toISOString().split("T")[0];
  };

  // Función para obtener el conteo de asistencias del día desde el backend
  const obtenerConteoDesdeBackend = async () => {
    try {
      const fechaHoy = obtenerFechaHoy();

      // 👇 Usar la función importada desde api.js
      const response = await getConteoDiario(fechaHoy);

      if (response && typeof response.total === "number") {
        setContadorHoy(response.total);
        console.log(`✅ Conteo obtenido del backend: ${response.total}`);
      }
      setLoading(false);
    } catch (error) {
      console.error("❌ Error al obtener conteo de asistencias:", error);
      // Si falla, intentar obtener del localStorage como respaldo
      const datosGuardados = localStorage.getItem("asistenciasDiarias");
      if (datosGuardados) {
        const { fecha, contador } = JSON.parse(datosGuardados);
        const hoy = obtenerFechaHoy();
        if (fecha === hoy) {
          setContadorHoy(contador);
        }
      }
      setLoading(false);
    }
  };

  // Cargar el conteo al montar el componente
  useEffect(() => {
    obtenerConteoDesdeBackend();

    // Actualizar cada 30 segundos para mantener el conteo actualizado
    const intervalo = setInterval(() => {
      obtenerConteoDesdeBackend();
    }, 30000); // 30 segundos

    return () => clearInterval(intervalo);
  }, []);

  // Función para incrementar el contador (para llamadas directas desde otros componentes)
  const incrementarContador = () => {
    setContadorHoy((prev) => {
      const nuevo = prev + 1;
      // Guardar en localStorage como respaldo
      localStorage.setItem(
        "asistenciasDiarias",
        JSON.stringify({
          fecha: obtenerFechaHoy(),
          contador: nuevo,
        })
      );
      return nuevo;
    });
  };

  // Exponer la función globalmente
  useEffect(() => {
    window.incrementarAsistencia = incrementarContador;

    return () => {
      delete window.incrementarAsistencia;
    };
  }, []);

  if (loading) {
    return (
      <div className="card shadow-sm border-0 text-center">
        <div className="card-body">
          <h6 className="text-muted mb-2">Asistencias Hoy</h6>
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0 text-center">
      <div className="card-body">
        <h6 className="text-muted mb-2">Asistencias Hoy</h6>
        <h2
          className="text-success mb-2"
          style={{ fontSize: "3rem", fontWeight: "bold" }}
        >
          {contadorHoy}
        </h2>
        <small className="text-muted">
          {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </small>
        <button
          className="btn btn-sm btn-outline-success mt-2"
          onClick={obtenerConteoDesdeBackend}
          title="Actualizar conteo"
        >
          🔄 Actualizar
        </button>
      </div>
    </div>
  );
};

export default ContadorAsistenciasDiarias;
