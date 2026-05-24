/**
 * Pantalla de inicio de sesion.
 * Valida en tiempo real y muestra mensajes descriptivos de error.
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AlertMsg from '../common/AlertMsg';
import { css, colors } from '../../utils/styles';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm] = useState({ nombreUsuario: '', contrasena: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.nombreUsuario || !form.contrasena) {
      setError('Ingrese su usuario y contrasena.');
      return;
    }
    setCargando(true);
    try {
      const data = await login(form.nombreUsuario, form.contrasena);
      navigate(data.rol === 'medico' ? '/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Credenciales invalidas. Verifique sus datos.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.background }}>
      <div style={{ ...css.card, width: 380, maxWidth: '90vw' }}>
        <h1 style={{ textAlign: 'center', fontSize: 22, marginBottom: 4, color: colors.primary }}>Consultorio Medico</h1>
        <p style={{ textAlign: 'center', color: colors.textLight, fontSize: 14, marginBottom: 24 }}>Ingrese sus credenciales</p>
        <AlertMsg tipo="error" mensaje={error} />
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={css.label}>Usuario</label>
            <input style={css.input} name="nombreUsuario" value={form.nombreUsuario}
              onChange={handleChange} placeholder="nombre_usuario" autoComplete="username" />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={css.label}>Contrasena</label>
            <input style={css.input} name="contrasena" type="password" value={form.contrasena}
              onChange={handleChange} placeholder="Contrasena" autoComplete="current-password" />
          </div>
          <button type="submit" style={{ ...css.btnPrimary, width: '100%' }} disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Iniciar sesion'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: colors.textLight }}>
          Nuevo paciente? <Link to="/registro" style={{ color: colors.primary }}>Registrarse</Link>
        </p>
      </div>
    </div>
  );
}
