import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function QRUsuarios() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await fetch(`${API_URL}/api/usuarios`);
        const data = await res.json();
        setUsuarios(data);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      }
    };
    fetchUsuarios();
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Códigos QR de Usuarios</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {usuarios.map((u) => (
          <div
            key={u.id}
            className="bg-white shadow-lg rounded-xl p-4 text-center"
          >
            <h2 className="font-semibold text-lg">{u.nombre}</h2>
            <img
              src={`${API_URL}/api/qr/${u.id}`}
              alt={`QR de ${u.nombre}`}
              className="mx-auto mt-3"
            />
            <p className="text-sm text-gray-600">{u.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
