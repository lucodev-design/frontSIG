import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import qrScannerWorkerPath from "qr-scanner/qr-scanner-worker.min?url";
import "../templates/styles/asistencia.css";
import { marcarAsistencia } from "../api/api";

const Asistencia = () => {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const [mensaje, setMensaje] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [codigoQR, setCodigoQR] = useState("");
  const [ultimoQR, setUltimoQR] = useState("");
  const [origenError, setOrigenError] = useState("");

  useEffect(() => {
    if (!videoRef.current) return;

    let escaneoBloqueado = false; 

    const scanner = new QrScanner(
      videoRef.current,
      async (result) => {
        if (escaneoBloqueado || !result?.data || result.data === ultimoQR) return;

        escaneoBloqueado = true; 
        
        const qr_code = result.data.trim();
        setUltimoQR(qr_code);
        setCodigoQR(qr_code);

        try {
          // ✅ CAMBIO: Determinar el turno basándose en la hora actual
          // Para usuarios con "Tiempo Completo", el backend manejará la validación
          const horaActual = new Date().getHours();
          let turno;
          
          if (horaActual < 13) {
            turno = "Mañana";
          } else if (horaActual >= 13 && horaActual < 19) {
            turno = "Tarde";
          } else {
            // Para horas fuera del horario normal, enviar "Tarde"
            // El backend validará según el turno asignado del usuario
            turno = "Tarde";
          }

          console.log("📤 Enviando a marcarAsistencia:", { qr_code, turno, hora: horaActual });

          const info = await marcarAsistencia(qr_code, turno);
          console.log("📥 Respuesta del backend:", info);

          if (info?.success && info.usuario) {
            setUsuario(info.usuario);
            setMensaje(info.message || "✅ Asistencia registrada correctamente.");
            setOrigenError("");
          } else if (info?.message) {
            console.warn("⚠️ Error backend:", info.message);
            setUsuario(info.usuario || null); // ✅ Mostrar datos del usuario incluso en error
            setMensaje(`❌ ${info.message}`);
            setOrigenError("BACKEND");
          } else {
            console.error("❌ Respuesta inesperada:", info);
            setUsuario(null);
            setMensaje("❌ Respuesta inesperada del servidor.");
            setOrigenError("BACKEND");
          }
        } catch (err) {
          console.error("❌ Error al registrar asistencia:", err);

          if (err.response) {
            console.error("📡 BACKEND ERROR:", err.response);
            
            // ✅ Extraer mensaje y datos del usuario del error
            const errorMessage = err.response.data?.message || "Error desconocido del servidor";
            const errorUsuario = err.response.data?.usuario || null;
            
            setMensaje(`❌ ${errorMessage}`);
            setUsuario(errorUsuario); // ✅ Mostrar datos del usuario incluso en error
            setOrigenError("BACKEND");
          } else if (err.request) {
            console.error("📡 Sin respuesta del backend:", err.request);
            setMensaje("❌ No hubo respuesta del servidor (posible desconexión).");
            setOrigenError("BACKEND");
          } else {
            console.error("⚠️ FRONTEND ERROR:", err.message);
            setMensaje(`❌ Error en el frontend: ${err.message}`);
            setOrigenError("FRONTEND");
          }

          if (!err.response?.data?.usuario) {
            setUsuario(null);
          }
        }

        // 🧹 Limpieza de estados después de 5 segundos
        setTimeout(() => {
          setMensaje("");
          setUsuario(null);
          setCodigoQR("");
          setUltimoQR("");
          setOrigenError("");
          escaneoBloqueado = false;
        }, 5000);
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 5,
      }
    );

    scannerRef.current = scanner;

    scanner
      .start()
      .then(() => console.log("🎥 Cámara iniciada correctamente"))
      .catch((err) => {
        console.error("❌ Error al iniciar cámara:", err);
        setMensaje("❌ No se pudo iniciar la cámara");
        setOrigenError("FRONTEND");
      });

    return () => {
      try {
        scannerRef.current?.stop?.();
        scannerRef.current?.destroy?.();
      } catch (e) {
        console.warn("⚠️ Error al limpiar escáner:", e);
      }
    };
  }, [ultimoQR]);

  return (
    <div className="asistencia-container">
      <h2 className="text-center mb-4 title">📋 Registro de Asistencia</h2>
      <div className="asistencia-card shadow">
        <div className="card-body text-center">
          <div className="video-wrapper">
            <video ref={videoRef} muted className="video-scan" />
          </div>

          {mensaje && (
            <div
              className={`alert mt-3 ${
                origenError === "BACKEND"
                  ? "alert-danger"
                  : origenError === "FRONTEND"
                  ? "alert-warning"
                  : "alert-success"
              }`}
            >
              {mensaje}
              {origenError && (
                <div className="mt-2">
                  <strong>📍 Origen:</strong> {origenError}
                </div>
              )}
            </div>
          )}

          {usuario && (
            <div className="alert alert-info mt-2 text-start">
              <p>
                <strong>👤 Nombre:</strong> {usuario.nombre} {usuario.apellidos}
              </p>
              <p>
                <strong>🆔 DNI:</strong> {usuario.dni}
              </p>
              <p>
                <strong>⏰ Turno:</strong> {usuario.turno}
              </p>
              <p>
                <strong>📊 Estado:</strong> {usuario.estado}
              </p>
              {usuario.descuento && parseFloat(usuario.descuento) > 0 && (
                <p className="text-danger">
                  <strong>💰 Descuento:</strong> S/ {usuario.descuento}
                </p>
              )}
            </div>
          )}

          {codigoQR && (
            <div className="alert alert-secondary mt-2">
              <strong>🔍 QR leído:</strong> {codigoQR}
            </div>
          )}

          <button
            onClick={() => (window.location.href = "/selector")}
            className="btn btn-primary mt-3 w-100"
          >
            🔑 Ir a Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Asistencia;