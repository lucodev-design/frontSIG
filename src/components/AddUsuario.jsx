import React, { useState, useEffect } from "react";
import { registerUser, getUsers } from "../api/api";

function AddUsuarios() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "trabajador",
  });

  const [mensaje, setMensaje] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [qrCode, setQrCode] = useState(""); // QR generado tras registro
  const [qrModal, setQrModal] = useState(""); // QR para ver en la tabla

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setQrCode("");

    try {
      const res = await registerUser(formData);

      setMensaje("✅ Usuario registrado correctamente");
      if (res.qrImage) setQrCode(res.qrImage);

      setFormData({
        nombre: "",
        email: "",
        password: "",
        rol: "trabajador",
      });

      fetchUsers(); // recargar lista
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      setMensaje(`❌ ${error.message}`);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al listar usuarios:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Registrar Usuario</h2>

      {mensaje && (
        <p className={`mb-4 text-sm ${mensaje.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
          {mensaje}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          value={formData.nombre}
          onChange={handleChange}
          required
          className="p-2 border rounded"
        />

        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
          className="p-2 border rounded"
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
          className="p-2 border rounded"
        />

        <select name="rol" value={formData.rol} onChange={handleChange} className="p-2 border rounded">
          <option value="trabajador">Trabajador</option>
          <option value="admin">Administrador</option>
        </select>

        <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Registrar
        </button>
      </form>

      {/* Mostrar QR generado al registrar */}
      {qrCode && (
        <div className="mt-6 text-center">
          <h3 className="font-bold">Código QR del Usuario</h3>
          <img src={qrCode} alt="QR Code" className="mx-auto my-4" />
          <a href={qrCode} download="usuario_qr.png" className="bg-green-600 text-white px-4 py-2 rounded">
            Descargar QR
          </a>
        </div>
      )}

      {/* Modal para ver QR desde la lista */}
      {qrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-red-500 font-bold text-lg"
              onClick={() => setQrModal("")}
            >
              X
            </button>
            <h3 className="text-center font-bold mb-4">Código QR</h3>
            <img src={qrModal} alt="QR Code" className="mx-auto" />
          </div>
        </div>
      )}

      {/* Tabla de usuarios */}
      <h3 className="text-lg font-bold mt-8 mb-4">Lista de Usuarios</h3>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Rol</th>
            <th className="p-2 border">Acción</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td className="p-2 border">{u.id}</td>
              <td className="p-2 border">{u.nombre}</td>
              <td className="p-2 border">{u.email}</td>
              <td className="p-2 border">{u.rol}</td>
              <td className="p-2 border text-center">
                <button
                  onClick={() => setQrModal(u.codigo_qr)}
                  className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  Ver QR
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AddUsuarios;
