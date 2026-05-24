import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pacienteApi } from '../../api/pacienteApi';
import AlertMsg from '../common/AlertMsg';
import Spinner from '../common/Spinner';

function initiales(nombre = '') {
  return nombre.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

const CAMPOS = [
  { label: 'Nombre completo', campo: 'nombre',    type: 'text',   col: 2 },
  { label: 'Correo',          campo: 'correo',    type: 'email',  col: 1 },
  { label: 'Teléfono',        campo: 'telefono',  type: 'tel',    col: 1 },
  { label: 'Edad',            campo: 'edad',      type: 'number', col: 1 },
  { label: 'Dirección',       campo: 'direccion', type: 'text',   col: 2 },
];

export default function DetallePaciente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [editando, setEditando] = useState(false);
  const [form,     setForm]     = useState({});
  const [mensaje,  setMensaje]  = useState({ tipo: '', texto: '' });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    pacienteApi.obtener(id)
      .then(({ data }) => { setPaciente(data); setForm(data); })
      .catch(() => setMensaje({ tipo: 'error', texto: 'Error al cargar el paciente.' }))
      .finally(() => setCargando(false));
  }, [id]);

  const guardar = async e => {
    e.preventDefault();
    try {
      const { data } = await pacienteApi.actualizar(id, form);
      setPaciente(data);
      setEditando(false);
      setMensaje({ tipo: 'exito', texto: 'Datos actualizados correctamente.' });
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al actualizar el paciente.' });
    }
  };

  if (cargando) return <Spinner />;
  if (!paciente) return <div style={{ padding: 32 }}><AlertMsg tipo="error" mensaje="No se encontró el paciente." /></div>;

  return (
    <div style={{ padding: '32px 28px', maxWidth: 620, margin: '0 auto' }}>

      {/* Botón volver */}
      <button
        onClick={() => navigate(-1)}
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 20 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        Volver
      </button>

      {/* Header del perfil */}
      <div style={{
        background: 'linear-gradient(135deg, #15423a 0%, #1d5e52 100%)',
        borderRadius: 14,
        padding: '24px 28px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
      }}>
        <div className="avatar avatar-lg" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 22 }}>
          {initiales(paciente.nombre)}
        </div>
        <div>
          <h1 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 22, fontWeight: 700, color: '#fff', margin: 0, marginBottom: 4,
          }}>
            {paciente.nombre}
          </h1>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{paciente.correo}</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{paciente.telefono}</span>
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <span className="badge badge-primary" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
              {paciente.edad} años
            </span>
            <span className="badge badge-primary" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
              {paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Femenino' : paciente.sexo}
            </span>
          </div>
        </div>
      </div>

      <AlertMsg tipo={mensaje.tipo} mensaje={mensaje.texto} />

      {/* Formulario */}
      <div className="card">
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
        }}>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 600, color: '#0f2b24', margin: 0 }}>
            Información del Paciente
          </h3>
          {!editando && (
            <button
              onClick={() => setEditando(true)}
              className="btn btn-secondary btn-sm"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Editar
            </button>
          )}
        </div>

        <form onSubmit={guardar}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            {CAMPOS.map(({ label, campo, type, col }) => (
              <div
                key={campo}
                className="field-group"
                style={{ gridColumn: `span ${col}` }}
              >
                <label className="field-label">{label}</label>
                {editando ? (
                  <input
                    className="input-field"
                    type={type}
                    value={form[campo] || ''}
                    onChange={e => setForm(f => ({ ...f, [campo]: e.target.value }))}
                  />
                ) : (
                  <div style={{ padding: '10px 0', fontSize: 14, color: '#0f2b24', borderBottom: '1px solid #e3eeeb' }}>
                    {paciente[campo] || <span style={{ color: '#9dbcb3' }}>—</span>}
                  </div>
                )}
              </div>
            ))}

            {/* Sexo */}
            <div className="field-group" style={{ gridColumn: 'span 1' }}>
              <label className="field-label">Sexo</label>
              {editando ? (
                <select
                  className="input-field"
                  value={form.sexo}
                  onChange={e => setForm(f => ({ ...f, sexo: e.target.value }))}
                >
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              ) : (
                <div style={{ padding: '10px 0', fontSize: 14, color: '#0f2b24', borderBottom: '1px solid #e3eeeb' }}>
                  {paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Femenino' : paciente.sexo}
                </div>
              )}
            </div>
          </div>

          {editando && (
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Guardar cambios
              </button>
              <button type="button" onClick={() => { setEditando(false); setForm(paciente); }} className="btn btn-ghost">
                Cancelar
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
