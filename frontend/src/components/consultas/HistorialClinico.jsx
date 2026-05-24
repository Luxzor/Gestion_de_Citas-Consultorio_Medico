import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reporteApi } from '../../api/reporteApi';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';
import AlertMsg from '../common/AlertMsg';

function initiales(nombre = '') {
  return nombre.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export default function HistorialClinico() {
  const { idPaciente } = useParams();
  const { usuario, esMedico } = useAuth();
  const navigate = useNavigate();
  const [historial, setHistorial] = useState(null);
  const [cargando,  setCargando]  = useState(true);
  const [error,     setError]     = useState('');
  const [abiertos,  setAbiertos]  = useState({});

  useEffect(() => {
    const url = esMedico ? idPaciente : usuario.idPaciente;
    reporteApi.historial(url)
      .then(({ data }) => setHistorial(data))
      .catch(() => setError('No se pudo cargar el historial clínico.'))
      .finally(() => setCargando(false));
  }, [idPaciente, esMedico, usuario]);

  if (cargando) return <Spinner />;
  if (error)    return <div style={{ padding: 32 }}><AlertMsg tipo="error" mensaje={error} /></div>;
  if (!historial) return null;

  const { paciente, consultas } = historial;

  const toggleAbierto = (id) => setAbiertos(a => ({ ...a, [id]: !a[id] }));

  return (
    <div style={{ padding: '32px 28px', maxWidth: 760, margin: '0 auto' }}>

      {/* Botón volver */}
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        Volver
      </button>

      {/* Header del paciente */}
      <div style={{
        background: 'linear-gradient(135deg, #15423a 0%, #1d5e52 100%)',
        borderRadius: 14,
        padding: '24px 28px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
      }}>
        <div className="avatar avatar-lg" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 22 }}>
          {initiales(paciente.nombre)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h1 style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: 22, fontWeight: 700, color: '#fff', margin: 0, marginBottom: 6,
              }}>
                {paciente.nombre}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{paciente.correo}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{paciente.telefono}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                {paciente.edad} años
              </span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                {paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Femenino' : paciente.sexo}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Título consultas */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, color: '#0f2b24', margin: 0 }}>
          Historial de Consultas
        </h2>
        <span className="badge badge-primary">{consultas.length}</span>
      </div>

      {consultas.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            No hay consultas registradas.
          </div>
        </div>
      ) : (
        <div className="timeline">
          {consultas.map((c, i) => (
            <div key={c.idConsulta} className="timeline-item list-item">
              <div className="timeline-dot" />

              {/* Card de consulta */}
              <div
                className="card"
                style={{ cursor: 'pointer', padding: 0, overflow: 'hidden' }}
                onClick={() => toggleAbierto(c.idConsulta)}
              >
                {/* Header clickeable */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 20px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 40, height: 40, background: '#e8f2ef', borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15423a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 600, color: '#0f2b24' }}>
                        Consulta del {c.fechaConsulta}
                      </div>
                      <div style={{ fontSize: 12, color: '#4d7a6e', marginTop: 2 }}>
                        T: {c.temperatura}°C · Peso: {c.peso}kg · Altura: {c.altura}cm · PA: {c.presion}
                      </div>
                    </div>
                  </div>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4d7a6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: abiertos[c.idConsulta] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', flexShrink: 0 }}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>

                {/* Contenido expandible */}
                {abiertos[c.idConsulta] && (
                  <div style={{
                    borderTop: '1px solid #e3eeeb',
                    padding: '20px',
                    display: 'flex', flexDirection: 'column', gap: 16,
                    animation: 'fadeIn 0.2s ease',
                  }}>
                    {/* Signos vitales */}
                    <div style={{
                      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
                      background: '#e8f2ef', borderRadius: 10, padding: '14px 16px',
                    }}>
                      {[
                        ['Temperatura', c.temperatura, '°C'],
                        ['Peso',        c.peso,        'kg'],
                        ['Altura',      c.altura,      'cm'],
                        ['Presión',     c.presion,     ''],
                      ].map(([label, val, unit]) => (
                        <div key={label}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#4d7a6e', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                            {label}
                          </div>
                          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: '#15423a', lineHeight: 1 }}>
                            {val}<span style={{ fontSize: 12, fontWeight: 400, color: '#4d7a6e' }}>{unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Textos clínicos */}
                    {[
                      ['Relatoría de la consulta', c.relatoria],
                      ['Diagnóstico',              c.diagnostico],
                      ['Prescripción médica',      c.prescripcion],
                      c.resultados ? ['Resultados de análisis', c.resultados] : null,
                    ].filter(Boolean).map(([label, val]) => (
                      <div key={label}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#4d7a6e', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                          {label}
                        </div>
                        <div style={{
                          fontSize: 14, lineHeight: 1.7, color: '#0f2b24',
                          background: '#f5faf7', borderRadius: 8, padding: '12px 14px',
                          whiteSpace: 'pre-wrap',
                        }}>
                          {val}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
