/** Indicador de carga animado. */
export default function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{
        width: 36, height: 36, border: '4px solid #e2e8f0',
        borderTop: '4px solid #2563eb', borderRadius: '50%',
        animation: 'girar 0.8s linear infinite',
      }} />
      <style>{`@keyframes girar { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
