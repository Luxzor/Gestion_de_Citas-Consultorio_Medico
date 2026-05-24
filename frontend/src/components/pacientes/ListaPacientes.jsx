/**
 * Lista paginada de pacientes con busqueda por nombre o correo.
 * Solo accesible por el medico (rol medico).
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pacienteApi } from '../../api/pacienteApi';
import Spinner from '../common/Spinner';
import AlertMsg from '../common/AlertMsg';
import { css, colors } from '../../utils/styles';

export default function ListaPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [filtro,    setFiltro]    = useState('');
  const [cargando,  setCargando]  = useState(true);
  const [mensaje,   setMensaje]   = useState({ tipo: '', texto: '' });

  useEffect(() => {
    pacienteApi.listar()
      .then(({ data }) => setPacientes(data))
      .catch(() => setMensaje({ tipo: 'error', texto: 'Error al cargar pacientes.' }))
      .finally(() => setCargando(false));
  }, []);

  const eliminar = async (id, nombre) => {
    if (!window.confirm(`Desea eliminar al paciente ${nombre}?`)) return;
    try {
      await pacienteApi.eliminar(id);
      setPacientes(p => p.filter(x => x.idPaciente !== id));
      setMensaje({ tipo: 'exito', texto: 'Paciente eliminado correctamente.' });
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al eliminar el paciente.' });
    }
  };

  const filtrados = pacientes.filter(p =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    p.correo.toLowerCase().includes(filtro.toLowerCase())
  );

  if (cargando) return <Spinner />;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Pacientes</h2>
      </div>
      <AlertMsg tipo={mensaje.tipo} mensaje={mensaje.texto} />
      <div style={{ marginBottom: 16 }}>
        <input style={{ ...css.input, width: 280 }} placeholder="Buscar por nombre o correo..."
          value={filtro} onChange={e => setFiltro(e.target.value)} />
      </div>
      <div style={{ ...css.card, padding: 0, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Nombre','Correo','Telefono','Edad','Sexo','Acciones'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: colors.textLight, borderBottom: `1px solid ${colors.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: colors.textLight }}>No se encontraron pacientes.</td></tr>
            ) : filtrados.map(p => (
              <tr key={p.idPaciente} style={{ borderBottom: `1px solid ${colors.border}` }}>
                <td style={{ padding: '12px 16px', fontSize: 14 }}>{p.nombre}</td>
                <td style={{ padding: '12px 16px', fontSize: 14 }}>{p.correo}</td>
                <td style={{ padding: '12px 16px', fontSize: 14 }}>{p.telefono}</td>
                <td style={{ padding: '12px 16px', fontSize: 14 }}>{p.edad}</td>
                <td style={{ padding: '12px 16px', fontSize: 14 }}>{p.sexo}</td>
                <td style={{ padding: '12px 16px' }}>
                  <Link to={`/pacientes/${p.idPaciente}`} style={{ color: colors.primary, fontSize: 13, marginRight: 12 }}>Ver</Link>
                  <Link to={`/pacientes/${p.idPaciente}/editar`} style={{ color: colors.secondary, fontSize: 13, marginRight: 12 }}>Editar</Link>
                  <button onClick={() => eliminar(p.idPaciente, p.nombre)}
                    style={{ background: 'none', border: 'none', color: colors.danger, fontSize: 13, cursor: 'pointer' }}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
