import React from 'react';

/**
 * Insignia visual accesible para los estados de cobro y depósito de garantía (CU-27 / CU-12 / CU-14).
 * Estados de cobro admitidos: 'Saldo pendiente' (ámbar con icono), 'Pagada completa' (verde con icono), 'Reembolsado' (gris con icono).
 */
export default function InsigniaEstadoPago({
  estado,
  estadoCobro,
  saldoPendiente = null,
  monto = '50.00',
  compacto = false
}) {
  const valor = (estadoCobro || estado || '').toLowerCase().trim();

  // 1. Pagada completa (Verde existente del proyecto con icono ✓)
  if (valor === 'pagada completa' || valor === 'pagada_completa') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          backgroundColor: '#DEF7EC',
          color: '#03543F',
          padding: compacto ? '2px 8px' : '4px 10px',
          borderRadius: '12px',
          fontWeight: 700,
          fontSize: compacto ? '0.75rem' : '0.82rem',
          lineHeight: 1.2,
          border: '1px solid #BCF0DA',
        }}
        title="Consulta médica pagada en su totalidad"
      >
        <span>✓</span>
        <span>Pagada completa</span>
      </span>
    );
  }

  // 2. Saldo pendiente (Ámbar existente del proyecto con icono ⏳)
  if (valor === 'saldo pendiente' || valor === 'saldo_pendiente') {
    const textoSaldo = saldoPendiente && !compacto ? ` (${Number(saldoPendiente).toFixed(2)} Bs)` : '';
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          backgroundColor: '#FFF7DF',
          color: '#9C6E00',
          padding: compacto ? '2px 8px' : '4px 10px',
          borderRadius: '12px',
          fontWeight: 700,
          fontSize: compacto ? '0.75rem' : '0.82rem',
          lineHeight: 1.2,
          border: '1px solid #FDE68A',
        }}
        title="Saldo pendiente de cobro en recepción"
      >
        <span>⏳</span>
        <span>Saldo pendiente{textoSaldo}</span>
      </span>
    );
  }

  // 3. Reembolsado (Gris existente con icono ↩)
  if (valor === 'reembolsado') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          backgroundColor: '#EFF2F4',
          color: '#5B7078',
          padding: compacto ? '2px 8px' : '4px 10px',
          borderRadius: '12px',
          fontWeight: 700,
          fontSize: compacto ? '0.75rem' : '0.82rem',
          lineHeight: 1.2,
          border: '1px solid #CBD5E1',
        }}
        title="Pago devuelto íntegramente"
      >
        <span>↩</span>
        <span>Reembolsado</span>
      </span>
    );
  }

  // 4. Retenido (Rojo)
  if (valor === 'retenido') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          backgroundColor: '#FDE8E8',
          color: '#9B1C1C',
          padding: compacto ? '2px 8px' : '4px 10px',
          borderRadius: '12px',
          fontWeight: 700,
          fontSize: compacto ? '0.75rem' : '0.82rem',
          lineHeight: 1.2,
          border: '1px solid #F8B4B4',
        }}
        title="Retenido por inasistencia o cancelación tardía"
      >
        <span>✕</span>
        <span>Retenido</span>
      </span>
    );
  }

  // 5. Completado tradicional (Garantía pagada)
  if (valor === 'completado') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          backgroundColor: '#DEF7EC',
          color: '#03543F',
          padding: compacto ? '2px 8px' : '4px 10px',
          borderRadius: '12px',
          fontWeight: 700,
          fontSize: compacto ? '0.75rem' : '0.82rem',
          lineHeight: 1.2,
          border: '1px solid #BCF0DA',
        }}
        title="Garantía de reserva pagada y confirmada"
      >
        <span>✓</span>
        <span>{compacto ? `${monto} Bs` : `Depósito ${monto} Bs`}</span>
      </span>
    );
  }

  return (
    <span style={{ color: '#94A3B8', fontSize: '0.82rem' }}>
      —
    </span>
  );
}
