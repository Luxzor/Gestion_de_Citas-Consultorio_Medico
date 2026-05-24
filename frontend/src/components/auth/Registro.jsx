/**
 * Formulario de registro de nuevo paciente.
 * Incluye todos los campos demograficos requeridos y validacion en tiempo real.
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import AlertMsg from '../common/AlertMsg';
import { css, colors } from '../../utils/styles';

const CAMPOS = [
  { name: 'nombreUsuario', label: 'Usuario', type: 'text', placeholder: 'min. 4 caracteres' },
  { name: 'contrasena',   label: 'Contrasena', type: 'password', placeholder: 'min. 8 caracteres' },
  { name: 'nombre',       label: 'Nombre completo', type: 'text' },
  { name: 'correo',       label: 'Correo electronico', type: 'email' },
  { name: 'telefono',     label: 'Telefono', type: 'tel' },
  { name: 'direccion',    label: 'Direccion', type: 'text' },
  { name: 'edad',         label: 'Edad', type: 'number' },
];

export default function Registro() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm] = useState({
    nombreUsuario:'', contrasena:'', nombre:'', correo:'',
    telefono:'', direccion:'', edad:'', sexo:'M',
  });
  const [error,   setError]   = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.contrasena.length < 8) { setError('La contrasena debe tener al menos 8 caracteres.'); return; }
    setCargando(true);
    try {
      await authApi.registro({ ...form, edad: Number(form.edad) });
      await login(form.nombreUsuario, form.contrasena);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrar. Verifique los datos.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.background, padding: 16 }}>
      <div style={{ ...css.card, width: 480, maxWidth: '100%' }}>
        <h1 style={{ fontSize: 20, color: colors.primary, marginBottom: 4 }}>Registro de Paciente</h1>
        <p style={{ color: colors.textLight, fontSize: 13, marginBottom: 20 }}>Complete todos los campos para crear su cuenta</p>
        <AlertMsg tipo="error" mensaje={error} />
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {CAMPOS.map(c => (
              <div key={c.name} style={{ gridColumn: ['direccion','nombre','correo'].includes(c.name) ? 'span 2' : 'span 1' }}>
                <label style={css.label}>{c.label}</label>
                <input style={css.input} name={c.name} type={c.type || 'text'}
                  value={form[c.name]} onChange={handleChange}
                  placeholder={c.placeholder || ''} required />
              </div>
            ))}
            <div>
              <label style={css.label}>Sexo</label>
              <select style={css.input} name="sexo" value={form.sexo} onChange={handleChange}>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>
          <button type="submit" style={{ ...css.btnPrimary, width: '100%', marginTop: 20 }} disabled={cargando}>
            {cargando ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: colors.textLight }}>
          Ya tiene cuenta? <Link to="/login" style={{ color: colors.primary }}>Iniciar sesion</Link>
        </p>
      </div>
    </div>
  );
}
