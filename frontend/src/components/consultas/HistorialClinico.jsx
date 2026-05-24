/**
 * Vista del historial clinico de un paciente.
 * Muestra encabezado con datos del paciente y lista cronologica de consultas.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reporteApi } from '../../api/reporteApi';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';
import AlertMsg from '../common/AlertMsg';
import { css, colors } from '../../utils/styles';

export default function HistorialClinico() {
  const { idPaciente } = useParams();
  const { usuario, esMedico } = useAuth();
  const navigate = useNavigate();
  const [historial, setHistorial] = useState(null);
  const [cargando,  setCargando]  = useState(true);
  const [error,     setError]     = useState('');

  // Si es paciente, usa su propio id
  const idTarget = idPaciente || 'mi';

  useEffect(() => {
    const url = esMedico ? idPaciente : usuario.idUsuario;
    reporteApi.historial(url)
      .then(({ data }) => setHistorial(data))
      .catch(() => setError('No se pudo cargar el historial clinico.'))
      .finally(() => setCargando(false));
  }, [idPaciente, esMedico, usuario]);

  if (cargando) return <Spinner />;
  if (error) return <div style={{ padding: 24 }}><AlertMsg tipo="error" mensaje={error} /></div>;
  if (!historial) return null;

  const { paciente, consultas } = historial;

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <button onClick={() => navigate(-1)} style={{ ...css.btnSecondary, marginBottom: 20 }}>Volver</button>
      <h2 style={{ marginBottom: 16 }}>Historial Clinico</h2>

      {/* Encabezado con datos del paciente */}
      <div style={{ ...css.card, marginBottom: 20, background: '#eff6ff' }}>
        <h3 style={{ margin: '0 0 12px', color: colors.primary }}>Datos del Paciente</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            ['Nombre', paciente.nombre],
            ['Correo', paciente.correo],
            ['Telefono', paciente.telefono],
            ['Edad', paciente.edad + ' anos'],
            ['Sexo', paciente.sexo],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 11, color: colors.textLight, fontWeight: 600 }}>{k}</div>
              <div style={{ fontSize: 14 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de consultas */}
      <h3 style={{ marginBottom: 12 }}>Consultas ({consultas.length})</h3>
      {consultas.length === 0 ? (
        <div style={{ ...css.card, textAlign: 'center', color: colors.textLight }}>
          No hay consultas registradas.
        </div>
      ) : consultas.map((c, i) => (
        <details key={c.idConsulta} style={{ ...css.card, marginBottom: 12 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 15 }}>
            Consulta del {c.fechaConsulta}
          </summary>
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              ['Temperatura','temperatura'],['Peso','peso'],['Altura','altura'],['Presion arterial','presion']
            ].map(([l,k]) => (
              <div key={k}>
                <div style={{ fontSize: 12, color: colors.textLight, fontWeight: 600 }}>{l}</div>
                <div style={{ fontSize: 14, marginTop: 2 }}>{c[k]}</div>
              </div>
            ))}
            {[
              ['Relatoria de la consulta','relatoria'],
              ['Diagnostico','diagnostico'],
              ['Prescripcion','prescripcion'],
              c.resultados && ['Resultados de analisis','resultados'],
            ].filter(Boolean).map(([l,k]) => (
              <div key={k} style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: 12, color: colors.textLight, fontWeight: 600, marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', background: '#f8fafc', padding: '8px 12px', borderRadius: 4 }}>{c[k]}</div>
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
