/**
 * Ruta protegida que redirige al login si el usuario no esta autenticado.
 * Puede restringirse a un rol especifico (medico o paciente).
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, soloMedico = false }) {
  const { usuario, esMedico } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (soloMedico && !esMedico) return <Navigate to="/dashboard" replace />;
  return children;
}
