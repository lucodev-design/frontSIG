import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";

const API_URL = import.meta.env.VITE_API_URL;

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
          if (result && result.data && result.data !== ultimoQR) {
            setUltimoQR(result.data);
            setCodigoQR(result.data);

            // Obtener geolocalización
            navigator.geolocation.getCurrentPosition(
              async (pos) => {
                const ubicacion = `${pos.coords.latitude},${pos.coords.longitude}`;
                try {
                  const res = await fetch(`${API_URL}/api/auth/asistencia/marcar`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ qr: result.data, ubicacion }),
                  });

                  const info = await res.json();

                  if (!res.ok) {
                    setMensaje(info.mensaje || "❌ Error en el servidor");
                  } else {
                    setMensaje(info.mensaje);
                    setUsuario(info.usuario || null);

                    // 🔹 Recargar página después de 5 segundos
                    setTimeout(() => {
                      window.location.reload();
                    }, 5000);
                  }
                } catch (error) {
                  console.error("❌ Error al registrar asistencia:", error);
                  setMensaje("❌ Error al registrar asistencia");
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
    <div className="container mt-5">
      <h2 className="text-center mb-4">📌 Registro de Asistencia</h2>

      <div className="card shadow-lg">
        <div className="card-body text-center">
          {/* Video cámara */}
          <video ref={videoRef} style={{ width: "100%" }} muted />

          {/* Mensaje */}
          {mensaje && (
            <div
              className={`alert mt-3 ${
                mensaje.includes("Error") || mensaje.includes("❌")
                  ? "alert-danger"
                  : "alert-success"
              }`}
            >
              {mensaje}
            </div>
          )}

          {/* Usuario */}
          {usuario && (
            <div className="alert alert-info mt-2">
              Usuario: <strong>{usuario.nombre}</strong> <br />
              Rol: <strong>{usuario.rol}</strong>
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
            className="btn btn-primary mt-3"
          >
            🔑 Ir a Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Asistencia;
