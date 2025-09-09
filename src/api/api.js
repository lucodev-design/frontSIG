// src/api/api.js
const API_URL = import.meta.env.VITE_APP_URL || "http://localhost:4000";

// Helper para manejar errores de respuesta
async function handleResponse(res) {
  const data = await res.json();
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
// Listar datos
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

// ------------------ EJEMPLO EXTRA ------------------
// Llamada a test-db para verificar conexión
export async function testDb() {
  const res = await fetch(`${API_URL}/api/test-db`);
  return handleResponse(res);
}
