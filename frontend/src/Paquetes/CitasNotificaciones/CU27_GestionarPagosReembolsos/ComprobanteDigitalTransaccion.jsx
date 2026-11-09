import React from 'react';

/**
 * Comprobante digital accesible e inmutable de transacción de pago de garantía (CU-27 / D17).
 */
export default function ComprobanteDigitalTransaccion({
  comprobante: comprobanteProp,
  datosComprobante,
  alCerrar: alCerrarProp,
  onCerrar,
  alIrAHistorial,
}) {
  const comprobante = comprobanteProp || datosComprobante;
  const alCerrar = alCerrarProp || onCerrar;

  if (!comprobante) return null;

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1200,
        padding: '1rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="modal-contenido tarjeta"
        style={{
          maxWidth: '500px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '1.75rem',
          textAlign: 'center',
          boxShadow: '0 25px 30px -5px rgba(0, 0, 0, 0.25)',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#DEF7EC',
            color: '#03543F',
            fontSize: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
          }}
        >
          ✓
        </div>

        <h3 style={{ margin: '0 0 0.25rem 0', color: '#0A6C84', fontSize: '1.35rem' }}>
          {comprobante.titulo || (comprobante.saldo_cobrado ? '¡Pago de Saldo Confirmado!' : '¡Cita y Depósito Confirmados!')}
        </h3>
        <p style={{ color: '#64748B', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
          {comprobante.subtitulo || (comprobante.saldo_cobrado ? 'El saldo de la consulta médica ha sido cobrado exitosamente en recepción.' : 'Su turno médico ha sido garantizado con el pago del depósito oficial.')}
        </p>

        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'left',
            marginBottom: '1.5rem',
            fontSize: '0.88rem',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.25rem' }}>
            <span style={{ color: '#64748B' }}>Código de Cita:</span>
            <span style={{ fontWeight: 800, color: '#0A6C84', fontFamily: 'monospace' }}>
              {comprobante.codigo_cita}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.25rem' }}>
            <span style={{ color: '#64748B' }}>Nro. de Transacción:</span>
            <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#334155' }}>
              {comprobante.nro_transaccion}
            </span>
          </div>

          {comprobante.paciente && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.25rem' }}>
              <span style={{ color: '#64748B' }}>Paciente:</span>
              <span style={{ fontWeight: 600 }}>{comprobante.paciente}</span>
            </div>
          )}

          {comprobante.precio_consulta !== undefined && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.25rem' }}>
              <span style={{ color: '#64748B' }}>Costo Total Consulta:</span>
              <span style={{ fontWeight: 700, color: '#1E293B' }}>
                {Number(comprobante.precio_consulta).toFixed(2)} Bs
              </span>
            </div>
          )}

          {comprobante.saldo_cobrado !== undefined ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                <span style={{ color: '#64748B' }}>Garantía Pagada Previamente:</span>
                <span style={{ fontWeight: 600, color: '#03543F' }}>
                  {Number(comprobante.garantia_pagada || 50).toFixed(2)} Bs
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                <span style={{ color: '#64748B' }}>Saldo Cobrado en Recepción:</span>
                <span style={{ fontWeight: 800, color: '#03543F' }}>
                  {Number(comprobante.saldo_cobrado).toFixed(2)} Bs
                </span>
              </div>
              {comprobante.monto_recibido !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                  <span style={{ color: '#64748B' }}>Monto Recibido:</span>
                  <span style={{ fontWeight: 600 }}>
                    {Number(comprobante.monto_recibido).toFixed(2)} Bs
                  </span>
                </div>
              )}
              {comprobante.cambio !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                  <span style={{ color: '#64748B' }}>Cambio Devuelto:</span>
                  <span style={{ fontWeight: 700, color: '#0A6C84' }}>
                    {Number(comprobante.cambio).toFixed(2)} Bs
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                <span style={{ color: '#64748B' }}>Estado del Cobro:</span>
                <span style={{ fontWeight: 800, color: '#047857' }}>
                  ✓ PAGADA COMPLETA
                </span>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                <span style={{ color: '#64748B' }}>Garantía de Reserva Pagada:</span>
                <span style={{ fontWeight: 800, color: '#03543F' }}>
                  {comprobante.monto || '50.00'} Bs
                </span>
              </div>
              {comprobante.saldo_pendiente !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                  <span style={{ color: '#64748B' }}>Saldo Pendiente (en clínica):</span>
                  <span style={{ fontWeight: 700, color: '#B45309' }}>
                    {Number(comprobante.saldo_pendiente).toFixed(2)} Bs
                  </span>
                </div>
              )}
            </>
          )}

          {comprobante.fecha && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.25rem' }}>
              <span style={{ color: '#64748B' }}>Fecha y Turno:</span>
              <span style={{ fontWeight: 600 }}>{comprobante.fecha} a las {comprobante.hora}</span>
            </div>
          )}
          {comprobante.especialidad && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.25rem' }}>
              <span style={{ color: '#64748B' }}>Especialidad / Médico:</span>
              <span style={{ fontWeight: 600 }}>{comprobante.especialidad} {comprobante.medico ? `(${comprobante.medico})` : ''}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem' }}>
            <span style={{ color: '#64748B' }}>Método de Pago:</span>
            <span style={{ fontWeight: 600 }}>{comprobante.metodo_pago || 'Efectivo'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {alIrAHistorial && (
            <button
              type="button"
              onClick={alIrAHistorial}
              className="boton-primario"
              style={{ minHeight: '44px', width: '100%', fontWeight: 700 }}
            >
              Ir a Mis Citas y Seguimiento
            </button>
          )}
          <button
            type="button"
            onClick={alCerrar}
            className="boton-terciario"
            style={{ minHeight: '44px', width: '100%' }}
          >
            Aceptar y Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
