import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificacionApi } from '../../api/notificacionApi';

export default function Navbar() {
  const { usuario, logout, esMedico } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [noLeidas, setNoLeidas] = useState(0);

  useEffect(() => {
    if (!usuario) return;
    const cargar = () => {
      notificacionApi.listar().then(({ data }) => {
        setNoLeidas(data.filter(n => !n.leida).length);
      }).catch(() => {});
    };
    cargar();
    const intervalo = setInterval(cargar, 30000);
    return () => clearInterval(intervalo);
  }, [usuario]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav style={{
      background: '#15423a',
      boxShadow: '0 2px 12px rgba(15,43,36,0.18)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        height: 60,
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        {/* Logo */}
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <span style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontWeight: 700,
            fontSize: 17,
            color: '#fff',
            letterSpacing: '-0.01em',
          }}>
            Consultorio Médico
          </span>
        </Link>

        {/* Links de navegación */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <NavLink to="/dashboard" active={isActive('/dashboard')}>Inicio</NavLink>
          <NavLink to="/citas" active={isActive('/citas')}>Citas</NavLink>
          {esMedico && (
            <>
              <NavLink to="/pacientes" active={isActive('/pacientes')}>Pacientes</NavLink>
              <NavLink to="/reportes" active={isActive('/reportes')}>Reportes</NavLink>
            </>
          )}
          {!esMedico && (
            <NavLink to="/mi-historial" active={isActive('/mi-historial')}>Mi Historial</NavLink>
          )}

          {/* Notificaciones */}
          <Link to="/notificaciones" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: isActive('/notificaciones') ? '#fff' : 'rgba(255,255,255,0.85)',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 500,
            padding: '6px 10px',
            borderRadius: 6,
            background: isActive('/notificaciones') ? 'rgba(255,255,255,0.15)' : 'transparent',
            transition: 'all 0.2s ease',
            position: 'relative',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            Avisos
            {noLeidas > 0 && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#c8945a',
                color: '#fff',
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 700,
                minWidth: 18,
                height: 18,
                padding: '0 5px',
                marginLeft: 2,
              }}>
                {noLeidas > 9 ? '9+' : noLeidas}
              </span>
            )}
          </Link>

          {/* Separador */}
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)', margin: '0 6px' }} />

          {/* Rol */}
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.6)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            {esMedico ? 'Médico' : 'Paciente'}
          </span>

          {/* Salir */}
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.10)',
              color: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 6,
              padding: '6px 14px',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              marginLeft: 8,
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      style={{
        color: active ? '#fff' : 'rgba(255,255,255,0.82)',
        textDecoration: 'none',
        fontSize: 14,
        fontWeight: active ? 600 : 500,
        padding: '6px 10px',
        borderRadius: 6,
        background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </Link>
  );
}
