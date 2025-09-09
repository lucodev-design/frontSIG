// src/api/api.js
const API_URL = import.meta.env.VITE_APP_URL || "http://localhost:4000";

// Helper para manejar respuestas y errores
async function handleResponse(res) {
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Respuesta no válida del servidor");
  }

  if (!res.ok) {
    throw new Error(data.message || "Error en la petición");
  }
  return data;
}

// ------------------ AUTH ------------------

// Login
export async function loginUser(credentials) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return handleResponse(res);
}

// Registro de usuario
export async function registerUser(userData) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return handleResponse(res);
}

// Obtener todos los usuarios
export async function getUsers() {
  const res = await fetch(`${API_URL}/api/auth/users`);
  return handleResponse(res);
}

// Verificar token
export async function verifyToken(token) {
  const res = await fetch(`${API_URL}/api/auth/verify`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}

// ------------------ ASISTENCIA ------------------

// Marcar asistencia con QR
export async function marcarAsistencia(qrCode) {
  const res = await fetch(`${API_URL}/api/asistencia/marcar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codigo_qr: qrCode }),
  });
  return handleResponse(res);
}

// ------------------ EJEMPLO EXTRA ------------------
// Llamada a test-db para verificar conexión
export async function testDb() {
  const res = await fetch(`${API_URL}/api/test-db`);
  return handleResponse(res);
}
