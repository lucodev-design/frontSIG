import React, { useEffect, useState } from "react";
import { Spinner, Modal } from "react-bootstrap";
import { FaClock, FaInfoCircle } from "react-icons/fa";
import { getAsistenciasByUser } from "../../api/api";

const LOCALE = "es-PE";
const TZ = "America/Lima";

const formatFecha = (v) => {
  if (!v) return "-";
  try { return new Date(v).toLocaleDateString(LOCALE, { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" }); }
  catch { return v; }
};
const formatHora = (v) => {
  if (!v) return "-";
  try { return new Date(v).toLocaleTimeString(LOCALE, { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: true }); }
  catch { return v; }
};

const EstadoBadge = ({ estado }) => {
  const map = {
    "Salida":   { bg: "rgba(239,68,68,0.1)",   color: "#ef4444", border: "rgba(239,68,68,0.2)" },
    "Tarde":    { bg: "rgba(245,158,11,0.1)",  color: "#f59e0b", border: "rgba(245,158,11,0.2)" },
    "A tiempo": { bg: "rgba(16,185,129,0.1)",  color: "#10b981", border: "rgba(16,185,129,0.2)" },
    "Entrada":  { bg: "rgba(16,185,129,0.1)",  color: "#10b981", border: "rgba(16,185,129,0.2)" },
  };
  const s = map[estado] || { bg: "rgba(156,163,175,0.1)", color: "#9ca3af", border: "rgba(156,163,175,0.2)" };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: "nowrap" }}>
      {estado || "-"}
    </span>
  );
};

const DescuentoBadge = ({ valor }) => {
  const d = parseFloat(valor || 0);
  return (
    <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: d > 0 ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", color: d > 0 ? "#ef4444" : "#10b981" }}>
      S/ {d.toFixed(2)}
    </span>
  );
};

const MisAsistencias = ({ usuario }) => {
  const [asistencias, setAsistencias] = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [error, setError]             = useState(null);
  const [modal, setModal]             = useState({ show: false, data: null });

  const fetchAsistencias = async () => {
    if (!usuario?.id_usuario) { setError("ID de usuario no disponible."); setCargando(false); return; }
    try {
      setCargando(true);
      const res = await getAsistenciasByUser(usuario.id_usuario);
      const lista = Array.isArray(res) ? res : res?.asistencias || res?.data || [];
      setAsistencias(lista);
      setError(null);
    } catch (err) {
      console.error("[MisAsistencias] Error:", err);
      setError(err.message || "No se pudieron cargar las asistencias.");
    } finally { setCargando(false); }
  };

  useEffect(() => {
    fetchAsistencias();
    const id = setInterval(fetchAsistencias, 5000);
    return () => clearInterval(id);
  }, [usuario]);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FaClock size={18} color="#10b981" />
        </div>
        <div>
          <h5 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e1f2e" }}>Mis Registros de Asistencia</h5>
          <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>{asistencias.length} registro{asistencias.length !== 1 ? "s" : ""} encontrado{asistencias.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        {cargando ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 60, color: "#9ca3af", fontSize: 14 }}>
            <Spinner animation="border" size="sm" /><span>Cargando asistencias...</span>
          </div>
        ) : error ? (
          <div style={{ padding: "16px 20px", background: "rgba(239,68,68,0.06)", color: "#b91c1c", fontSize: 13 }}>{error}</div>
        ) : asistencias.length === 0 ? (
          <div style={{ padding: "16px 20px", background: "rgba(14,165,233,0.06)", color: "#0369a1", fontSize: 13 }}>
            No hay asistencias registradas para tu usuario.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8f9fc" }}>
                  {["#", "Fecha", "Hora Entrada", "Hora Salida", "Turno", "Descuento", "Estado", ""].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left", borderBottom: "1px solid #f0f2f8", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {asistencias.map((a, i) => (
                  <tr key={a.id_asistencia || a.id || i} style={{ borderBottom: "1px solid #f8f9fc", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafbff"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "12px 16px", color: "#9ca3af", fontWeight: 600 }}>{i + 1}</td>
                    <td style={{ padding: "12px 16px", color: "#1e1f2e", fontWeight: 600 }}>{formatFecha(a.fecha)}</td>
                    <td style={{ padding: "12px 16px", color: "#374151" }}>{formatHora(a.hora_entrada)}</td>
                    <td style={{ padding: "12px 16px", color: "#374151" }}>{formatHora(a.hora_salida)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100, background: "rgba(99,102,241,0.1)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.15)" }}>
                        {a.turno || "-"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <DescuentoBadge valor={a.descuento ?? a.minutos_tarde} />
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <EstadoBadge estado={a.estado} />
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button
                        onClick={() => setModal({ show: true, data: a })}
                        style={{ background: "rgba(99,102,241,0.1)", border: "none", borderRadius: 8, padding: "6px 10px", color: "#6366f1", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.2)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.1)"}
                      >
                        <FaInfoCircle size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal show={modal.show} onHide={() => setModal({ show: false, data: null })} centered>
        <Modal.Header closeButton style={{ background: "#1e1f2e", color: "#fff", border: "none" }}>
          <Modal.Title style={{ fontSize: 15, fontWeight: 700 }}>Detalle de Asistencia</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: 24 }}>
          {modal.data && (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                ["Fecha",            formatFecha(modal.data.fecha)],
                ["Hora Entrada",     formatHora(modal.data.hora_entrada)],
                ["Hora Salida",      formatHora(modal.data.hora_salida)],
                ["Turno",            modal.data.turno || "N/A"],
                ["Estado",           null],
                ["Descuento",        `S/ ${parseFloat(modal.data.descuento || 0).toFixed(2)}`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid #f0f2f8" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#9ca3af" }}>{k}</span>
                  {k === "Estado"
                    ? <EstadoBadge estado={modal.data.estado} />
                    : <span style={{ fontSize: 13, fontWeight: 600, color: "#1e1f2e" }}>{v}</span>
                  }
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ border: "none", padding: "0 24px 20px" }}>
          <button
            style={{ border: "none", borderRadius: 10, padding: "9px 20px", background: "#6366f1", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}
            onClick={() => setModal({ show: false, data: null })}
          >
            Cerrar
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MisAsistencias;
