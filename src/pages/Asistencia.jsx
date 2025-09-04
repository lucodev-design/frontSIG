import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import Login from "../components/Login";

const API_URL = import.meta.env.VITE_API_URL; // 👉 ahora usa la variable

export default function Asistencia() {
  const [mensaje, setMensaje] = useState("");
  const [usuario, setUsuario] = useState(null);
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      const scanner = new QrScanner(
        videoRef.current,
        async (result) => {
          if (result) {
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Registro de Asistencia
      </h1>

      <div className="bg-white shadow-lg rounded-2xl p-6 w-96 flex flex-col items-center">
        <video ref={videoRef} style={{ width: "100%" }} />

        {usuario && (
          <p className="mt-4 text-gray-700">
            Usuario: <span className="font-semibold">{usuario.nombre}</span>
          </p>
        )}

        <p className="mt-2 text-green-600 font-semibold">{mensaje}</p>

        <button
          onClick={() => (window.location.href = "/login")}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
            {/* iniciar sesion login */}
            <Login/>
          Iniciar sesión
        </button>
      </div>
    </div>
  );
}
