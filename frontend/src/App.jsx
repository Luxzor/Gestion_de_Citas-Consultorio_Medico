/**
 * Componente raiz de la aplicacion React.
 * Define el enrutamiento y aplica la proteccion de rutas por autenticacion y rol.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';

// Paginas de autenticacion
import Login    from './components/auth/Login';
import Registro from './components/auth/Registro';
import Dashboard from './components/auth/Dashboard';

// Modulo de pacientes
import ListaPacientes  from './components/pacientes/ListaPacientes';
import DetallePaciente from './components/pacientes/DetallePaciente';

// Modulo de citas
import ListaCitas from './components/citas/ListaCitas';
import NuevaCita  from './components/citas/NuevaCita';

// Modulo de consultas (historia clinica)
import FormConsulta    from './components/consultas/FormConsulta';
import HistorialClinico from './components/consultas/HistorialClinico';

// Modulo de reportes
import Reportes from './components/reportes/Reportes';

// Notificaciones
import Notificaciones from './components/notificaciones/Notificaciones';

/** Envuelve una pagina con la barra de navegacion. */
function ConNav({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 56px)' }}>
        {children}
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas publicas */}
          <Route path="/login"    element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/"         element={<Navigate to="/dashboard" replace />} />

          {/* Rutas protegidas - cualquier usuario autenticado */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <ConNav><Dashboard /></ConNav>
            </ProtectedRoute>
          } />

          <Route path="/citas" element={
            <ProtectedRoute>
              <ConNav><ListaCitas /></ConNav>
            </ProtectedRoute>
          } />

          <Route path="/citas/nueva" element={
            <ProtectedRoute>
              <ConNav><NuevaCita /></ConNav>
            </ProtectedRoute>
          } />

          <Route path="/notificaciones" element={
            <ProtectedRoute>
              <ConNav><Notificaciones /></ConNav>
            </ProtectedRoute>
          } />

          {/* Historial del propio paciente */}
          <Route path="/mi-historial" element={
            <ProtectedRoute>
              <ConNav><HistorialClinico /></ConNav>
            </ProtectedRoute>
          } />

          {/* Rutas exclusivas del medico */}
          <Route path="/pacientes" element={
            <ProtectedRoute soloMedico>
              <ConNav><ListaPacientes /></ConNav>
            </ProtectedRoute>
          } />

          <Route path="/pacientes/:id" element={
            <ProtectedRoute>
              <ConNav><DetallePaciente /></ConNav>
            </ProtectedRoute>
          } />

          <Route path="/pacientes/:id/editar" element={
            <ProtectedRoute>
              <ConNav><DetallePaciente /></ConNav>
            </ProtectedRoute>
          } />

          <Route path="/consultas/nueva/:idCita" element={
            <ProtectedRoute soloMedico>
              <ConNav><FormConsulta /></ConNav>
            </ProtectedRoute>
          } />

          <Route path="/reportes" element={
            <ProtectedRoute soloMedico>
              <ConNav><Reportes /></ConNav>
            </ProtectedRoute>
          } />

          <Route path="/reportes/historial/:idPaciente" element={
            <ProtectedRoute>
              <ConNav><HistorialClinico /></ConNav>
            </ProtectedRoute>
          } />

          {/* Ruta no encontrada */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
