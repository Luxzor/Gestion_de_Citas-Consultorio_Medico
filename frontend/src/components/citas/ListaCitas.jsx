/**
 * Lista de citas con filtro por estado.
 * El medico ve todas las citas; el paciente solo las propias.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { citaApi } from '../../api/citaApi';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';
import AlertMsg from '../common/AlertMsg';
import { css, colors } from '../../utils/styles';

const COLORES_ESTADO = {
  programada: { bg: '#eff6ff', color: '#1d4ed8' },
  atendida:   { bg: '#f0fdf4', color: '#15803d' },
  cancelada:  { bg: '#fef2f2', color: '#dc2626' },
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
    if (!window.confirm('Desea cancelar esta cita?')) return;
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
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Citas Medicas</h2>
        <Link to="/citas/nueva" style={{ ...css.btnPrimary, textDecoration: 'none' }}>Nueva cita</Link>
      </div>
      <AlertMsg tipo={mensaje.tipo} mensaje={mensaje.texto} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['todas','programada','atendida','cancelada'].map(e => (
          <button key={e} onClick={() => setFiltro(e)}
            style={{ ...css.btnSecondary, background: filtro === e ? colors.primary : undefined,
              color: filtro === e ? '#fff' : undefined }}>
            {e.charAt(0).toUpperCase() + e.slice(1)}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtradas.length === 0 ? (
          <div style={{ ...css.card, textAlign: 'center', color: colors.textLight }}>No hay citas para mostrar.</div>
        ) : filtradas.map(c => (
          <div key={c.idCita} style={{ ...css.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{c.fecha} a las {c.horaInicio} - {c.horaFin}</div>
              <div style={{ color: colors.textLight, fontSize: 13, marginTop: 4 }}>
                {esMedico ? `Paciente: ${c.nombrePaciente}` : `Medico: ${c.nombreMedico}`}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ ...COLORES_ESTADO[c.estado], padding: '4px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                {c.estado}
              </span>
              {c.estado === 'programada' && (
                <>
                  {esMedico && (
                    <Link to={`/consultas/nueva/${c.idCita}`} style={{ color: colors.primary, fontSize: 13 }}>Registrar consulta</Link>
                  )}
                  <button onClick={() => cancelar(c.idCita)}
                    style={{ background: 'none', border: 'none', color: colors.danger, fontSize: 13, cursor: 'pointer' }}>
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
