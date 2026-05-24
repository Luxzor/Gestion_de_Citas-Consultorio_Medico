/**
 * Pantalla de reportes con tres pestanas:
 *   1. Lista de pacientes
 *   2. Calendario de citas
 *   3. Historial clinico de un paciente
 * Todos los reportes requieren autenticacion valida.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reporteApi } from '../../api/reporteApi';
import { pacienteApi } from '../../api/pacienteApi';
import Spinner from '../common/Spinner';
import AlertMsg from '../common/AlertMsg';
import { css, colors } from '../../utils/styles';

const hoy  = new Date().toISOString().split('T')[0];
const mes  = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

export default function Reportes() {
  const [pestana,    setPestana]    = useState('pacientes');
  const [pacientes,  setPacientes]  = useState([]);
  const [calendario, setCalendario] = useState([]);
  const [pacientesLst, setPacientesLst] = useState([]);
  const [idPacHist,  setIdPacHist]  = useState('');
  const [desde,      setDesde]      = useState(hoy);
  const [hasta,      setHasta]      = useState(mes);
  const [cargando,   setCargando]   = useState(false);
  const [error,      setError]      = useState('');

  // Cargar lista de pacientes para el selector de historial
  useEffect(() => {
    pacienteApi.listar().then(({ data }) => setPacientesLst(data)).catch(() => {});
  }, []);

  const cargarPacientes = () => {
    setCargando(true); setError('');
    reporteApi.pacientes()
      .then(({ data }) => setPacientes(data))
      .catch(() => setError('Error al cargar el reporte de pacientes.'))
      .finally(() => setCargando(false));
  };

  const cargarCalendario = () => {
    setCargando(true); setError('');
    reporteApi.calendario(desde, hasta)
      .then(({ data }) => setCalendario(data))
      .catch(() => setError('Error al cargar el calendario.'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    if (pestana === 'pacientes') cargarPacientes();
    else if (pestana === 'calendario') cargarCalendario();
  // eslint-disable-next-line
  }, [pestana]);

  const tabStyle = (activa) => ({
    padding: '10px 20px', cursor: 'pointer', border: 'none',
    borderBottom: activa ? `2px solid ${colors.primary}` : '2px solid transparent',
    background: 'none', fontWeight: activa ? 700 : 400,
    color: activa ? colors.primary : colors.textLight, fontSize: 14,
  });

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 20 }}>Reportes</h2>
      <div style={{ borderBottom: `1px solid ${colors.border}`, marginBottom: 24 }}>
        {[
          { id: 'pacientes',  label: 'Lista de Pacientes' },
          { id: 'calendario', label: 'Calendario de Citas' },
          { id: 'historial',  label: 'Historial Clinico' },
        ].map(t => (
          <button key={t.id} onClick={() => setPestana(t.id)} style={tabStyle(pestana === t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <AlertMsg tipo="error" mensaje={error} />

      {/* Pestana: Lista de Pacientes */}
      {pestana === 'pacientes' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button onClick={cargarPacientes} style={css.btnSecondary}>Actualizar</button>
          </div>
          {cargando ? <Spinner /> : (
            <div style={{ ...css.card, padding: 0, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['#','Nombre','Correo','Telefono','Edad','Sexo','Accion'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13,
                        fontWeight: 600, color: colors.textLight, borderBottom: `1px solid ${colors.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pacientes.map((p, i) => (
                    <tr key={p.idPaciente} style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <td style={{ padding: '10px 16px', fontSize: 14, color: colors.textLight }}>{i+1}</td>
                      <td style={{ padding: '10px 16px', fontSize: 14, fontWeight: 600 }}>{p.nombre}</td>
                      <td style={{ padding: '10px 16px', fontSize: 14 }}>{p.correo}</td>
                      <td style={{ padding: '10px 16px', fontSize: 14 }}>{p.telefono}</td>
                      <td style={{ padding: '10px 16px', fontSize: 14 }}>{p.edad}</td>
                      <td style={{ padding: '10px 16px', fontSize: 14 }}>{p.sexo}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <Link to={`/reportes/historial/${p.idPaciente}`} style={{ color: colors.primary, fontSize: 13 }}>
                          Ver historial
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Pestana: Calendario de Citas */}
      {pestana === 'calendario' && (
        <>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 16, flexWrap: 'wrap' }}>
            <div>
              <label style={css.label}>Desde</label>
              <input style={{ ...css.input, width: 160 }} type="date" value={desde}
                onChange={e => setDesde(e.target.value)} />
            </div>
            <div>
              <label style={css.label}>Hasta</label>
              <input style={{ ...css.input, width: 160 }} type="date" value={hasta}
                onChange={e => setHasta(e.target.value)} />
            </div>
            <button onClick={cargarCalendario} style={css.btnPrimary}>Buscar</button>
          </div>
          {cargando ? <Spinner /> : calendario.length === 0 ? (
            <div style={{ ...css.card, textAlign: 'center', color: colors.textLight }}>
              No hay citas en el rango seleccionado.
            </div>
          ) : calendario.map(dia => (
            <div key={dia.fecha} style={{ ...css.card, marginBottom: 12 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 15, color: colors.primary }}>{dia.fecha}</h3>
              {dia.citas.map(c => (
                <div key={c.idCita} style={{ display: 'flex', justifyContent: 'space-between',
                  padding: '8px 0', borderBottom: `1px solid ${colors.border}`, fontSize: 14 }}>
                  <span>{c.horaInicio} - {c.horaFin}</span>
                  <span style={{ fontWeight: 600 }}>{c.nombrePaciente}</span>
                  <span style={{ color: colors.textLight }}>{c.estado}</span>
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {/* Pestana: Historial Clinico */}
      {pestana === 'historial' && (
        <div style={{ maxWidth: 500 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={css.label}>Seleccione un paciente</label>
            <select style={css.input} value={idPacHist} onChange={e => setIdPacHist(e.target.value)}>
              <option value="">-- Seleccione --</option>
              {pacientesLst.map(p => (
                <option key={p.idPaciente} value={p.idPaciente}>{p.nombre}</option>
              ))}
            </select>
          </div>
          {idPacHist && (
            <Link to={`/reportes/historial/${idPacHist}`}
              style={{ ...css.btnPrimary, textDecoration: 'none', display: 'inline-block' }}>
              Ver historial clinico
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
