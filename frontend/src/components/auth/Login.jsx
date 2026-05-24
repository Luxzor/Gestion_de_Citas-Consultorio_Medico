import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
      setError('Ingrese su usuario y contraseña.');
      return;
    }
    setCargando(true);
    try {
      await login(form.nombreUsuario, form.contrasena);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Credenciales inválidas. Verifique sus datos.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Panel izquierdo — branding */}
      <div style={{
        flex: '0 0 45%',
        background: 'linear-gradient(160deg, #15423a 0%, #1d5e52 60%, #2d7165 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 52px',
        position: 'relative',
        overflow: 'hidden',
      }} className="hide-mobile">
        {/* Patrón decorativo de fondo */}
        <svg
          style={{ position: 'absolute', top: 0, right: 0, opacity: 0.06, width: '70%' }}
          viewBox="0 0 400 400" fill="white"
        >
          <circle cx="300" cy="80"  r="160" />
          <circle cx="200" cy="320" r="120" />
          <circle cx="50"  cy="200" r="80"  />
        </svg>

        {/* Logo mark */}
        <div style={{
          width: 52, height: 52,
          background: 'rgba(255,255,255,0.15)',
          borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 36,
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>

        <h1 style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 36,
          fontWeight: 700,
          color: '#fff',
          lineHeight: 1.15,
          marginBottom: 16,
          letterSpacing: '-0.02em',
        }}>
          Consultorio<br />Médico
        </h1>

        <p style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontStyle: 'italic',
          fontSize: 17,
          color: 'rgba(255,255,255,0.75)',
          marginBottom: 48,
          lineHeight: 1.5,
        }}>
          La salud de nuestros pacientes<br />es nuestra prioridad.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { icon: 'calendar', label: 'Reserva de citas médicas' },
            { icon: 'file',     label: 'Historia clínica encriptada' },
            { icon: 'bar',      label: 'Reportes y seguimiento' },
          ].map(({ icon, label }) => (
            <div key={icon} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 32, height: 32,
                background: 'rgba(255,255,255,0.12)',
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <FeatureIcon name={icon} />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 500 }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        background: '#f0f5f2',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 380,
          animation: 'slideUp 0.4s ease both',
        }}>
          <h2 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 28,
            fontWeight: 700,
            color: '#0f2b24',
            marginBottom: 6,
          }}>
            Bienvenido de vuelta
          </h2>
          <p style={{ color: '#4d7a6e', fontSize: 14, marginBottom: 32 }}>
            Ingrese sus credenciales para continuar
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label className="field-label">Usuario</label>
              <input
                className="input-field"
                name="nombreUsuario"
                value={form.nombreUsuario}
                onChange={handleChange}
                placeholder="nombre_usuario"
                autoComplete="username"
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label className="field-label">Contraseña</label>
              <input
                className="input-field"
                name="contrasena"
                type="password"
                value={form.contrasena}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: 20 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
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
                  Ingresando...
                </>
              ) : 'Iniciar sesión'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#4d7a6e' }}>
            ¿Nuevo paciente?{' '}
            <Link to="/registro" style={{ color: '#15423a', fontWeight: 600 }}>
              Registrarse
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureIcon({ name }) {
  const stroke = 'rgba(255,255,255,0.9)';
  if (name === 'calendar')
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
  if (name === 'file')
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
}
