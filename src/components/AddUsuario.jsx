import React, { useState, useEffect, useRef } from "react";
import { registerUser, getUsers, deleteUser } from "../api/api";
import "../templates/styles/addUser.css";

function AddUsuarios() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "trabajador",
  });

  const [mensaje, setMensaje] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [qrCode, setQrCode] = useState("");
  const [qrUser, setQrUser] = useState(""); // ✅ nombre del usuario del QR

  const qrRef = useRef(null); // ✅ referencia al bloque del QR

  // 🔎 búsqueda
  const [search, setSearch] = useState("");

  // 📄 paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(
    window.innerWidth <= 768 ? 5 : 10
  );

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth <= 768 ? 5 : 10);
      setCurrentPage(1);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setQrCode("");
    setQrUser("");

    try {
      const res = await registerUser(formData);
      setMensaje("✅ Usuario registrado correctamente");
      if (res.qrImage) {
        setQrCode(res.qrImage);
        setQrUser(formData.nombre);
      }
      setFormData({ nombre: "", email: "", password: "", rol: "trabajador" });
      fetchUsers();
    } catch (error) {
      setMensaje(`❌ ${error.message}`);
      console.error(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsuarios(data);
    } catch (error) {
      console.error("❌ Error al listar usuarios:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;

    try {
      const data = await deleteUser(id);
      alert(data.message);
      fetchUsers();
    } catch (error) {
      alert(`❌ ${error.message}`);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔎 Filtrar usuarios
  const filteredUsers = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  // 📄 Paginación
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);

  // ✅ manejar click en "Ver QR"
  const handleViewQr = (image, nombre) => {
    setQrCode(image);
    setQrUser(nombre);

    // hacer scroll hacia la sección del QR
    setTimeout(() => {
      qrRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  return (
    <div
      className="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow-lg"
      id="container-content"
    >
      <h2 id="title" className="text-xl font-bold mb-4">
        Registrar Usuario
      </h2>

      {mensaje && (
        <p
          className={`mb-4 text-sm ${
            mensaje.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {mensaje}
        </p>
      )}

      {/* formulario registro */}
      <form onSubmit={handleSubmit} className="form-container">
        <h2 className="form-title">Registro de Usuario</h2>

        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          value={formData.nombre}
          onChange={handleChange}
          required
          className="form-input"
        />

        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
          className="form-input"
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
          className="form-input"
        />

        <select
          name="rol"
          value={formData.rol}
          onChange={handleChange}
          className="form-select"
        >
          <option value="trabajador">Trabajador</option>
          <option value="admin">Administrador</option>
        </select>

        <button type="submit" className="form-button">
          Registrar
        </button>
      </form>

      {/* QR generado */}
      {qrCode && (
        <div ref={qrRef} className="mt-6 text-center">
          <h3 className="font-bold">Código QR del Usuario</h3>
          {qrUser && <p className="mb-2 text-gray-700">👤 {qrUser}</p>}
          <img src={qrCode} alt="QR Code" className="mx-auto my-4" />
          <a
            href={qrCode}
            download={`qr_${qrUser || "usuario"}.png`}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Descargar QR
          </a>
        </div>
      )}

      <h3 className="text-lg font-bold mt-8 mb-4">Lista de Usuarios</h3>

      {/* 🔎 Buscador */}
      <input
        type="text"
        placeholder="Buscar usuario..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />

      {/* tabla usuarios */}
      <div className="table-contain">
        <table className="table-containn w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Rol</th>
              <th className="p-2 border">QR</th>
              <th className="p-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((u) => (
                <tr key={u.id}>
                  <td className="p-2 border">{u.id}</td>
                  <td className="p-2 border">{u.nombre}</td>
                  <td className="p-2 border">{u.email}</td>
                  <td className="p-2 border">{u.rol}</td>
                  <td className="p-2 border text-center">
                    <button
                      onClick={() => handleViewQr(u.qrImage, u.nombre)}
                      className="btn-op bg-gray-600 text-white px-2 py-1 rounded text-sm"
                    >
                      Ver QR
                    </button>
                  </td>
                  <td className="p-2 border text-center">
                    {u.rol !== "admin" && (
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="btn-op bg-red-600 text-white px-2 py-1 rounded text-sm"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-4 text-center">
                  No se encontraron usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 📄 paginación */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages || 1}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) =>
              prev < totalPages ? prev + 1 : prev
            )
          }
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>

      {/* botón volver */}
      <button
        onClick={() => (window.location.href = "/dashboardAdmin")}
        className="btn btn-primary mt-6"
        id="btn-after"
      >
        Volver
      </button>
    </div>
  );
}

export default AddUsuarios;
