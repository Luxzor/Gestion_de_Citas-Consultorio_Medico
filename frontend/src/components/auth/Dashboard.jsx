/**
 * Panel principal segun el rol del usuario.
 * El medico ve un resumen de la agenda del dia.
 * El paciente ve sus proximas citas y notificaciones pendientes.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { citaApi } from '../../api/citaApi';
import { notificacionApi } from '../../api/notificacionApi';
import Spinner from '../common/Spinner';
import { css, colors } from '../../utils/styles';

export default function Dashboard() {
  const { usuario, esMedico } = useAuth();
  const [citas,  setCitas]   = useState([]);
  const [notifs, setNotifs]  = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0];
    Promise.all([
      citaApi.listar(esMedico
        ? { idMedico: 1, desde: hoy, hasta: hoy }
        : {}),
      notificacionApi.listar(),
    ]).then(([citasRes, notifRes]) => {
      setCitas(citasRes.data.slice(0, 5));
      setNotifs(notifRes.data.filter(n => !n.leida).slice(0, 3));
    }).catch(() => {}).finally(() => setCargando(false));
  }, [esMedico]);

  if (cargando) return <Spinner />;

  const badge = (n) => (
    <span style={{ background: colors.primary, color:'#fff', borderRadius:999, fontSize:12, padding:'2px 8px' }}>{n}</span>
  );

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 4, color: colors.text }}>
        {esMedico ? 'Panel del Medico' : 'Panel del Paciente'}
      </h2>
      <p style={{ color: colors.textLight, marginBottom: 24 }}>
        Bienvenido. {new Date().toLocaleDateString('es-MX', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 20 }}>
        {/* Tarjeta de citas */}
        <div style={css.card}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>
            {esMedico ? 'Citas de hoy' : 'Mis proximas citas'} {badge(citas.length)}
          </h3>
          {citas.length === 0 ? (
            <p style={{ color: colors.textLight, fontSize: 14 }}>No hay citas para mostrar.</p>
          ) : citas.map(c => (
            <div key={c.idCita} style={{ borderBottom: `1px solid ${colors.border}`, paddingBottom: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{c.fecha} {c.horaInicio}</div>
              <div style={{ fontSize: 13, color: colors.textLight }}>
                {esMedico ? `Paciente: ${c.nombrePaciente}` : `Medico: ${c.nombreMedico}`}
              </div>
              <span style={{
                fontSize: 12, padding: '2px 8px', borderRadius: 4, marginTop: 4, display: 'inline-block',
                background: c.estado === 'programada' ? '#eff6ff' : c.estado === 'atendida' ? '#f0fdf4' : '#fef2f2',
                color:      c.estado === 'programada' ? '#1d4ed8' : c.estado === 'atendida' ? '#15803d' : '#dc2626',
              }}>{c.estado}</span>
            </div>
          ))}
          <Link to="/citas" style={{ color: colors.primary, fontSize: 14 }}>Ver todas las citas</Link>
        </div>

        {/* Tarjeta de notificaciones */}
        <div style={css.card}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>
            Notificaciones pendientes {badge(notifs.length)}
          </h3>
          {notifs.length === 0 ? (
            <p style={{ color: colors.textLight, fontSize: 14 }}>No tiene notificaciones pendientes.</p>
          ) : notifs.map(n => (
            <div key={n.idNotificacion} style={{ borderBottom: `1px solid ${colors.border}`, paddingBottom: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 14 }}>{n.mensaje}</div>
              <div style={{ fontSize: 12, color: colors.textLight }}>{n.fecha}</div>
            </div>
          ))}
          <Link to="/notificaciones" style={{ color: colors.primary, fontSize: 14 }}>Ver todas</Link>
        </div>

        {/* Accesos rapidos */}
        <div style={css.card}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Acciones rapidas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/citas/nueva" style={{ ...css.btnPrimary, textAlign: 'center', textDecoration: 'none' }}>
              Nueva cita
            </Link>
            {esMedico && (
              <>
                <Link to="/pacientes" style={{ ...css.btnSecondary, textAlign: 'center', textDecoration: 'none' }}>
                  Gestion de pacientes
                </Link>
                <Link to="/reportes" style={{ ...css.btnSecondary, textAlign: 'center', textDecoration: 'none' }}>
                  Reportes
                </Link>
              </>
            )}
            {!esMedico && (
              <Link to="/mi-historial" style={{ ...css.btnSecondary, textAlign: 'center', textDecoration: 'none' }}>
                Mi historial clinico
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
