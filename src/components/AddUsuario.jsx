import pool from "../db/db.js";   // conexión a PostgreSQL
import bcrypt from "bcryptjs";

// Controlador para registrar un nuevo usuario
export const addUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Validar datos
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    // Verificar si ya existe el email
    const existe = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // Encriptar contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insertar en la tabla usuarios
    const nuevoUsuario = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol) 
       VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol, created_at`,
      [nombre, email, hashedPassword, rol]
    );

    // Respuesta
    res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      usuario: nuevoUsuario.rows[0]
    });

  } catch (error) {
    console.error("Error en addUsuario:", error.message);
    res.status(500).json({ error: "Error del servidor" });
  }
};
