import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { consultaApi } from '../../api/consultaApi';
import AlertMsg from '../common/AlertMsg';

const VITALES = [
  { name: 'temperatura', label: 'Temperatura', unit: '°C', placeholder: '36.6' },
  { name: 'peso',        label: 'Peso',         unit: 'kg', placeholder: '70.5' },
  { name: 'altura',      label: 'Altura',        unit: 'cm', placeholder: '175'  },
  { name: 'presion',     label: 'Presión arterial', unit: 'mmHg', placeholder: '120/80' },
];

const TEXTO = [
  { name: 'relatoria',    label: 'Relatoría de la consulta', rows: 4, required: true  },
  { name: 'diagnostico',  label: 'Diagnóstico',              rows: 3, required: true  },
  { name: 'prescripcion', label: 'Prescripción médica',      rows: 3, required: true  },
  { name: 'resultados',   label: 'Resultados de análisis',   rows: 3, required: false },
];

export default function FormConsulta() {
  const { idCita } = useParams();
  const navigate   = useNavigate();
  const [form, setForm] = useState({
    temperatura:'', peso:'', altura:'', presion:'',
    relatoria:'', diagnostico:'', prescripcion:'', resultados:'',
  });
  const [mensaje,  setMensaje]  = useState({ tipo: '', texto: '' });
  const [cargando, setCargando] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    const requeridos = ['temperatura','peso','altura','presion','relatoria','diagnostico','prescripcion'];
    if (requeridos.some(k => !form[k].trim())) {
      setMensaje({ tipo: 'error', texto: 'Complete todos los campos obligatorios.' });
      return;
    }
    setCargando(true);
    try {
      await consultaApi.registrar({ ...form, idCita: Number(idCita) });
      setMensaje({ tipo: 'exito', texto: 'Consulta registrada correctamente.' });
      setTimeout(() => navigate('/citas'), 1500);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.mensaje || 'Error al registrar la consulta.' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ padding: '32px 28px', maxWidth: 700, margin: '0 auto' }}>

      {/* Header */}
      <button onClick={() => navigate('/citas')} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        Volver
      </button>

      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Registro de Consulta</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
          <span className="badge badge-primary">Cita #{idCita}</span>
          <span style={{ fontSize: 13, color: '#4d7a6e' }}>
            Los datos clínicos se cifran con AES-256-GCM
          </span>
        </div>
      </div>

      <AlertMsg tipo={mensaje.tipo} mensaje={mensaje.texto} />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Signos vitales */}
        <div className="card" style={{ background: '#e8f2ef', border: '1px solid #cce0d9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{
              width: 36, height: 36, background: '#15423a', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <div>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 600, color: '#0f2b24', margin: 0 }}>
                Signos Vitales
              </h3>
              <p style={{ fontSize: 12, color: '#4d7a6e', margin: 0 }}>Todos los campos son obligatorios</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            {VITALES.map(({ name, label, unit, placeholder }) => (
              <div key={name} className="field-group">
                <label className="field-label">{label} *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input-field"
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    style={{ paddingRight: 48, background: '#fff' }}
                    required
                  />
                  <span style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 12, fontWeight: 600, color: '#4d7a6e', pointerEvents: 'none',
                  }}>
                    {unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Historia clínica */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{
              width: 36, height: 36, background: '#e8f2ef', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15423a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 600, color: '#0f2b24', margin: 0 }}>
                Historia Clínica
              </h3>
              <p style={{ fontSize: 12, color: '#4d7a6e', margin: 0 }}>Registro de la consulta</p>
            </div>
          </div>

          {TEXTO.map(({ name, label, rows, required }) => (
            <div key={name} className="field-group">
              <label className="field-label">
                {label}{required ? ' *' : ' (opcional)'}
              </label>
              <textarea
                className="input-field"
                name={name}
                rows={rows}
                value={form[name]}
                onChange={handleChange}
                required={required}
                style={{ resize: 'vertical' }}
              />
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={cargando}>
          {cargando ? (
            <>
              <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
              Guardando...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
              </svg>
              Guardar consulta
            </>
          )}
        </button>
      </form>
    </div>
  );
}
