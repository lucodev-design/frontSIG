import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";

const API_URL = import.meta.env.VITE_API_URL; // 👉 variable de entorno

export default function Asistencia() {
  const [mensaje, setMensaje] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [escaneando, setEscaneando] = useState(true);
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      const scanner = new QrScanner(
        videoRef.current,
        async (result) => {
          if (result) {
            setEscaneando(false); // pausa el escaneo mientras procesa

            navigator.geolocation.getCurrentPosition(async (pos) => {
              const ubicacion = `${pos.coords.latitude},${pos.coords.longitude}`;

              try {
                const res = await fetch(`${API_URL}/api/asistencia/marcar`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ qr: result.data, ubicacion }),
                });

                const info = await res.json();
                setMensaje(info.mensaje);
                setUsuario(info.usuario || null);
              } catch (error) {
                console.error("Error al enviar asistencia:", error);
                setMensaje("❌ Error al registrar asistencia");
              } finally {
                setTimeout(() => setEscaneando(true), 3000); // reanudar escaneo
              }
            });
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      scanner.start();
      scannerRef.current = scanner;

      return () => {
        scanner.stop();
      };
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <h1 className="text-4xl font-extrabold mb-6 text-gray-800 tracking-wide">
        📌 Registro de Asistencia
      </h1>

      <div className="bg-white shadow-2xl rounded-2xl p-6 w-full max-w-md flex flex-col items-center transition-transform duration-300 hover:scale-105">
        {/* Video de la cámara */}
        <div className="w-full border-2 border-dashed border-gray-300 rounded-xl overflow-hidden">
          <video ref={videoRef} className="w-full" />
        </div>

        {usuario && (
          <div className="mt-4 text-center">
            <p className="text-gray-700">
              Usuario: <span className="font-semibold">{usuario.nombre}</span>
            </p>
          </div>
        )}

        <p
          className={`mt-3 font-semibold text-center transition-all ${
            mensaje.includes("Error") || mensaje.includes("❌")
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          {mensaje}
        </p>

        <button
          onClick={() => (window.location.href = "/login")}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all"
        >
          🔑 Ir a Login
        </button>

        {!escaneando && (
          <p className="text-sm text-gray-500 mt-2 animate-pulse">
            Procesando escaneo...
          </p>
        )}
      </div>
    </div>
  );
}
