import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reporteApi } from '../../api/reporteApi';
import { pacienteApi } from '../../api/pacienteApi';
import Spinner from '../common/Spinner';
import AlertMsg from '../common/AlertMsg';

const hoy = new Date().toISOString().split('T')[0];
const mes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

const ESTADO_CFG = {
  programada: { cls: 'badge-blue',  label: 'Programada' },
  atendida:   { cls: 'badge-green', label: 'Atendida'   },
  cancelada:  { cls: 'badge-red',   label: 'Cancelada'  },
};

function initiales(nombre = '') {
  return nombre.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export default function Reportes() {
  const [pestana,      setPestana]      = useState('pacientes');
  const [pacientes,    setPacientes]    = useState([]);
  const [calendario,   setCalendario]   = useState([]);
  const [pacientesLst, setPacientesLst] = useState([]);
  const [idPacHist,    setIdPacHist]    = useState('');
  const [desde,        setDesde]        = useState(hoy);
  const [hasta,        setHasta]        = useState(mes);
  const [cargando,     setCargando]     = useState(false);
  const [error,        setError]        = useState('');

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

  const TABS = [
    { id: 'pacientes',  label: 'Lista de Pacientes' },
    { id: 'calendario', label: 'Calendario de Citas' },
    { id: 'historial',  label: 'Historial Clínico'  },
  ];

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1000, margin: '0 auto' }}>

      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Reportes</h1>
        <p className="page-subtitle">Información consolidada del consultorio</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${pestana === t.id ? 'active' : ''}`}
            onClick={() => setPestana(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AlertMsg tipo="error" mensaje={error} />

      {/* Pestaña: Lista de Pacientes */}
      {pestana === 'pacientes' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
            <button onClick={cargarPacientes} className="btn btn-secondary btn-sm">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Actualizar
            </button>
          </div>

          {cargando ? <Spinner /> : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {pacientes.length === 0 ? (
                  <div className="empty-state" style={{ padding: 40 }}>
                    No hay pacientes registrados.
                  </div>
                ) : pacientes.map((p, i) => (
                  <div key={p.idPaciente} className="list-item" style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 20px',
                    borderBottom: i < pacientes.length - 1 ? '1px solid #e3eeeb' : 'none',
                  }}>
                    <span style={{ color: '#9dbcb3', fontSize: 13, width: 24, flexShrink: 0 }}>{i + 1}</span>
                    <div className="avatar avatar-sm">{initiales(p.nombre)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#0f2b24' }}>{p.nombre}</div>
                      <div style={{ fontSize: 12, color: '#4d7a6e' }}>{p.correo} · {p.telefono}</div>
                    </div>
                    <div style={{ fontSize: 13, color: '#4d7a6e', flexShrink: 0 }}>
                      {p.edad} años · {p.sexo === 'M' ? 'Masc.' : p.sexo === 'F' ? 'Fem.' : p.sexo}
                    </div>
                    <Link to={`/reportes/historial/${p.idPaciente}`} className="btn btn-secondary btn-sm">
                      Ver historial
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pestaña: Calendario de Citas */}
      {pestana === 'calendario' && (
        <div>
          <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="field-group" style={{ margin: 0 }}>
              <label className="field-label">Desde</label>
              <input className="input-field" style={{ width: 170 }} type="date" value={desde}
                onChange={e => setDesde(e.target.value)} />
            </div>
            <div className="field-group" style={{ margin: 0 }}>
              <label className="field-label">Hasta</label>
              <input className="input-field" style={{ width: 170 }} type="date" value={hasta}
                onChange={e => setHasta(e.target.value)} />
            </div>
            <button onClick={cargarCalendario} className="btn btn-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Buscar
            </button>
          </div>

          {cargando ? <Spinner /> : calendario.length === 0 ? (
            <div className="card">
              <div className="empty-state">No hay citas en el rango seleccionado.</div>
            </div>
          ) : calendario.map(dia => (
            <div key={dia.fecha} className="card list-item" style={{ marginBottom: 14, padding: 0, overflow: 'hidden' }}>
              <div style={{
                background: '#e8f2ef', padding: '12px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, color: '#0f2b24' }}>
                  {dia.fecha}
                </span>
                <span className="badge badge-primary">{dia.citas.length} cita{dia.citas.length !== 1 ? 's' : ''}</span>
              </div>
              {dia.citas.map((c, i) => {
                const cfg = ESTADO_CFG[c.estado] || {};
                return (
                  <div key={c.idCita} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 20px',
                    borderBottom: i < dia.citas.length - 1 ? '1px solid #e3eeeb' : 'none',
                    gap: 12,
                  }}>
                    <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 15, color: '#0f2b24', flexShrink: 0 }}>
                      {c.horaInicio}–{c.horaFin}
                    </span>
                    <span style={{ fontSize: 14, color: '#0f2b24', flex: 1 }}>{c.nombrePaciente}</span>
                    {cfg.cls && <span className={`badge ${cfg.cls}`}>{cfg.label}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Pestaña: Historial Clínico */}
      {pestana === 'historial' && (
        <div className="card" style={{ maxWidth: 520 }}>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 600, color: '#0f2b24', margin: '0 0 18px' }}>
            Seleccionar paciente
          </h3>
          <div className="field-group">
            <label className="field-label">Paciente</label>
            <select
              className="input-field"
              value={idPacHist}
              onChange={e => setIdPacHist(e.target.value)}
            >
              <option value="">— Seleccione un paciente —</option>
              {pacientesLst.map(p => (
                <option key={p.idPaciente} value={p.idPaciente}>{p.nombre}</option>
              ))}
            </select>
          </div>
          {idPacHist && (
            <Link
              to={`/reportes/historial/${idPacHist}`}
              className="btn btn-primary"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              Ver historial clínico
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
