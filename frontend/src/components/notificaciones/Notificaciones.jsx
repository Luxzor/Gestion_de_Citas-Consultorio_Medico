/**
 * Lista de notificaciones del usuario autenticado.
 * Permite marcar avisos individuales o todos como leidos.
 */
import { useState, useEffect } from 'react';
import { notificacionApi } from '../../api/notificacionApi';
import Spinner from '../common/Spinner';
import AlertMsg from '../common/AlertMsg';
import { css, colors } from '../../utils/styles';

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
      setMensaje({ tipo: 'error', texto: 'Error al marcar la notificacion.' });
    }
  };

  const marcarTodas = async () => {
    const noLeidas = notifs.filter(n => !n.leida);
    await Promise.all(noLeidas.map(n => notificacionApi.marcarLeida(n.idNotificacion).catch(() => {})));
    setNotifs(ns => ns.map(n => ({ ...n, leida: true })));
    setMensaje({ tipo: 'exito', texto: 'Todas las notificaciones marcadas como leidas.' });
  };

  const noLeidas = notifs.filter(n => !n.leida).length;

  if (cargando) return <Spinner />;

  return (
    <div style={{ padding: 24, maxWidth: 640 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>
          Notificaciones
          {noLeidas > 0 && (
            <span style={{ background: colors.danger, color: '#fff', borderRadius: 999,
              fontSize: 12, fontWeight: 700, padding: '2px 8px', marginLeft: 8 }}>
              {noLeidas} nuevas
            </span>
          )}
        </h2>
        {noLeidas > 0 && (
          <button onClick={marcarTodas} style={css.btnSecondary}>Marcar todas como leidas</button>
        )}
      </div>
      <AlertMsg tipo={mensaje.tipo} mensaje={mensaje.texto} />
      {notifs.length === 0 ? (
        <div style={{ ...css.card, textAlign: 'center', color: colors.textLight, padding: 40 }}>
          No tiene notificaciones.
        </div>
      ) : notifs.map(n => (
        <div key={n.idNotificacion} style={{
          ...css.card, marginBottom: 10, display: 'flex',
          justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
          borderLeft: n.leida ? undefined : `4px solid ${colors.primary}`,
          background: n.leida ? '#f8fafc' : '#fff',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: n.leida ? 400 : 600 }}>{n.mensaje}</div>
            <div style={{ fontSize: 12, color: colors.textLight, marginTop: 6 }}>{n.fecha}</div>
          </div>
          {!n.leida && (
            <button onClick={() => marcarLeida(n.idNotificacion)}
              style={{ background: 'none', border: `1px solid ${colors.border}`,
                borderRadius: 4, padding: '4px 10px', fontSize: 12, cursor: 'pointer',
                color: colors.textLight, whiteSpace: 'nowrap' }}>
              Marcar leida
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
