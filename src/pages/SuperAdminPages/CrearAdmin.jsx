import React, { useState, useEffect } from "react";
import { getSedes, createAdmin } from "../../api/api";

export default function CrearAdmin() {
  const [sedes, setSedes] = useState([]);

  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    correo: "", // Para el input
    contrasena: "",
    sede_id: "",
    rol: "admin", // ROL POR DEFECTO
  });

  useEffect(() => {
    cargarSedes();
  }, []);

  const cargarSedes = async () => {
    try {
      const data = await getSedes();
      setSedes(data);
    } catch (error) {
      console.error("Error al cargar sedes:", error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre || !form.correo || !form.contrasena || !form.sede_id) {
      alert("Todos los campos obligatorios deben estar completos.");
      return;
    }

    try {
      // Mapear 'correo' → 'email' y 'contrasena' → 'password'
      const payload = {
        nombre: form.nombre,
        apellidos: form.apellidos,
        email: form.correo,
        password: form.contrasena,
        sede_id: form.sede_id,
        rol: form.rol,
      };

      const res = await createAdmin(payload);

      if (res.success) {
        alert("Administrador creado correctamente");
        setForm({
          nombre: "",
          apellidos: "",
          correo: "",
          contrasena: "",
          sede_id: "",
          rol: "admin", // Reiniciar con admin por defecto
        });
      }
    } catch (error) {
      console.error("Error al crear administrador:", error);
      alert("Error al crear administrador.");
    }
  };

  return (
    <div className="card p-3 w-50 mx-auto">
      <h3>Formulario de creación de nuevos Administradores</h3>

      <form className="mt-3" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Nombre *</label>
          <input
            type="text"
            className="form-control"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Apellidos *</label>
          <input
            type="text"
            className="form-control"
            name="apellidos"
            value={form.apellidos}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Correo *</label>
          <input
            type="email"
            className="form-control"
            name="correo"
            value={form.correo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Contraseña *</label>
          <input
            type="password"
            className="form-control"
            name="contrasena"
            value={form.contrasena}
            onChange={handleChange}
            required
          />
        </div>

        {/* SELECT DE ROL */}
        <div className="mb-3">
          <label>Rol *</label>
          <select
            className="form-control"
            name="rol"
            value={form.rol}
            onChange={handleChange}
            required
          >
            <option value="admin">Administrador</option>
            <option value="superadmin">Super Administrador</option>
          </select>
        </div>

        {/* SELECT DE SEDE */}
        <div className="mb-3">
          <label>Sede *</label>
          <select
            name="sede_id"
            className="form-control"
            value={form.sede_id}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una sede</option>
            {sedes.map((s) => (
              <option key={s.id_sede} value={s.id_sede}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary">Crear Administrador</button>
      </form>
    </div>
  );
}
