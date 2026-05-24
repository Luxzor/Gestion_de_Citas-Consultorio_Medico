import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { citaApi } from '../../api/citaApi';
import { notificacionApi } from '../../api/notificacionApi';
import Spinner from '../common/Spinner';

const ESTADO_BADGE = {
  programada: { cls: 'badge-blue',    label: 'Programada' },
  atendida:   { cls: 'badge-green',   label: 'Atendida'   },
  cancelada:  { cls: 'badge-red',     label: 'Cancelada'  },
};

export default function Dashboard() {
  const { usuario, esMedico } = useAuth();
  const [citas,    setCitas]    = useState([]);
  const [notifs,   setNotifs]   = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0];
    Promise.all([
      citaApi.listar(esMedico ? { idMedico: 1, desde: hoy, hasta: hoy } : {}),
      notificacionApi.listar(),
    ]).then(([citasRes, notifRes]) => {
      setCitas(citasRes.data.slice(0, 5));
      setNotifs(notifRes.data.filter(n => !n.leida).slice(0, 3));
    }).catch(() => {}).finally(() => setCargando(false));
  }, [esMedico]);

  if (cargando) return <Spinner />;

  const fechaHoy = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          {esMedico ? 'Panel del Médico' : 'Mi Panel'}
        </h1>
        <p style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontStyle: 'italic',
          fontSize: 14,
          color: '#4d7a6e',
          marginTop: 2,
        }}>
          {fechaHoy.charAt(0).toUpperCase() + fechaHoy.slice(1)}
        </p>
      </div>

      {/* Stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: esMedico ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
        gap: 16,
        marginBottom: 32,
      }}>
        <StatCard
          value={citas.filter(c => c.estado === 'programada').length || citas.length}
          label={esMedico ? 'Citas hoy' : 'Próximas citas'}
          icon="calendar"
          delay="0.05s"
        />
        {esMedico && (
          <StatCard
            value={citas.filter(c => c.estado === 'atendida').length}
            label="Atendidas hoy"
            icon="check"
            delay="0.10s"
            accent
          />
        )}
        <StatCard
          value={notifs.length}
          label="Notificaciones"
          icon="bell"
          delay="0.15s"
        />
      </div>

      {/* Grid principal */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 20,
      }}>

        {/* Tarjeta de citas */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '18px 22px',
            borderBottom: '1px solid #e3eeeb',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <h3 style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 17, fontWeight: 600, color: '#0f2b24', margin: 0,
            }}>
              {esMedico ? 'Citas de hoy' : 'Mis próximas citas'}
            </h3>
            <span className="badge badge-primary">{citas.length}</span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {citas.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                No hay citas para mostrar.
              </div>
            ) : citas.map((c, i) => (
              <div key={c.idCita} className="list-item" style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 22px',
                borderBottom: i < citas.length - 1 ? '1px solid #e3eeeb' : 'none',
              }}>
                <div style={{
                  width: 44, height: 44, flexShrink: 0,
                  background: '#e8f2ef', borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15423a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: 15, fontWeight: 600, color: '#0f2b24',
                  }}>
                    {c.horaInicio}
                    <span style={{ fontSize: 12, color: '#4d7a6e', marginLeft: 8, fontFamily: "'Outfit', sans-serif", fontWeight: 400 }}>
                      {c.fecha}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#4d7a6e', marginTop: 2 }}>
                    {esMedico ? c.nombrePaciente : c.nombreMedico}
                  </div>
                </div>
                {ESTADO_BADGE[c.estado] && (
                  <span className={`badge ${ESTADO_BADGE[c.estado].cls}`}>
                    {ESTADO_BADGE[c.estado].label}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 22px', borderTop: '1px solid #e3eeeb' }}>
            <Link to="/citas" style={{
              color: '#15423a', fontSize: 13, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              Ver todas las citas
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '18px 22px',
            borderBottom: '1px solid #e3eeeb',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <h3 style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 17, fontWeight: 600, color: '#0f2b24', margin: 0,
            }}>
              Notificaciones pendientes
            </h3>
            {notifs.length > 0 && (
              <span className="badge badge-amber">{notifs.length}</span>
            )}
          </div>
          <div style={{ padding: '8px 0' }}>
            {notifs.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                No hay notificaciones pendientes.
              </div>
            ) : notifs.map((n, i) => (
              <div key={n.idNotificacion} className="list-item" style={{
                padding: '12px 22px',
                borderBottom: i < notifs.length - 1 ? '1px solid #e3eeeb' : 'none',
                borderLeft: '3px solid #c8945a',
              }}>
                <div style={{ fontSize: 13, color: '#0f2b24', lineHeight: 1.5 }}>{n.mensaje}</div>
                <div style={{ fontSize: 11, color: '#4d7a6e', marginTop: 4 }}>{n.fecha}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 22px', borderTop: '1px solid #e3eeeb' }}>
            <Link to="/notificaciones" style={{
              color: '#15423a', fontSize: 13, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              Ver todas
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="card">
          <h3 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 17, fontWeight: 600, color: '#0f2b24', margin: '0 0 18px',
          }}>
            Acciones rápidas
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <QuickAction to="/citas/nueva" icon="plus" label="Nueva cita" primary />
            {esMedico && (
              <>
                <QuickAction to="/pacientes" icon="users" label="Gestión de pacientes" />
                <QuickAction to="/reportes" icon="bar" label="Ver reportes" />
              </>
            )}
            {!esMedico && (
              <QuickAction to="/mi-historial" icon="file" label="Mi historial clínico" />
            )}
            <QuickAction to="/notificaciones" icon="bell" label="Mis notificaciones" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, icon, delay = '0s', accent = false }) {
  return (
    <div className="stat-card" style={{ animationDelay: delay }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div className="stat-value" style={{ color: accent ? '#c8945a' : '#15423a' }}>
            {value}
          </div>
          <div className="stat-label">{label}</div>
        </div>
        <div style={{
          width: 40, height: 40,
          background: accent ? '#fef3e8' : '#e8f2ef',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <StatIcon name={icon} color={accent ? '#c8945a' : '#15423a'} />
        </div>
      </div>
    </div>
  );
}

function StatIcon({ name, color }) {
  const p = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (name === 'calendar') return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
  if (name === 'check')    return <svg {...p}><polyline points="20 6 9 17 4 12"/></svg>;
  return <svg {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}

function QuickAction({ to, icon, label, primary = false }) {
  return (
    <Link to={to} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px',
      borderRadius: 8,
      textDecoration: 'none',
      background: primary ? '#15423a' : '#e8f2ef',
      color: primary ? '#fff' : '#15423a',
      fontWeight: 600,
      fontSize: 14,
      transition: 'all 0.2s ease',
    }}>
      <QAIcon name={icon} color={primary ? '#fff' : '#15423a'} />
      {label}
    </Link>
  );
}

function QAIcon({ name, color }) {
  const p = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (name === 'plus')  return <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
  if (name === 'users') return <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
  if (name === 'bar')   return <svg {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
  if (name === 'file')  return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
  return <svg {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
