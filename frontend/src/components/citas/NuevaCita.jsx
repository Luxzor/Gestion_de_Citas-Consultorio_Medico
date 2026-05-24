/**
 * Formulario de reserva de cita con selector de fecha y horarios disponibles.
 * Consulta disponibilidad en tiempo real antes de mostrar el formulario de confirmacion.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { citaApi } from '../../api/citaApi';
import { pacienteApi } from '../../api/pacienteApi';
import { useAuth } from '../../context/AuthContext';
import AlertMsg from '../common/AlertMsg';
import Spinner from '../common/Spinner';
import { css, colors } from '../../utils/styles';

export default function NuevaCita() {
  const { usuario, esMedico } = useAuth();
  const navigate = useNavigate();
  const [pacientes,     setPacientes]    = useState([]);
  const [disponibilidad, setDispon]      = useState([]);
  const [form,           setForm]        = useState({ idPaciente: '', idMedico: 1, fecha: '', horaInicio: '', horaFin: '' });
  const [paso,           setPaso]        = useState(1); // 1=fecha/paciente, 2=horario, 3=confirmacion
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
      const payload = {
        ...form,
        idPaciente: esMedico ? Number(form.idPaciente) : usuario.idPaciente,
      };
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

  return (
    <div style={{ padding: 24, maxWidth: 560 }}>
      <button onClick={() => paso > 1 ? setPaso(p => p-1) : navigate('/citas')}
        style={{ ...css.btnSecondary, marginBottom: 20 }}>
        {paso > 1 ? 'Volver' : 'Cancelar'}
      </button>
      <h2 style={{ marginBottom: 20 }}>Reservar Cita</h2>
      <AlertMsg tipo={mensaje.tipo} mensaje={mensaje.texto} />

      {/* Paso 1: Seleccion de fecha y paciente */}
      {paso === 1 && (
        <div style={css.card}>
          {esMedico && (
            <div style={{ marginBottom: 16 }}>
              <label style={css.label}>Paciente</label>
              <select style={css.input} value={form.idPaciente}
                onChange={e => setForm(f => ({ ...f, idPaciente: e.target.value }))}>
                <option value="">Seleccione un paciente</option>
                {pacientes.map(p => <option key={p.idPaciente} value={p.idPaciente}>{p.nombre}</option>)}
              </select>
            </div>
          )}
          <div style={{ marginBottom: 20 }}>
            <label style={css.label}>Fecha de la cita</label>
            <input style={css.input} type="date" value={form.fecha}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
          </div>
          <button onClick={consultarDispon} style={css.btnPrimary} disabled={cargando}>
            {cargando ? 'Consultando...' : 'Ver horarios disponibles'}
          </button>
        </div>
      )}

      {/* Paso 2: Seleccion de horario */}
      {paso === 2 && (
        <div style={css.card}>
          <p style={{ color: colors.textLight, marginBottom: 16, fontSize: 14 }}>
            Seleccione un horario disponible para el {form.fecha}:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {disponibilidad.map(h => (
              <button key={h.horaInicio} onClick={() => h.disponible && seleccionarHorario(h)}
                disabled={!h.disponible}
                style={{
                  padding: '10px 6px', borderRadius: 6, border: `1px solid ${colors.border}`,
                  fontSize: 13, cursor: h.disponible ? 'pointer' : 'not-allowed',
                  background: h.disponible ? '#f0fdf4' : '#f1f5f9',
                  color: h.disponible ? '#15803d' : colors.textLight,
                  fontWeight: h.disponible ? 600 : 400,
                }}>
                {h.horaInicio}
                {!h.disponible && <div style={{ fontSize: 11 }}>Ocupado</div>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Paso 3: Confirmacion */}
      {paso === 3 && (
        <div style={css.card}>
          <h3 style={{ marginBottom: 16 }}>Confirmar reserva</h3>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, marginBottom: 8 }}><b>Fecha:</b> {form.fecha}</div>
            <div style={{ fontSize: 14, marginBottom: 8 }}><b>Horario:</b> {form.horaInicio} - {form.horaFin}</div>
            {esMedico && <div style={{ fontSize: 14 }}><b>Paciente id:</b> {form.idPaciente}</div>}
          </div>
          <button onClick={confirmar} style={css.btnPrimary} disabled={cargando}>
            {cargando ? 'Registrando...' : 'Confirmar cita'}
          </button>
        </div>
      )}
      {cargando && paso !== 1 && <Spinner />}
    </div>
  );
}
