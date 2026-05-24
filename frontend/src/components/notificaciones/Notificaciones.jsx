import { useState, useEffect } from 'react';
import { notificacionApi } from '../../api/notificacionApi';
import Spinner from '../common/Spinner';
import AlertMsg from '../common/AlertMsg';

export default function Notificaciones() {
  const [notifs,   setNotifs]   = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje,  setMensaje]  = useState({ tipo: '', texto: '' });

  useEffect(() => {
    notificacionApi.listar()
      .then(({ data }) => setNotifs(data))
      .catch(() => setMensaje({ tipo: 'error', texto: 'Error al cargar notificaciones.' }))
      .finally(() => setCargando(false));
  }, []);

  const marcarLeida = async (id) => {
    try {
      await notificacionApi.marcarLeida(id);
      setNotifs(ns => ns.map(n => n.idNotificacion === id ? { ...n, leida: true } : n));
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al marcar la notificación.' });
    }
  };

  const marcarTodas = async () => {
    const noLeidas = notifs.filter(n => !n.leida);
    await Promise.all(noLeidas.map(n => notificacionApi.marcarLeida(n.idNotificacion).catch(() => {})));
    setNotifs(ns => ns.map(n => ({ ...n, leida: true })));
    setMensaje({ tipo: 'exito', texto: 'Todas las notificaciones marcadas como leídas.' });
  };

  const noLeidas = notifs.filter(n => !n.leida).length;

  if (cargando) return <Spinner />;

  return (
    <div style={{ padding: '32px 28px', maxWidth: 680, margin: '0 auto' }}>

      {/* Header */}
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 className="page-title" style={{ margin: 0 }}>Notificaciones</h1>
          {noLeidas > 0 && (
            <span className="badge badge-amber">{noLeidas} nueva{noLeidas !== 1 ? 's' : ''}</span>
          )}
        </div>
        {noLeidas > 0 && (
          <button onClick={marcarTodas} className="btn btn-secondary btn-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Marcar todas como leídas
          </button>
        )}
      </div>

      <AlertMsg tipo={mensaje.tipo} mensaje={mensaje.texto} />

      {notifs.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: 48 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            No tiene notificaciones.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifs.map((n, i) => (
            <div
              key={n.idNotificacion}
              className="list-item"
              style={{
                background: n.leida ? '#f5faf7' : '#fff',
                borderRadius: 12,
                border: '1px solid #e3eeeb',
                borderLeft: n.leida ? '4px solid #e3eeeb' : '4px solid #c8945a',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 12,
                boxShadow: n.leida ? 'none' : '0 1px 6px rgba(200,148,90,0.10)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                {!n.leida && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: '#c8945a', display: 'inline-block',
                    }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#c8945a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      Nueva
                    </span>
                  </div>
                )}
                <div style={{
                  fontSize: 14,
                  fontWeight: n.leida ? 400 : 600,
                  color: n.leida ? '#4d7a6e' : '#0f2b24',
                  lineHeight: 1.5,
                }}>
                  {n.mensaje}
                </div>
                <div style={{ fontSize: 12, color: '#9dbcb3', marginTop: 6 }}>{n.fecha}</div>
              </div>

              {!n.leida && (
                <button
                  onClick={() => marcarLeida(n.idNotificacion)}
                  className="btn btn-ghost btn-sm"
                  style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Leída
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
