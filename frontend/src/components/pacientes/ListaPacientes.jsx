import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pacienteApi } from '../../api/pacienteApi';
import Spinner from '../common/Spinner';
import AlertMsg from '../common/AlertMsg';

function initiales(nombre = '') {
  return nombre.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export default function ListaPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [filtro,    setFiltro]    = useState('');
  const [cargando,  setCargando]  = useState(true);
  const [mensaje,   setMensaje]   = useState({ tipo: '', texto: '' });

  useEffect(() => {
    pacienteApi.listar()
      .then(({ data }) => setPacientes(data))
      .catch(() => setMensaje({ tipo: 'error', texto: 'Error al cargar pacientes.' }))
      .finally(() => setCargando(false));
  }, []);

  const eliminar = async (id, nombre) => {
    if (!window.confirm(`¿Desea eliminar al paciente ${nombre}?`)) return;
    try {
      await pacienteApi.eliminar(id);
      setPacientes(p => p.filter(x => x.idPaciente !== id));
      setMensaje({ tipo: 'exito', texto: 'Paciente eliminado correctamente.' });
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al eliminar el paciente.' });
    }
  };

  const filtrados = pacientes.filter(p =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    p.correo.toLowerCase().includes(filtro.toLowerCase())
  );

  if (cargando) return <Spinner />;

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1000, margin: '0 auto' }}>

      {/* Header */}
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Pacientes</h1>
          <p className="page-subtitle">{pacientes.length} paciente{pacientes.length !== 1 ? 's' : ''} registrado{pacientes.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Búsqueda */}
        <div style={{ position: 'relative' }}>
          <svg
            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4d7a6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          >
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="input-field"
            style={{ paddingLeft: 36, width: 260 }}
            placeholder="Buscar por nombre o correo..."
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
          />
        </div>
      </div>

      <AlertMsg tipo={mensaje.tipo} mensaje={mensaje.texto} />

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtrados.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              No se encontraron pacientes.
            </div>
          </div>
        ) : filtrados.map((p, i) => (
          <div
            key={p.idPaciente}
            className="list-item"
            style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #e3eeeb',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              boxShadow: '0 1px 3px rgba(15,43,36,0.06)',
            }}
          >
            {/* Avatar */}
            <div className="avatar avatar-md">
              {initiales(p.nombre)}
            </div>

            {/* Datos */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: 15, fontWeight: 600, color: '#0f2b24',
              }}>
                {p.nombre}
              </div>
              <div style={{ fontSize: 13, color: '#4d7a6e', marginTop: 2, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span>{p.correo}</span>
                <span>{p.telefono}</span>
                <span>{p.edad} años · {p.sexo === 'M' ? 'Masculino' : p.sexo === 'F' ? 'Femenino' : p.sexo}</span>
              </div>
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <Link
                to={`/pacientes/${p.idPaciente}`}
                className="btn btn-secondary btn-sm"
                title="Ver perfil"
              >
                Ver
              </Link>
              <Link
                to={`/pacientes/${p.idPaciente}/editar`}
                className="btn btn-ghost btn-sm"
                title="Editar"
              >
                Editar
              </Link>
              <button
                onClick={() => eliminar(p.idPaciente, p.nombre)}
                className="btn btn-sm"
                title="Eliminar"
                style={{ background: '#fff1f2', color: '#be123c', border: '1px solid #fda4af' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
