// src/api/api.js

// URL del backend
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Registrar usuario
export async function registerUser(userData) {
  try {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Error al registrar usuario");
    }

    return res.json();
  } catch (error) {
    console.error("❌ Error en registerUser:", error);
    throw error;
  }
}

// Listar usuarios
export async function getUsers() {
  try {
    const res = await fetch(`${API_URL}/api/auth/users`);
    if (!res.ok) throw new Error("Error al obtener usuarios");
    return res.json();
  } catch (error) {
    console.error("❌ Error en getUsers:", error);
    throw error;
  }
}

// Login
export async function loginUser(credentials) {
  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Error al iniciar sesión");
    }

    return res.json();
  } catch (error) {
    console.error("❌ Error en loginUser:", error);
    throw error;
  }
}
