/**
 * Variables de estilo compartidas para mantener consistencia visual.
 * Paleta institucional neutra, sin colores estridentes.
 */
export const colors = {
  primary:    '#2563eb',
  primaryDark:'#1d4ed8',
  secondary:  '#64748b',
  success:    '#16a34a',
  danger:     '#dc2626',
  warning:    '#d97706',
  background: '#f8fafc',
  surface:    '#ffffff',
  border:     '#e2e8f0',
  text:       '#1e293b',
  textLight:  '#64748b',
};

export const css = {
  card: {
    background: colors.surface,
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
  },
  btnPrimary: {
    background: colors.primary,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  },
  btnDanger: {
    background: colors.danger,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  },
  btnSecondary: {
    background: '#f1f5f9',
    color: colors.text,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: 13,
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: colors.textLight,
    marginBottom: 4,
  },
};
