import axios from "axios";
// api.js

export const API_URL = import.meta.env.VITE_API_URL?.trim() || "http://localhost:4000";

// ====== ROLES ======
// Crear Rol
export const createRol = async (data) => {
  const res = await axios.post(`${API_URL}/api/auth/roles`, data);
  return res.data;
};

// Obtener Roles
export const getRoles = async () => {
  const res = await axios.get(`${API_URL}/api/auth/roles`);
  return res.data;
};

// ====== SEDES ======
// Crear Sede
export const createSede = async (data) => {
  const res = await axios.post(`${API_URL}/api/auth/sedes`, data);
  return res.data;
};

// Obtener Sedes
export const getSedes = async () => {
  const res = await axios.get(`${API_URL}/api/auth/sedes`);
  return res.data;
};

// ====== USUARIOS ======
// Registrar Usuario
export const registerUser = async (data) => {
  const res = await axios.post(`${API_URL}/api/auth/register`, data);
  return res.data;
};

// Obtener Usuarios
export const getUsers = async () => {
  const res = await axios.get(`${API_URL}/api/auth/users`);
  return res.data;
};

// Eliminar Usuario
export const deleteUser = async (id_usuario) => {
  try {
    const res = await axios.delete(`${API_URL}/api/auth/users/${id_usuario}`);
    return res.data;
  } catch (err) {
    console.error("❌ Error en deleteUser:", err.response?.data || err.message);
    throw err;
  }
};


// Actualizar Usuario
export const updateUser = async (id_usuario, data) => {
  const res = await axios.put(`${API_URL}/api/auth/users/${id_usuario}`, data);
  return res.data;
};

// ---------------- LOGIN ----------------
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


// Marcar asistencia con QR y ubicación
export const marcarAsistencia = async (id_usuario, ubicacion) => {
  try {
    const res = await axios.post(`${API_URL}/api/auth/asistencia/marcar`, { id_usuario, ubicacion });
    return res.data;
  } catch (err) {
    console.error("❌ Error en marcarAsistencia:", err.response?.data || err.message);
    throw err;
  }
};


// Obtener asistencias
export const getAsistencias = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/auth/asistencias`);
    return res.data;
  } catch (err) {
    console.error("❌ Error en getAsistencias [Frontend]:", err.response?.data || err.message);
    throw err;
  }
};