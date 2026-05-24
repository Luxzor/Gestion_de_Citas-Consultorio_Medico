import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { citaApi } from '../../api/citaApi';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';
import AlertMsg from '../common/AlertMsg';

const ESTADOS = ['todas', 'programada', 'atendida', 'cancelada'];

const ESTADO_CFG = {
  programada: { cls: 'badge-blue',  label: 'Programada', border: '#3b82f6' },
  atendida:   { cls: 'badge-green', label: 'Atendida',   border: '#16a34a' },
  cancelada:  { cls: 'badge-red',   label: 'Cancelada',  border: '#be123c' },
};

export default function ListaCitas() {
  const { esMedico } = useAuth();
  const [citas,    setCitas]    = useState([]);
  const [filtro,   setFiltro]   = useState('todas');
  const [cargando, setCargando] = useState(true);
  const [mensaje,  setMensaje]  = useState({ tipo: '', texto: '' });

  useEffect(() => {
    citaApi.listar()
      .then(({ data }) => setCitas(data))
      .catch(() => setMensaje({ tipo: 'error', texto: 'Error al cargar las citas.' }))
      .finally(() => setCargando(false));
  }, []);

  const cancelar = async (id) => {
    if (!window.confirm('¿Desea cancelar esta cita?')) return;
    try {
      await citaApi.cancelar(id);
      setCitas(cs => cs.map(c => c.idCita === id ? { ...c, estado: 'cancelada' } : c));
      setMensaje({ tipo: 'exito', texto: 'Cita cancelada correctamente.' });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.mensaje || 'Error al cancelar la cita.' });
    }
  };

  const filtradas = filtro === 'todas' ? citas : citas.filter(c => c.estado === filtro);

  if (cargando) return <Spinner />;

  return (
    <div style={{ padding: '32px 28px', maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Citas Médicas</h1>
          <p className="page-subtitle">{citas.length} cita{citas.length !== 1 ? 's' : ''} en total</p>
        </div>
        <Link to="/citas/nueva" className="btn btn-primary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nueva cita
        </Link>
      </div>

      <AlertMsg tipo={mensaje.tipo} mensaje={mensaje.texto} />

      {/* Filtros */}
      <div className="filter-pills">
        {ESTADOS.map(e => (
          <button
            key={e}
            className={`pill-btn ${filtro === e ? 'active' : ''}`}
            onClick={() => setFiltro(e)}
          >
            {e.charAt(0).toUpperCase() + e.slice(1)}
            {e !== 'todas' && (
              <span style={{ marginLeft: 6, opacity: 0.7 }}>
                ({citas.filter(c => c.estado === e).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtradas.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              No hay citas para mostrar.
            </div>
          </div>
        ) : filtradas.map((c, i) => {
          const cfg = ESTADO_CFG[c.estado] || {};
          return (
            <div
              key={c.idCita}
              className="list-item"
              style={{
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e3eeeb',
                borderLeft: `4px solid ${cfg.border || '#cce0d9'}`,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                boxShadow: '0 1px 4px rgba(15,43,36,0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Ícono de fecha */}
                <div style={{
                  width: 48, height: 48, flexShrink: 0,
                  background: '#e8f2ef', borderRadius: 10,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: '#15423a', lineHeight: 1 }}>
                    {c.fecha?.split('-')[2]}
                  </span>
                  <span style={{ fontSize: 10, color: '#4d7a6e', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {new Date(c.fecha + 'T00:00').toLocaleDateString('es-MX', { month: 'short' })}
                  </span>
                </div>

                <div>
                  <div style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: 16, fontWeight: 600, color: '#0f2b24', marginBottom: 3,
                  }}>
                    {c.horaInicio} – {c.horaFin}
                    <span style={{ fontSize: 13, color: '#4d7a6e', fontFamily: "'Outfit', sans-serif", fontWeight: 400, marginLeft: 8 }}>
                      {c.fecha}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#4d7a6e' }}>
                    {esMedico ? `Paciente: ${c.nombrePaciente}` : `Médico: ${c.nombreMedico}`}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {cfg.cls && (
                  <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                )}
                {c.estado === 'programada' && (
                  <>
                    {esMedico && (
                      <Link
                        to={`/consultas/nueva/${c.idCita}`}
                        className="btn btn-secondary btn-sm"
                      >
                        Registrar consulta
                      </Link>
                    )}
                    <button
                      onClick={() => cancelar(c.idCita)}
                      className="btn btn-sm"
                      style={{ background: '#fff1f2', color: '#be123c', border: '1px solid #fda4af' }}
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
