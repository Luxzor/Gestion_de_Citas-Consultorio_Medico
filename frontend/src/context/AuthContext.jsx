/**
 * Contexto de autenticacion global.
 * Almacena el token JWT en sessionStorage (nunca en localStorage)
 * para que se invalide al cerrar el navegador.
 */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { pacienteApi } from '../api/pacienteApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const token = sessionStorage.getItem('token');
    if (!token) return null;
    const idPacienteRaw = sessionStorage.getItem('idPaciente');
    return {
      token,
      rol:        sessionStorage.getItem('rol'),
      idUsuario:  Number(sessionStorage.getItem('idUsuario')),
      idPaciente: idPacienteRaw ? Number(idPacienteRaw) : null,
    };
  });

  // Si la sesion esta activa pero falta idPaciente (sesion antigua), lo carga del backend
  useEffect(() => {
    if (usuario && usuario.rol === 'paciente' && !usuario.idPaciente) {
      pacienteApi.obtenerMe()
        .then(({ data }) => {
          sessionStorage.setItem('idPaciente', data.idPaciente);
          setUsuario(u => ({ ...u, idPaciente: data.idPaciente }));
        })
        .catch(() => {});
    }
  }, []);

  const login = useCallback(async (nombreUsuario, contrasena) => {
    const { data } = await authApi.login({ nombreUsuario, contrasena });
    sessionStorage.setItem('token',     data.token);
    sessionStorage.setItem('rol',       data.rol);
    sessionStorage.setItem('idUsuario', data.idUsuario);
    if (data.idPaciente != null) sessionStorage.setItem('idPaciente', data.idPaciente);
    setUsuario({ token: data.token, rol: data.rol, idUsuario: data.idUsuario, idPaciente: data.idPaciente ?? null });
    return data;
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch (_) {}
    sessionStorage.clear();
    setUsuario(null);
  }, []);

  const esMedico  = usuario?.rol === 'medico';
  const esPaciente = usuario?.rol === 'paciente';

  return (
    <AuthContext.Provider value={{ usuario, login, logout, esMedico, esPaciente }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
