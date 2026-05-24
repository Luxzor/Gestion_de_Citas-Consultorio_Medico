/**
 * Formulario de captura de historia clinica para el medico.
 * Campos de signos vitales (temperatura, peso, altura, presion) y
 * campos de texto extenso para relatoria, diagnostico, prescripcion y resultados.
 */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { consultaApi } from '../../api/consultaApi';
import AlertMsg from '../common/AlertMsg';
import { css, colors } from '../../utils/styles';

const CAMPOS_VITALES = [
  { name: 'temperatura', label: 'Temperatura (C)', placeholder: 'Ej: 36.6' },
  { name: 'peso',        label: 'Peso (kg)',        placeholder: 'Ej: 70.5' },
  { name: 'altura',      label: 'Altura (cm)',      placeholder: 'Ej: 175' },
  { name: 'presion',     label: 'Presion arterial', placeholder: 'Ej: 120/80' },
];

const CAMPOS_TEXTO = [
  { name: 'relatoria',    label: 'Relatoria de la consulta', rows: 4 },
  { name: 'diagnostico',  label: 'Diagnostico', rows: 3 },
  { name: 'prescripcion', label: 'Prescripcion medica', rows: 3 },
  { name: 'resultados',   label: 'Resultados de analisis (opcional)', rows: 3 },
];

export default function FormConsulta() {
  const { idCita }  = useParams();
  const navigate    = useNavigate();
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
    <div style={{ padding: 24, maxWidth: 680 }}>
      <button onClick={() => navigate('/citas')} style={{ ...css.btnSecondary, marginBottom: 20 }}>Volver</button>
      <h2 style={{ marginBottom: 4 }}>Registro de Consulta Clinica</h2>
      <p style={{ color: colors.textLight, fontSize: 13, marginBottom: 20 }}>
        Cita #{idCita}. Los datos se cifran con AES-256-GCM antes de almacenarse.
      </p>
      <AlertMsg tipo={mensaje.tipo} mensaje={mensaje.texto} />
      <form onSubmit={handleSubmit}>
        <div style={css.card}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, color: colors.textLight }}>Signos vitales</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {CAMPOS_VITALES.map(c => (
              <div key={c.name}>
                <label style={css.label}>{c.label} *</label>
                <input style={css.input} name={c.name} value={form[c.name]}
                  onChange={handleChange} placeholder={c.placeholder} required />
              </div>
            ))}
          </div>
        </div>
        <div style={{ ...css.card, marginTop: 16 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, color: colors.textLight }}>Historia clinica</h3>
          {CAMPOS_TEXTO.map(c => (
            <div key={c.name} style={{ marginBottom: 16 }}>
              <label style={css.label}>{c.label}{c.name !== 'resultados' ? ' *' : ''}</label>
              <textarea style={{ ...css.input, resize: 'vertical' }} name={c.name} rows={c.rows}
                value={form[c.name]} onChange={handleChange}
                required={c.name !== 'resultados'} />
            </div>
          ))}
        </div>
        <button type="submit" style={{ ...css.btnPrimary, marginTop: 16 }} disabled={cargando}>
          {cargando ? 'Guardando...' : 'Guardar consulta'}
        </button>
      </form>
    </div>
  );
}
