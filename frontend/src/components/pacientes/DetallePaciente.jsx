/**
 * Vista de detalle de un paciente con opcion de edicion.
 * Accesible por el medico o el propio paciente.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pacienteApi } from '../../api/pacienteApi';
import AlertMsg from '../common/AlertMsg';
import Spinner from '../common/Spinner';
import { css, colors } from '../../utils/styles';

export default function DetallePaciente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente,  setPaciente]  = useState(null);
  const [editando,  setEditando]  = useState(false);
  const [form,      setForm]      = useState({});
  const [mensaje,   setMensaje]   = useState({ tipo: '', texto: '' });
  const [cargando,  setCargando]  = useState(true);

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

  const Campo = ({ label, campo, type = 'text' }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={css.label}>{label}</label>
      {editando
        ? <input style={css.input} type={type} value={form[campo] || ''} onChange={e => setForm(f => ({ ...f, [campo]: e.target.value }))} />
        : <div style={{ padding: '8px 0', fontSize: 14 }}>{paciente[campo]}</div>
      }
    </div>
  );

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <button onClick={() => navigate(-1)} style={{ ...css.btnSecondary, marginBottom: 20 }}>Volver</button>
      <h2 style={{ marginBottom: 4 }}>Ficha del Paciente</h2>
      <AlertMsg tipo={mensaje.tipo} mensaje={mensaje.texto} />
      <div style={css.card}>
        <form onSubmit={guardar}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: 'span 2' }}><Campo label="Nombre completo" campo="nombre" /></div>
            <Campo label="Correo" campo="correo" type="email" />
            <Campo label="Telefono" campo="telefono" />
            <Campo label="Edad" campo="edad" type="number" />
            <div>
              <label style={css.label}>Sexo</label>
              {editando
                ? <select style={css.input} value={form.sexo} onChange={e => setForm(f => ({ ...f, sexo: e.target.value }))}>
                    <option value="M">Masculino</option><option value="F">Femenino</option><option value="Otro">Otro</option>
                  </select>
                : <div style={{ padding: '8px 0', fontSize: 14 }}>{paciente.sexo}</div>
              }
            </div>
            <div style={{ gridColumn: 'span 2' }}><Campo label="Direccion" campo="direccion" /></div>
          </div>
          {editando ? (
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="submit" style={css.btnPrimary}>Guardar cambios</button>
              <button type="button" onClick={() => setEditando(false)} style={css.btnSecondary}>Cancelar</button>
            </div>
          ) : (
            <button type="button" onClick={() => setEditando(true)} style={{ ...css.btnPrimary, marginTop: 16 }}>Editar</button>
          )}
        </form>
      </div>
    </div>
  );
}
