import { useEffect, useState } from "react";

export default function QRUsuarios() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      const res = await fetch("http://localhost:4000/api/usuarios");
      const data = await res.json();
      setUsuarios(data);
    };
    fetchUsuarios();
  }, []);

  const generarQR = async (id) => {
    const res = await fetch(`http://localhost:4000/api/qr/${id}`);
    const data = await res.json();
    return data.qr;
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Códigos QR de Usuarios</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {usuarios.map((u) => (
          <div key={u.id} className="bg-white shadow-lg rounded-xl p-4 text-center">
            <h2 className="font-semibold text-lg">{u.nombre}</h2>
            <img
              src={`http://localhost:4000/api/qr/${u.id}`}
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
