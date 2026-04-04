import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { marcarAsistencia } from "../api/api";
import "../templates/styles/asistencia.css";

// ─── Estados posibles del escáner ────────────────────────────────────────────
const ESTADO = {
  IDLE: "idle",
  ESCANEANDO: "escaneando",
  CARGANDO: "cargando",
  EXITO: "exito",
  ERROR: "error",
};

const Asistencia = () => {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const ultimoQRRef = useRef("");

  const [estado, setEstado] = useState(ESTADO.IDLE);
  const [mensaje, setMensaje] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [codigoQR, setCodigoQR] = useState("");
  const [pulso, setPulso] = useState(false);

  // ─── Determinar turno por hora ──────────────────────────────────────────────
  const obtenerTurno = () => {
    const hora = new Date().getHours();
    return hora < 13 ? "Mañana" : "Tarde";
  };

  // ─── Reiniciar al estado de escaneo ────────────────────────────────────────
  const reiniciar = () => {
    setEstado(ESTADO.ESCANEANDO);
    setMensaje("");
    setUsuario(null);
    setCodigoQR("");
    ultimoQRRef.current = "";
  };

  // ─── Inicializar escáner ────────────────────────────────────────────────────
  useEffect(() => {
    if (!videoRef.current) return;

    let bloqueado = false;

    const scanner = new QrScanner(
      videoRef.current,
      async (result) => {
        if (bloqueado || !result?.data || result.data === ultimoQRRef.current) return;

        bloqueado = true;
        const qr_code = result.data.trim();
        ultimoQRRef.current = qr_code;

        setCodigoQR(qr_code);
        setEstado(ESTADO.CARGANDO);
        setPulso(true);

        const turno = obtenerTurno();
        console.log("[Asistencia] QR detectado:", qr_code, "| Turno:", turno);

        try {
          const info = await marcarAsistencia(qr_code, turno);
          console.log("[Asistencia] Respuesta backend:", info);

          if (info?.success && info.usuario) {
            setUsuario(info.usuario);
            setMensaje(info.message || "Asistencia registrada correctamente.");
            setEstado(ESTADO.EXITO);
          } else {
            console.warn("[Asistencia] Respuesta con error:", info?.message);
            setUsuario(info?.usuario || null);
            setMensaje(info?.message || "Respuesta inesperada del servidor.");
            setEstado(ESTADO.ERROR);
          }
        } catch (err) {
          console.error("[Asistencia] Error al registrar:", err);

          const msg =
            err?.response?.data?.message ||
            err?.message ||
            "Error desconocido del servidor.";

          setMensaje(msg);
          setUsuario(err?.response?.data?.usuario || null);
          setEstado(ESTADO.ERROR);
        } finally {
          setPulso(false);
        }

        setTimeout(() => {
          reiniciar();
          bloqueado = false;
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
      .then(() => {
        console.log("[Asistencia] Camara iniciada.");
        setEstado(ESTADO.ESCANEANDO);
      })
      .catch((err) => {
        console.error("[Asistencia] Error al iniciar camara:", err);
        setMensaje("No se pudo iniciar la camara.");
        setEstado(ESTADO.ERROR);
      });

    return () => {
      try {
        scannerRef.current?.stop?.();
        scannerRef.current?.destroy?.();
      } catch (e) {
        console.warn("[Asistencia] Error al limpiar escaner:", e);
      }
    };
  }, []);

  // ─── Clases dinámicas del contenedor según estado ──────────────────────────
  const ringClass =
    estado === ESTADO.EXITO
      ? "ring ring--success"
      : estado === ESTADO.ERROR
      ? "ring ring--error"
      : estado === ESTADO.CARGANDO
      ? "ring ring--loading"
      : "ring ring--idle";

  return (
    <div className="asistencia-root">
      {/* Header */}
      <header className="asistencia-header">
        <div className="header-dot" />
        <span className="header-label">Control de Asistencia</span>
      </header>

      <main className="asistencia-main">
        {/* Video con anillo de estado */}
        <div className={ringClass}>
          {estado === ESTADO.CARGANDO && <div className="spinner" />}
          <div className="video-frame">
            <video ref={videoRef} muted playsInline className="video-scan" />
            <div className="scan-line" />
          </div>
        </div>

        {/* Estado label */}
        <div className={`status-badge status-badge--${estado}`}>
          {estado === ESTADO.IDLE && "Iniciando camara..."}
          {estado === ESTADO.ESCANEANDO && "Listo para escanear"}
          {estado === ESTADO.CARGANDO && "Registrando asistencia..."}
          {estado === ESTADO.EXITO && "Asistencia registrada"}
          {estado === ESTADO.ERROR && "Error al registrar"}
        </div>

        {/* Mensaje */}
        {mensaje && (
          <div className={`mensaje-box mensaje-box--${estado}`}>
            {mensaje}
          </div>
        )}

        {/* Datos del usuario */}
        {usuario && (
          <div className="usuario-card">
            <div className="usuario-avatar">
              {usuario.nombre?.charAt(0)}{usuario.apellidos?.charAt(0)}
            </div>
            <div className="usuario-info">
              <p className="usuario-nombre">
                {usuario.nombre} {usuario.apellidos}
              </p>
              <div className="usuario-meta">
                <span className="meta-chip">DNI: {usuario.dni}</span>
                <span className="meta-chip">Turno: {usuario.turno}</span>
                <span className={`meta-chip meta-chip--estado meta-chip--${usuario.estado?.toLowerCase()}`}>
                  {usuario.estado}
                </span>
              </div>
              {usuario.descuento && parseFloat(usuario.descuento) > 0 && (
                <p className="usuario-descuento">
                  Descuento aplicado: S/ {usuario.descuento}
                </p>
              )}
            </div>
          </div>
        )}

        {/* QR leído */}
        {codigoQR && (
          <div className="qr-pill">
            <span className="qr-pill-label">QR</span>
            <span className="qr-pill-value">{codigoQR}</span>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="asistencia-footer">
        <button
          className="btn-login"
          onClick={() => (window.location.href = "/selector")}
        >
          Ir al Login
        </button>
      </footer>

      
    </div>
  );
};

export default Asistencia;
