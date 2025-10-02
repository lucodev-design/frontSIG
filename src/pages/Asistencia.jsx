// src/pages/Asistencia.jsx
import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import "../templates/styles/asistencia.css";
import { marcarAsistencia } from "../api/api";

const Asistencia = () => {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  const [mensaje, setMensaje] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [codigoQR, setCodigoQR] = useState("");
  const [ultimoQR, setUltimoQR] = useState("");

  useEffect(() => {
    if (videoRef.current && !scannerRef.current) {
      scannerRef.current = new QrScanner(
        videoRef.current,
        async (result) => {
          if (result?.data && result.data !== ultimoQR) {
            setUltimoQR(result.data);
            setCodigoQR(result.data);

            const id_usuario = result.data;

            navigator.geolocation.getCurrentPosition(
              async (pos) => {
                const ubicacion = `${pos.coords.latitude},${pos.coords.longitude}`;

                try {
                  const info = await marcarAsistencia(id_usuario, ubicacion);

                  setMensaje(info.mensaje || "✅ Asistencia registrada");
                  setUsuario(info.usuario || null);

                  setTimeout(() => {
                    setMensaje("");
                    setUsuario(null);
                    setCodigoQR("");
                    setUltimoQR("");
                  }, 5000);
                } catch (error) {
                  console.error("❌ Error al registrar asistencia:", error);
                  setMensaje(
                    error.response?.data?.mensaje ||
                      "❌ Error al registrar asistencia"
                  );
                }
              },
              (err) => {
                console.error("❌ Error de geolocalización:", err.message);
                setMensaje("❌ No se pudo obtener ubicación");
              },
              { enableHighAccuracy: true }
            );
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 1,
        }
      );

      scannerRef.current.start();
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
    };
  }, [ultimoQR]);

  return (
    <div className="asistencia-container">
      <h2 className="text-center mb-4 title">📌 Registro de Asistencia</h2>

      <div className="asistencia-card shadow">
        <div className="card-body text-center">
          {/* Cámara */}
          <div className="video-wrapper">
            <video ref={videoRef} muted className="video-scan" />
          </div>

          {/* Mensaje */}
          {mensaje && (
            <div
              className={`alert mt-3 ${
                mensaje.includes("Error") || mensaje.includes("❌")
                  ? "alert-danger"
                  : mensaje.includes("⚠️")
                  ? "alert-warning"
                  : "alert-success"
              }`}
            >
              {mensaje}
            </div>
          )}

          {/* Usuario */}
          {usuario && (
            <div className="alert alert-info mt-2 text-start">
              <p>
                Usuario: <strong>{usuario.nombre}</strong>
              </p>
              <p>
                Rol: <strong>{usuario.rol}</strong>
              </p>
              <p>
                Hora:{" "}
                <strong>
                  {new Date().toLocaleTimeString("es-PE", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </strong>
              </p>
            </div>
          )}

          {/* Código QR leído */}
          {codigoQR && (
            <div className="alert alert-secondary mt-2">
              <strong>QR leído (ID usuario):</strong> {codigoQR}
            </div>
          )}

          {/* Botón Login */}
          <button
            onClick={() => (window.location.href = "/login")}
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
