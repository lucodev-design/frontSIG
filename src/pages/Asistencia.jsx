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

  useEffect(() => {
    if (!videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      async (result) => {
        if (result?.data && result.data !== ultimoQR) {
          setUltimoQR(result.data);
          setCodigoQR(result.data);

          const qr_code = result.data; // código leído del QR

          // ✅ Obtener ubicación del dispositivo
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const ubicacion = `${pos.coords.latitude},${pos.coords.longitude}`;

              try {
                // ✅ Llamar a la API con los parámetros individuales (como espera tu api.js)
                const info = await marcarAsistencia(usuario.id_usuario, ubicacion, usuario.turno);

                setMensaje(info.message || "✅ Asistencia registrada correctamente");
                setUsuario(info.usuario || null);
              } catch (error) {
                console.error("❌ Error al registrar asistencia:", error);
                setMensaje(
                  error.response?.data?.message ||
                    "❌ Error al registrar asistencia"
                );
              }

              // 🕓 Limpiar después de 5 segundos
              setTimeout(() => {
                setMensaje("");
                setUsuario(null);
                setCodigoQR("");
                setUltimoQR("");
              }, 5000);
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

    scannerRef.current = scanner;

    scanner
      .start()
      .catch((err) =>
        console.error("❌ Error al iniciar la cámara:", err.message)
      );

    return () => {
      scanner.stop();
      scanner.destroy();
      scannerRef.current = null;
    };
  }, [ultimoQR]);

  return (
    <div className="asistencia-container">
      <h2 className="text-center mb-4 title">📌 Registro de Asistencia</h2>
      <p><b>ANTES</b></p>

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
                Usuario: <strong>{usuario}</strong>
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
              <strong>QR leído:</strong> {codigoQR}
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
