import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { citaApi } from '../../api/citaApi';
import { pacienteApi } from '../../api/pacienteApi';
import { useAuth } from '../../context/AuthContext';
import AlertMsg from '../common/AlertMsg';
import Spinner from '../common/Spinner';

const PASOS = ['Fecha', 'Horario', 'Confirmar'];

export default function NuevaCita() {
  const { usuario, esMedico } = useAuth();
  const navigate = useNavigate();
  const [pacientes,      setPacientes]   = useState([]);
  const [disponibilidad, setDispon]      = useState([]);
  const [form,           setForm]        = useState({ idPaciente: '', idMedico: 1, fecha: '', horaInicio: '', horaFin: '' });
  const [paso,           setPaso]        = useState(1);
  const [cargando,       setCargando]    = useState(false);
  const [mensaje,        setMensaje]     = useState({ tipo: '', texto: '' });

  useEffect(() => {
    if (esMedico) {
      pacienteApi.listar().then(({ data }) => setPacientes(data)).catch(() => {});
    }
  }, [esMedico]);

  const consultarDispon = async () => {
    if (!form.fecha) { setMensaje({ tipo: 'error', texto: 'Seleccione una fecha.' }); return; }
    if (esMedico && !form.idPaciente) { setMensaje({ tipo: 'error', texto: 'Seleccione un paciente.' }); return; }
    setCargando(true);
    try {
      const { data } = await citaApi.disponibilidad(form.idMedico, form.fecha);
      setDispon(data);
      setPaso(2);
      setMensaje({ tipo: '', texto: '' });
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al consultar disponibilidad.' });
    } finally {
      setCargando(false);
    }
  };

  const seleccionarHorario = (h) => {
    setForm(f => ({ ...f, horaInicio: h.horaInicio, horaFin: h.horaFin }));
    setPaso(3);
  };

  const confirmar = async () => {
    setCargando(true);
    try {
      const payload = { ...form, idPaciente: esMedico ? Number(form.idPaciente) : usuario.idPaciente };
      await citaApi.crear(payload);
      setMensaje({ tipo: 'exito', texto: 'Cita registrada exitosamente.' });
      setTimeout(() => navigate('/citas'), 1500);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.mensaje || 'Error al registrar la cita.' });
      if (err.response?.status === 409) { setPaso(2); consultarDispon(); }
    } finally {
      setCargando(false);
    }
  };

  const nombrePaciente = esMedico
    ? pacientes.find(p => String(p.idPaciente) === String(form.idPaciente))?.nombre
    : null;

  return (
    <div style={{ padding: '32px 28px', maxWidth: 580, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <button
          onClick={() => paso > 1 ? setPaso(p => p - 1) : navigate('/citas')}
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: 16 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          {paso > 1 ? 'Volver' : 'Cancelar'}
        </button>

        <h1 className="page-title">Reservar Cita</h1>
        <p className="page-subtitle">Complete los pasos para confirmar su reserva</p>
      </div>

      {/* Indicador de pasos */}
      <div className="step-indicator" style={{ marginBottom: 28 }}>
        {PASOS.map((label, idx) => {
          const num = idx + 1;
          const done   = paso > num;
          const active = paso === num;
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: idx < PASOS.length - 1 ? 1 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div className={`step-circle ${done ? 'done' : active ? 'active' : 'pending'}`}>
                  {done ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : num}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: active ? '#15423a' : '#4d7a6e', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              </div>
              {idx < PASOS.length - 1 && (
                <div className={`step-line ${done ? 'done' : ''}`} style={{ marginBottom: 20 }} />
              )}
            </div>
          );
        })}
      </div>

      <AlertMsg tipo={mensaje.tipo} mensaje={mensaje.texto} />

      {/* Paso 1: Selección de fecha y paciente */}
      {paso === 1 && (
        <div className="card">
          <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, color: '#0f2b24', marginBottom: 20 }}>
            Seleccionar fecha
          </h3>
          {esMedico && (
            <div className="field-group">
              <label className="field-label">Paciente</label>
              <select
                className="input-field"
                value={form.idPaciente}
                onChange={e => setForm(f => ({ ...f, idPaciente: e.target.value }))}
              >
                <option value="">Seleccione un paciente</option>
                {pacientes.map(p => (
                  <option key={p.idPaciente} value={p.idPaciente}>{p.nombre}</option>
                ))}
              </select>
            </div>
          )}
          <div className="field-group">
            <label className="field-label">Fecha de la cita</label>
            <input
              className="input-field"
              type="date"
              value={form.fecha}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
            />
          </div>
          <button
            onClick={consultarDispon}
            className="btn btn-primary"
            disabled={cargando}
          >
            {cargando ? (
              <>
                <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                Consultando...
              </>
            ) : 'Ver horarios disponibles'}
          </button>
        </div>
      )}

      {/* Paso 2: Selección de horario */}
      {paso === 2 && (
        <div className="card">
          <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, color: '#0f2b24', marginBottom: 6 }}>
            Horarios disponibles
          </h3>
          <p style={{ color: '#4d7a6e', fontSize: 13, marginBottom: 20 }}>
            Seleccione un horario para el <strong style={{ color: '#0f2b24' }}>{form.fecha}</strong>
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {disponibilidad.map(h => (
              <button
                key={h.horaInicio}
                onClick={() => h.disponible && seleccionarHorario(h)}
                disabled={!h.disponible}
                className={h.disponible ? 'slot-btn' : ''}
                style={!h.disponible ? {
                  padding: 10,
                  borderRadius: 6,
                  border: '1.5px solid #e3eeeb',
                  background: '#f5faf7',
                  color: '#9dbcb3',
                  fontSize: 12,
                  cursor: 'not-allowed',
                  textAlign: 'center',
                } : {}}
              >
                <div style={{ fontWeight: 600, fontSize: 13 }}>{h.horaInicio}</div>
                {!h.disponible && <div style={{ fontSize: 11, marginTop: 2 }}>Ocupado</div>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Paso 3: Confirmación */}
      {paso === 3 && (
        <div className="card">
          <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, color: '#0f2b24', marginBottom: 20 }}>
            Confirmar reserva
          </h3>

          {/* Resumen visual */}
          <div style={{
            background: '#e8f2ef',
            borderRadius: 10,
            padding: '20px 24px',
            marginBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 52, height: 52,
                background: '#15423a', borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, color: '#0f2b24' }}>
                  {form.horaInicio} – {form.horaFin}
                </div>
                <div style={{ fontSize: 14, color: '#4d7a6e', marginTop: 2 }}>{form.fecha}</div>
                {esMedico && nombrePaciente && (
                  <div style={{ fontSize: 13, color: '#2d7165', marginTop: 4, fontWeight: 600 }}>
                    Paciente: {nombrePaciente}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={confirmar}
            className="btn btn-primary btn-full btn-lg"
            disabled={cargando}
          >
            {cargando ? (
              <>
                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                Registrando...
              </>
            ) : 'Confirmar cita'}
          </button>
        </div>
      )}

      {cargando && paso !== 1 && <Spinner />}
    </div>
  );
}
