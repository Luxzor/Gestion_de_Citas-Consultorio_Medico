/** Componente de alerta para mensajes de exito o error. */
export default function AlertMsg({ tipo, mensaje }) {
  if (!mensaje) return null;
  const colores = {
    exito: { background: '#f0fdf4', border: '1px solid #86efac', color: '#15803d' },
    error: { background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626' },
    info:  { background: '#eff6ff', border: '1px solid #93c5fd', color: '#1d4ed8' },
  };
  return (
    <div style={{ ...colores[tipo], padding: '10px 14px', borderRadius: 6, fontSize: 14, marginBottom: 16 }}>
      {mensaje}
    </div>
  );
}
