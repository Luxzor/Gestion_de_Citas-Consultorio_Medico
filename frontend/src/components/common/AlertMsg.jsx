export default function AlertMsg({ tipo, mensaje }) {
  if (!mensaje) return null;

  const TIPOS = {
    exito: { cls: 'alert-success', icon: 'check' },
    error: { cls: 'alert-error',   icon: 'x'     },
    info:  { cls: 'alert-info',    icon: 'info'  },
  };

  const cfg = TIPOS[tipo] || TIPOS.info;

  return (
    <div className={`alert ${cfg.cls}`}>
      <AlertIcon name={cfg.icon} />
      <span>{mensaje}</span>
    </div>
  );
}

function AlertIcon({ name }) {
  const p = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', style: { flexShrink: 0, marginTop: 1 } };
  if (name === 'check') return <svg {...p}><polyline points="20 6 9 17 4 12"/></svg>;
  if (name === 'x')     return <svg {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
  return <svg {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
}
