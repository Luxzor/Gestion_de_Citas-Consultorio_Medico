/**
 * Barra de navegacion principal.
 * Muestra opciones diferenciadas segun el rol del usuario.
 * Incluye el indicador de notificaciones no leidas.
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificacionApi } from '../../api/notificacionApi';
import { colors } from '../../utils/styles';

export default function Navbar() {
  const { usuario, logout, esMedico } = useAuth();
  const navigate = useNavigate();
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

  const nav = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 24px', height: 56, background: colors.primary, color: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
  };
  const linkStyle = { color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 500, marginLeft: 20 };
  const badge = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: '#ef4444', color: '#fff', borderRadius: 999, fontSize: 11,
    fontWeight: 700, width: 18, height: 18, marginLeft: 4,
  };

  return (
    <nav style={nav}>
      <span style={{ fontWeight: 700, fontSize: 16 }}>Consultorio Medico</span>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/dashboard" style={linkStyle}>Inicio</Link>
        <Link to="/citas" style={linkStyle}>Citas</Link>
        {esMedico && (
          <>
            <Link to="/pacientes" style={linkStyle}>Pacientes</Link>
            <Link to="/reportes" style={linkStyle}>Reportes</Link>
          </>
        )}
        {!esMedico && (
          <Link to="/mi-historial" style={linkStyle}>Mi Historial</Link>
        )}
        <Link to="/notificaciones" style={linkStyle}>
          Avisos {noLeidas > 0 && <span style={badge}>{noLeidas}</span>}
        </Link>
        <button onClick={handleLogout}
          style={{ ...linkStyle, background: 'none', border: 'none', cursor: 'pointer' }}>
          Salir
        </button>
      </div>
    </nav>
  );
}
