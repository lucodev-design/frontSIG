import React, { useState, useEffect, useRef } from "react";
// import { registerUser, getUsers, deleteUser, getSedes } from "../api/api";
import "../templates/styles/addUser.css";

function AddUsuarios() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    dni: "",
    email: "",
    password: "",
    sede: "",
    rol: "trabajador",
  });

  const [mensaje, setMensaje] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [qrCode, setQrCode] = useState("");
  const [qrUser, setQrUser] = useState("");
  const qrRef = useRef(null);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(window.innerWidth <= 768 ? 5 : 10);

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
      setMensaje(res.message);

      if (res.qrImage) {
        setQrCode(res.qrImage);
        setQrUser(`${formData.nombre} ${formData.apellidos}`);
      }

      setFormData({
        nombre: "",
        apellidos: "",
        dni: "",
        email: "",
        password: "",
        sede: "",
        rol: "trabajador",
      });

      fetchUsers();
    } catch (error) {
      setMensaje(`❌ ${error.message}`);
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

  const fetchSedes = async () => {
    try {
      const data = await getSedes();
      setSedes(data);
    } catch (error) {
      console.error("❌ Error al obtener sedes:", error);
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
    fetchSedes();
  }, []);

  const filteredUsers = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.apellidos?.toLowerCase().includes(search.toLowerCase()) ||
      u.dni?.includes(search) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.sede?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);

  const handleViewQr = (qrCodeUrl, nombreCompleto) => {
    setQrCode(qrCodeUrl);
    setQrUser(nombreCompleto);
    setTimeout(() => {
      qrRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow-lg" id="container-content">
      <h2 className="text-xl font-bold mb-4">Registrar Usuario</h2>

      {mensaje && (
        <p className={`mb-4 text-sm ${mensaje.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
          {mensaje}
        </p>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="form-container">
        <h2 className="form-title">Registro de Usuario</h2>
        <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required className="form-input" />
        <input type="text" name="apellidos" placeholder="Apellidos" value={formData.apellidos} onChange={handleChange} required className="form-input" />
        <input type="text" name="dni" placeholder="DNI" value={formData.dni} onChange={handleChange} required className="form-input" />
        <input type="email" name="email" placeholder="Correo" value={formData.email} onChange={handleChange} required className="form-input" />
        <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} required className="form-input" />

        {/* Select de sedes dinámico */}
        <select name="sede" value={formData.sede} onChange={handleChange} required className="form-select">
          <option value="">Seleccione una sede</option>
          {sedes.length > 0 ? (
            sedes.map((s) => (
              <option key={s.id} value={s.nombre}>
                {s.nombre}
              </option>
            ))
          ) : (
            <option value="">Cargando sedes...</option>
          )}
        </select>

        {/* Select de rol */}
        <select name="rol" value={formData.rol} onChange={handleChange} className="form-select">
          <option value="trabajador">Trabajador</option>
          <option value="admin">Administrador</option>
        </select>

        <button type="submit" className="form-button">Registrar</button>
      </form>

      {/* QR generado */}
      {qrCode && (
        <div ref={qrRef} className="mt-6 text-center">
          <h3 className="font-bold">Código QR del Usuario</h3>
          {qrUser && <p className="mb-2 text-gray-700">👤 {qrUser}</p>}
          <img src={qrCode} alt="QR Code" className="mx-auto my-4" />
          <a href={qrCode} download={`qr_${qrUser || "usuario"}.png`} className="bg-green-600 text-white px-4 py-2 rounded">
            Descargar QR
          </a>
        </div>
      )}

      {/* Lista usuarios */}
      <h3 className="text-lg font-bold mt-8 mb-4">Lista de Usuarios</h3>
      <input type="text" placeholder="Buscar usuario..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full p-2 mb-4 border rounded" />

      <div className="table-contain">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Nombres</th>
              <th className="p-2 border">Apellidos</th>
              <th className="p-2 border">DNI</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Sede</th>
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
                  <td className="p-2 border">{u.apellidos}</td>
                  <td className="p-2 border">{u.dni}</td>
                  <td className="p-2 border">{u.email}</td>
                  <td className="p-2 border">{u.sede}</td>
                  <td className="p-2 border">{u.rol}</td>
                  <td className="p-2 border text-center">
                    {u.qrImage ? (
                      <button onClick={() => handleViewQr(u.qrImage, `${u.nombre} ${u.apellidos}`)} className="bg-gray-600 text-white px-2 py-1 rounded text-sm">
                        Ver QR
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">Sin QR</span>
                    )}
                  </td>
                  <td className="p-2 border text-center">
                    <button onClick={() => handleDelete(u.id)} className="bg-red-600 text-white px-2 py-1 rounded text-sm">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="p-4 text-center">
                  No se encontraron usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-between items-center mt-4">
        <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50">
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages || 1}</span>
        <button onClick={() => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50">
          Siguiente
        </button>
      </div>
    </div>
  );
}

export default AddUsuarios;
