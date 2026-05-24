export default function Spinner({ size = 36, minHeight = 200 }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight,
      gap: 14,
    }}>
      <div style={{
        width: size,
        height: size,
        border: `3px solid #e3eeeb`,
        borderTopColor: '#15423a',
        borderRadius: '50%',
        animation: 'spin 0.75s linear infinite',
      }} />
      <span style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: 13,
        color: '#4d7a6e',
        letterSpacing: '0.02em',
      }}>
        Cargando...
      </span>
    </div>
  );
}
