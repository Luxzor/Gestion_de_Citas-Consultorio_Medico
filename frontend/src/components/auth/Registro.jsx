import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';

const CAMPOS = [
  { name: 'nombreUsuario', label: 'Usuario', type: 'text', placeholder: 'mín. 4 caracteres', col: 1 },
  { name: 'contrasena',   label: 'Contraseña', type: 'password', placeholder: 'mín. 8 caracteres', col: 1 },
  { name: 'nombre',       label: 'Nombre completo', type: 'text', col: 2 },
  { name: 'correo',       label: 'Correo electrónico', type: 'email', col: 2 },
  { name: 'telefono',     label: 'Teléfono', type: 'tel', col: 1 },
  { name: 'edad',         label: 'Edad', type: 'number', col: 1 },
  { name: 'direccion',    label: 'Dirección', type: 'text', col: 2 },
];

export default function Registro() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm] = useState({
    nombreUsuario:'', contrasena:'', nombre:'', correo:'',
    telefono:'', direccion:'', edad:'', sexo:'M',
  });
  const [error,    setError]    = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f5f2',
      padding: '32px 16px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #e3eeeb',
        boxShadow: '0 4px 24px rgba(15,43,36,0.10)',
        width: '100%',
        maxWidth: 520,
        overflow: 'hidden',
        animation: 'slideUp 0.4s ease both',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #15423a 0%, #1d5e52 100%)',
          padding: '28px 32px 24px',
        }}>
          <Link to="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 16,
            textDecoration: 'none',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Volver al inicio de sesión
          </Link>
          <h1 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 26, fontWeight: 700, color: '#fff',
            margin: 0, marginBottom: 4,
          }}>
            Crear cuenta
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: 0 }}>
            Complete sus datos para registrarse como paciente
          </p>
        </div>

        {/* Formulario */}
        <div style={{ padding: '28px 32px 32px' }}>
          {error && (
            <div className="alert alert-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              {CAMPOS.map(c => (
                <div
                  key={c.name}
                  className="field-group"
                  style={{ gridColumn: c.col === 2 ? 'span 2' : 'span 1' }}
                >
                  <label className="field-label">{c.label}</label>
                  <input
                    className="input-field"
                    name={c.name}
                    type={c.type || 'text'}
                    value={form[c.name]}
                    onChange={handleChange}
                    placeholder={c.placeholder || ''}
                    required
                  />
                </div>
              ))}

              <div className="field-group" style={{ gridColumn: 'span 1' }}>
                <label className="field-label">Sexo</label>
                <select className="input-field" name="sexo" value={form.sexo} onChange={handleChange}>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: 8 }}
              disabled={cargando}
            >
              {cargando ? (
                <>
                  <span style={{
                    width: 16, height: 16,
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTop: '2px solid #fff',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                    display: 'inline-block',
                  }} />
                  Registrando...
                </>
              ) : 'Crear cuenta'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#4d7a6e' }}>
            ¿Ya tiene cuenta?{' '}
            <Link to="/login" style={{ color: '#15423a', fontWeight: 600 }}>
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
