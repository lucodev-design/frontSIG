// CantidadUsuarios.jsx
import React, { useState, useEffect } from 'react';
import { getUsers, getSedes } from '../../api/api';

const CantidadUsuarios = () => {
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [usuarios, setUsuarios] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState('todas');
  const [loading, setLoading] = useState(true);

  // Cargar usuarios y sedes al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtrar usuarios cuando cambie la sede seleccionada
  useEffect(() => {
    filtrarUsuarios();
  }, [sedeSeleccionada, usuarios]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar usuarios y sedes en paralelo
      const [usuariosData, sedesData] = await Promise.all([
        getUsers(),
        getSedes()
      ]);

      setUsuarios(usuariosData || []);
      setSedes(sedesData || []);
      setTotalUsuarios((usuariosData || []).length);
      
      console.log(`✅ Cargados ${(usuariosData || []).length} trabajadores`);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      setLoading(false);
    }
  };

  const filtrarUsuarios = () => {
    if (sedeSeleccionada === 'todas') {
      setTotalUsuarios(usuarios.length);
    } else {
      // Filtrar por sede_id
      const usuariosFiltrados = usuarios.filter(usuario => 
        String(usuario.sede_id) === String(sedeSeleccionada)
      );
      setTotalUsuarios(usuariosFiltrados.length);
    }
  };

  const handleSedeClick = (sedeId) => {
    setSedeSeleccionada(sedeId);
  };

  if (loading) {
    return (
      <div className="card shadow-sm border-0 text-center">
        <div className="card-body">
          <h6 className="text-muted mb-2">Total de Trabajadores</h6>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0 text-center">
      <div className="card-body">
        <h6 className="text-muted mb-2">Total de Trabajadores</h6>
        <h2 className="text-primary mb-3" style={{ fontSize: '3rem', fontWeight: 'bold' }}>
          {totalUsuarios}
        </h2>
        
        {/* Botones de filtro por sede */}
        <div className="d-flex flex-wrap gap-2 justify-content-center">
          <button
            className={`btn btn-sm ${sedeSeleccionada === 'todas' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleSedeClick('todas')}
          >
            📊 Todas las Sedes
          </button>
          
          {sedes.map((sede) => (
            <button
              key={sede.id_sede}
              className={`btn btn-sm ${
                String(sedeSeleccionada) === String(sede.id_sede) 
                  ? 'btn-primary' 
                  : 'btn-outline-primary'
              }`}
              onClick={() => handleSedeClick(sede.id_sede)}
              title={sede.nombre}
            >
              {sede.nombre}
            </button>
          ))}
        </div>

        {sedeSeleccionada !== 'todas' && (
          <small className="text-muted d-block mt-2">
            Mostrando: {sedes.find(s => String(s.id_sede) === String(sedeSeleccionada))?.nombre || 'Sede'}
          </small>
        )}

        <button 
          className="btn btn-sm btn-outline-primary mt-2"
          onClick={cargarDatos}
          title="Actualizar contador"
        >
          🔄 Actualizar
        </button>
      </div>
    </div>
  );
};

export default CantidadUsuarios;