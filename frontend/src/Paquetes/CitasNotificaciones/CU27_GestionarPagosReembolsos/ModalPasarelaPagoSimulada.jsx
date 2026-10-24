import React, { useState } from 'react';

/**
 * Modal interactivo para pasarela de pago simulado de garantía de reserva (CU-27 / D17).
 * Soporta selección de Simple QR interoperable y Tarjeta Débito/Crédito simulada con diseño mobile-first y botones >= 44px.
 */
export default function ModalPasarelaPagoSimulada({
  abierto,
  alCerrar,
  alConfirmarPago,
  procesando = false,
  monto = 50.00,
  detalleTurno = null,
}) {
  const [metodoPago, setMetodoPago] = useState('qr'); // 'qr' | 'tarjeta'
  const [tarjetaNumero, setTarjetaNumero] = useState('4500 1234 5678 9010');
  const [tarjetaVence, setTarjetaVence] = useState('12/28');
  const [tarjetaCvv, setTarjetaCvv] = useState('789');

  if (!abierto) return null;

  const manejarConfirmacion = (e) => {
    e.preventDefault();
    const datos = {
      metodo_pago: metodoPago === 'qr' ? 'qr_transferencia' : 'tarjeta_debito_credito',
      referencia_simulada: metodoPago === 'qr' ? 'QR-BCP-SIMULADO' : `CARD-****-${tarjetaNumero.replace(/\s/g, '').slice(-4)}`,
      monto: Number(monto),
      detalles_pasarela: {
        origen: 'pasarela_simulada_web',
        metodo: metodoPago,
        banco: metodoPago === 'qr' ? 'Simple QR Interoperable' : 'Visa / MasterCard Simulada',
        monto_bs: Number(monto),
      },
    };
    alConfirmarPago(datos);
  };

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
        zIndex: 1100,
        padding: '1rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="modal-contenido tarjeta"
        style={{
          maxWidth: '480px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 25px 30px -5px rgba(0, 0, 0, 0.25)',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ margin: 0, color: '#1C2D37', fontSize: '1.25rem' }}>
            Garantía de Reserva
          </h3>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0A6C84', backgroundColor: '#E0F2FE', padding: '4px 8px', borderRadius: '6px' }}>
            {Number(monto).toFixed(2)} Bs
          </span>
        </div>

        <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: '1.45', marginBottom: '1rem' }}>
          Este monto asegura su turno médico. Es 100% reembolsable si cancela con al menos 12 horas de anticipación.
        </p>

        {detalleTurno && (
          <div
            style={{
              backgroundColor: '#F1F5F9',
              borderRadius: '8px',
              padding: '0.75rem',
              marginBottom: '1rem',
              fontSize: '0.84rem',
              color: '#334155',
            }}
          >
            {detalleTurno.fecha && (
              <div><b>Turno:</b> {detalleTurno.fecha} ({detalleTurno.hora_inicio || detalleTurno.hora})</div>
            )}
            {detalleTurno.especialidad && (
              <div><b>Especialidad:</b> {detalleTurno.especialidad}</div>
            )}
            {detalleTurno.medico && (
              <div><b>Médico:</b> Dr. {detalleTurno.medico}</div>
            )}
          </div>
        )}

        <form onSubmit={manejarConfirmacion}>
          {/* Selector de Método de Pago */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Seleccione Medio de Pago Simulado:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setMetodoPago('qr')}
                style={{
                  minHeight: '44px',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: metodoPago === 'qr' ? '2px solid #0A6C84' : '1px solid #CBD5E1',
                  backgroundColor: metodoPago === 'qr' ? '#F0FDFA' : '#FFFFFF',
                  color: metodoPago === 'qr' ? '#0A6C84' : '#64748B',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  boxSizing: 'border-box',
                }}
              >
                📱 Simple QR
              </button>
              <button
                type="button"
                onClick={() => setMetodoPago('tarjeta')}
                style={{
                  minHeight: '44px',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: metodoPago === 'tarjeta' ? '2px solid #0A6C84' : '1px solid #CBD5E1',
                  backgroundColor: metodoPago === 'tarjeta' ? '#F0FDFA' : '#FFFFFF',
                  color: metodoPago === 'tarjeta' ? '#0A6C84' : '#64748B',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  boxSizing: 'border-box',
                }}
              >
                💳 Tarjeta Débito/Crédito
              </button>
            </div>
          </div>

          {/* Visualización del Método de Pago */}
          {metodoPago === 'qr' ? (
            <div
              style={{
                textAlign: 'center',
                padding: '1rem',
                border: '1px dashed #CBD5E1',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                backgroundColor: '#FAFAFA',
              }}
            >
              <svg width="130" height="130" viewBox="0 0 100 100" style={{ margin: '0 auto', display: 'block' }}>
                <rect width="100" height="100" fill="#ffffff" />
                <rect x="10" y="10" width="25" height="25" fill="#0A6C84" />
                <rect x="15" y="15" width="15" height="15" fill="#ffffff" />
                <rect x="18" y="18" width="9" height="9" fill="#0A6C84" />
                <rect x="65" y="10" width="25" height="25" fill="#0A6C84" />
                <rect x="70" y="15" width="15" height="15" fill="#ffffff" />
                <rect x="73" y="18" width="9" height="9" fill="#0A6C84" />
                <rect x="10" y="65" width="25" height="25" fill="#0A6C84" />
                <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
                <rect x="18" y="73" width="9" height="9" fill="#0A6C84" />
                <rect x="42" y="12" width="6" height="6" fill="#0A6C84" />
                <rect x="52" y="18" width="6" height="6" fill="#0A6C84" />
                <rect x="45" y="45" width="10" height="10" fill="#F28C1E" />
                <rect x="62" y="55" width="8" height="8" fill="#0A6C84" />
                <rect x="75" y="75" width="15" height="15" fill="#0A6C84" />
                <rect x="42" y="75" width="8" height="8" fill="#0A6C84" />
              </svg>
              <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.5rem', marginBottom: 0 }}>
                Escanee el código QR interoperable desde su aplicación bancaria móvil.
              </p>
            </div>
          ) : (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', fontWeight: 600, marginBottom: '0.2rem' }}>
                  Número de Tarjeta Simulado
                </label>
                <input
                  type="text"
                  value={tarjetaNumero}
                  onChange={(e) => setTarjetaNumero(e.target.value)}
                  style={{ width: '100%', minHeight: '40px', padding: '0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', fontWeight: 600, marginBottom: '0.2rem' }}>
                    Vencimiento
                  </label>
                  <input
                    type="text"
                    value={tarjetaVence}
                    onChange={(e) => setTarjetaVence(e.target.value)}
                    style={{ width: '100%', minHeight: '40px', padding: '0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', fontWeight: 600, marginBottom: '0.2rem' }}>
                    CVV / CVC
                  </label>
                  <input
                    type="text"
                    value={tarjetaCvv}
                    onChange={(e) => setTarjetaCvv(e.target.value)}
                    style={{ width: '100%', minHeight: '40px', padding: '0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Botones táctiles >= 44px */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <button
              type="submit"
              disabled={procesando}
              className="boton-primario"
              style={{ minHeight: '46px', width: '100%', fontSize: '0.95rem', fontWeight: 700 }}
            >
              {procesando ? 'Validando Pasarela…' : `✓ Simular Pago Exitoso (${Number(monto).toFixed(2)} Bs)`}
            </button>
            <button
              type="button"
              onClick={alCerrar}
              disabled={procesando}
              className="boton-terciario"
              style={{ minHeight: '44px', width: '100%' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
