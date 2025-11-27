import axios from "axios";

// api.js
export const API_URL = import.meta.env.VITE_API_URL?.trim() || "http://localhost:4000";

// ====== ROLES ======
// ====== CREAR ROL ======
export const createRol = async (data) => {
  const res = await axios.post(`${API_URL}/api/roles/rol`, data);
  return res.data;
};
// ====== LISTAR ROLES ======
export const getRoles = async () => {
  const res = await axios.get(`${API_URL}/api/roles/rol`);
  return res.data;
};
// ====== ACTUALIZAR ROLES ======
export const updateRol = async (id_rol, data) => {
  const res = await axios.put(`${API_URL}/api/roles/rol/${id_rol}`, data);
  return res.data;
};
// ====== ELIMINAR ROLES ======
export const deleteRol = async (id_rol) => {
  const res = await axios.delete(`${API_URL}/api/roles/rol/${id_rol}`);
  return res.data;
};

// ====== SEDES ======
// -------------Crear SEDES ----------------
export const createSede = async (data) => {
  const res = await axios.post(`${API_URL}/api/auth/sedes`, data);
  return res.data;
};
// -------------Listar SEDES ----------------
export const getSedes = async () => {
  const res = await axios.get(`${API_URL}/api/auth/sedes`);
  return res.data;
};
// ====== ACTUALIZAR SEDE ======
export const updateSede = async (id_sede, data) => {
  const res = await axios.put(`${API_URL}/api/auth/sedes/${id_sede}`, data);
  return res.data;
};
// ====== ELIMINAR SEDE ======
export const deleteSede = async (id_sede) => {
  const res = await axios.delete(`${API_URL}/api/auth/sedes/${id_sede}`);
  return res.data;
};

// ========================================================================

// Crear administrador
export const createAdmin = async (data) => {
  const res = await axios.post(`${API_URL}/api/super/admins`, data);
  return res.data;
};

// Listar administradores
export const getAdmins = async () => {
  const res = await axios.get(`${API_URL}/api/super/admins`);
  return res.data;
};

// Actualizar administrador
export const updateAdmin = async (id, data) => {
  const res = await axios.put(`${API_URL}/api/super/admins/${id}`, data);
  return res.data;
};

// Eliminar administrador
export const deleteAdmin = async (id) => {
  const res = await axios.delete(`${API_URL}/api/super/admins/${id}`);
  
  return res.data;
};


// ========================================================================

// ====== USUARIOS ======
export const registerUser = async (data) => {
  const res = await axios.post(`${API_URL}/api/registro/registerUser`, data);
  return res.data;
};

export const getUsers = async () => {
  const res = await axios.get(`${API_URL}/api/registro/users`);
  return res.data;
};

export const deleteUser = async (id_usuario) => {
  try {
    const res = await axios.delete(`${API_URL}/api/registro/users/${id_usuario}`);
    return res.data;
  } catch (err) {
    console.error("❌ Error en deleteUser:", err.response?.data || err.message);
    throw err;
  }
};

export const updateUser = async (id_usuario, data) => {
  const res = await axios.put(`${API_URL}/api/registro/users/${id_usuario}`, data);
  return res.data;
};
// ==========================================================================


// ====== LOGIN ======
export const loginUser = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    return res.data;
  } catch (err) {
    console.error("Error en loginUser:", err.response?.data || err.message);

    if (err.response && err.response.data) {
      return err.response.data;
    }

    return { success: false, message: "Error al conectar con el servidor" };
  }
};

// ====== LOGIN SUPER ADMIN ======
export const loginSuperAdmin = async (correo, contrasena) => {
  try {
    const res = await axios.post(`${API_URL}/api/superadmin/login-superadmin`, {
      correo,
      contrasena,
    });

    return res.data;
  } catch (err) {
    console.error("❌ Error en loginSuperAdmin:", err.response?.data || err);

    if (err.response && err.response.data) {
      return err.response.data;
    }

    return { success: false, message: "Error al conectar con el servidor" };
  }
};




// ===================== ASISTENCIAS =====================
export const marcarAsistencia = async (qr_code, turno) => {
  try {
    const res = await fetch(`${API_URL}/api/auth/asistencia/marcar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qr_code, turno }),
    });

    const data = await res.json();

    // Log para depuración
    console.log("📤 [DEBUG] Respuesta del servidor:", data);

    if (!res.ok) {
      throw new Error(data.message || "Error al registrar asistencia");
    }

    return data;
  } catch (error) {
    console.error("❌ [FRONT ERROR] al llamar API:", error.message);
    throw error;
  }
};

// === Obtener asistencias por usuario ===
export const getAsistenciasByUser = async (id_usuario) => {
  try {
    const res = await axios.get(`${API_URL}/api/auth/asistencia/marcar/asistencia/${id_usuario}`);
    return res.data;
  } catch (error) {
    console.error("❌ Error en getAsistenciasByUser:", error);
    throw error;
  }
};
// Contador de asistencias
// === Obtener conteo de asistencias del día ===
export const getConteoDiario = async (fecha) => {
  try {
    const res = await axios.get(`${API_URL}/api/auth/asistencia/conteo-diario/${fecha}`);
    return res.data;
  } catch (error) {
    console.error("❌ Error en getConteoDiario:", error);
    throw error;
  }
};


// ===================== TURNOS =====================

// Crear un turno
export const createTurno = async (data) => {
  const res = await axios.post(`${API_URL}/api/turnos`, data);
  return res.data;
};

// Listar todos los turnos
export const getTurnos = async () => {
  const { data } = await axios.get(`${API_URL}/api/turnos`);
  return data;
};

// Obtener un turno por ID
export const getTurnoById = async (id_turno) => {
  const { data } = await axios.get(`${API_URL}/api/turnos/${id_turno}`);
  return data;
};

// Actualizar un turno
export const updateTurno = async (id_turno, turnoData) => {
  const res = await axios.put(`${API_URL}/api/turnos/${id_turno}`, turnoData);
  return res.data;
};

// Eliminar un turno
export const deleteTurno = async (id_turno) => {
  const res = await axios.delete(`${API_URL}/api/turnos/${id_turno}`);
  return res.data;
};
// ====== FERIADOS ======
export const getFeriados = async () => {
  const res = await axios.get(`${API_URL}/api/auth/config/feriados`);
  return res.data;
};

export const addFeriado = async (data) => {
  const res = await axios.post(`${API_URL}/api/auth/config/feriados`, data);
  return res.data;
};

export const deleteFeriado = async (id_feriado) => {
  const res = await axios.delete(`${API_URL}/api/auth/config/feriados/${id_feriado}`);
  return res.data;
};

// 
// 
// 
// 
// ==========================================================================
// 
// 
// // CONFIGURACIÓN GLOBAL
// export const getConfig = async () => {
//   const res = await fetch(`${API_URL}/api/auth/global`);
//   return res.json();
// };

// export const updateConfig = async (data) => {
//   const res = await fetch(`${API_URL}/api/auth/globalUpdate`, {
//     method: "PUT",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data),
//   });
//   return res.json();
// };
// 
export const getConfiguracionGlobal = async () => {
    try {
        const res = await fetch(`${API_URL}/api/Cglobal/global`);
        
        // Manejo de errores simplificado (solo verifica la conexión y el parseo)
        if (!res.ok) {
            // Si la respuesta no es 200-299, lanza un error
            const errorData = await res.json();
            throw new Error(errorData.mensaje || `Error al obtener configuración: ${res.status}`);
        }
        
        return res.json();
    } catch (error) {
        console.error("❌ Error en getConfiguracionGlobal:", error);
        throw error;
    }
};

/**
 * Actualiza la configuración global.
 * Endpoint: PUT /api/auth/globalUpdate
 * @param {object} configData - Objeto con los nuevos valores de configuración.
 */
export const updateConfiguracionGlobal = async (configData) => {
    try {
        const res = await fetch(`${API_URL}/api/Cglobal/globalUpdate`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(configData),
        });

        // Manejo de errores
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.mensaje || `Error al actualizar configuración: ${res.status}`);
        }
        
        return res.json();
    } catch (error) {
        console.error("❌ Error en updateConfiguracionGlobal:", error);
        throw error;
    }
};
// ===============================================
// REPORTES GENERALES
export const getReporteConsolidado = async (params) => {
  try {
    const res = await axios.get(`${API_URL}/api/super/reportes/consolidado`, { params });
    return res.data.data; // Devuelve solo la data del cuerpo de la respuesta
  } catch (error) {
    console.error("❌ Error en getReporteConsolidado:", error.response?.data || error.message);
    throw error;
  }
};


// backend/controllers/reportesController.js (dentro de getReporteTrabajador)
// api.js (getReporteTrabajador)

export const getReporteTrabajador = async (params) => {
  try {
    const res = await axios.get(`${API_URL}/api/super/reportes/trabajador`, {
      params,
    });
    return res.data.data;
  } catch (error) {
    // Usamos encadenamiento opcional más robusto para evitar errores de lectura
    const errorMessage =
      error.response?.data || error.message || "Error de red desconocido.";
    console.error("❌ Error en getReporteTrabajador:", errorMessage);
    throw error; // Lanza el error para que ReportesGenerales lo maneje
  }
};

export const getGraficosDesempeno = async (sedeSeleccionada) => {
    try {
        // La URL base es correcta. Eliminamos el parámetro 'sede=todas' de la URL para evitar duplicados.
        const res = await axios.get(`${API_URL}/api/super/reportes/graficos/desempeno`, { 
            // Usamos 'params' para enviar el query parameter 'sede'
            params: { 
                sede: sedeSeleccionada // Este valor será usado en el backend como req.query.sede
            } 
        });
        
        return res.data.data; 
    } catch (error) {
        console.error("❌ Error en getGraficosDesempeno:", error.response?.data || error.message);
        // Devolver datos por defecto para que el gráfico no se rompa
        return { puntualidad: 0, tardanzas: 0, faltas: 0 };
    }
};

// ===============================================

