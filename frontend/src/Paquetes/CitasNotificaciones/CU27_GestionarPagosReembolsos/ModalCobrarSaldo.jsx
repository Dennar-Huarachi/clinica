import React, { useState, useEffect } from 'react';
import api from '../../../compartido/utilidades/api';
import { MONTO_GARANTIA_RESERVA } from '../../../compartido/utilidades/constantesFinancieras';
import CampoTexto from '../../../compartido/componentes/CampoTexto';
import Alerta from '../../../compartido/componentes/Alerta';
import qrImagen from '../../../assets/qr_pago_reserva.svg';

/**
 * ModalCobrarSaldo (CU-27 / CU-12 / CU-14)
 * Ventana emergente (pantalla completa en celular) para cobrar el saldo pendiente de consulta en recepción.
 * Métodos: Efectivo (con cálculo de cambio en vivo), Tarjeta y Simple QR.
 */
export default function ModalCobrarSaldo({
  abierto,
  onCerrar,
  cita,
  onCobroExitoso,
}) {
  const [metodo, setMetodo] = useState('efectivo'); // 'efectivo' | 'tarjeta_debito_credito' | 'qr_transferencia'
  const [montoRecibido, setMontoRecibido] = useState('');
  const [tarjetaNumero, setTarjetaNumero] = useState('4500 1234 5678 9010');
  const [tarjetaVence, setTarjetaVence] = useState('12/28');
  const [tarjetaCvv, setTarjetaCvv] = useState('789');

  const [procesando, setProcesando] = useState(false);
  const [errorLocal, setErrorLocal] = useState(null);

  // Desglose financiero de la consulta médica
  const precioConsulta = cita
    ? Number(cita.precioConsulta ?? cita.precio_consulta ?? 100)
    : 100;
  const garantiaPagada = cita
    ? Number(cita.montoPagado ?? cita.monto_pagado ?? cita.pago_monto ?? MONTO_GARANTIA_RESERVA)
    : MONTO_GARANTIA_RESERVA;
  const saldoACobrar = cita
    ? Number(cita.saldoPendiente ?? cita.saldo_pendiente ?? Math.max(0, precioConsulta - garantiaPagada))
    : Math.max(0, precioConsulta - MONTO_GARANTIA_RESERVA);

  useEffect(() => {
    if (abierto && cita) {
      setMetodo('efectivo');
      setMontoRecibido(saldoACobrar.toFixed(2));
      setErrorLocal(null);
    }
  }, [abierto, cita, saldoACobrar]);

  if (!abierto || !cita) return null;

  // Cálculo del cambio en efectivo en vivo
  const numRecibido = parseFloat(montoRecibido) || 0;
  const cambio = Math.max(0, numRecibido - saldoACobrar);
  const montoInsuficiente = metodo === 'efectivo' && numRecibido < saldoACobrar;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLocal(null);

    if (metodo === 'efectivo') {
      if (montoInsuficiente) {
        setErrorLocal(`El monto recibido (${numRecibido.toFixed(2)} Bs) es menor al saldo pendiente (${saldoACobrar.toFixed(2)} Bs).`);
        return;
      }
    }

    setProcesando(true);

    const payload = {
      id_cita: cita.id_cita,
      metodo_pago: metodo,
      monto_recibido: metodo === 'efectivo' ? numRecibido : saldoACobrar,
      detalles_pasarela: {
        origen: 'recepcion_clinica',
        metodo: metodo,
        banco: metodo === 'qr_transferencia' ? 'Simple QR Interoperable' : (metodo === 'tarjeta_debito_credito' ? 'Terminal POS Recepción' : 'Caja Recepción'),
        monto_bs: saldoACobrar,
        monto_recibido: metodo === 'efectivo' ? numRecibido : saldoACobrar,
        cambio: metodo === 'efectivo' ? cambio : 0,
      },
    };

    try {
      // Intento contra el endpoint de cobro de saldo
      const res = await api.post(`/pagos/${cita.id_cita}/saldo`, payload);
      const datos = res.data?.datos || {};

      onCobroExitoso(datos);
      onCerrar();
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'No se pudo registrar el cobro del saldo.';
      setErrorLocal(msg);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div
        className="modal-contenedor tarjeta"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-cobro"
        style={{
          maxWidth: '540px',
          padding: '1.75rem',
          boxSizing: 'border-box',
        }}
      >
        {/* Cabecera del Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h2 id="titulo-modal-cobro" className="titulo" style={{ fontSize: '1.35rem', margin: '0 0 0.25rem 0' }}>
              <b>Cobrar Saldo</b> <span>de Consulta Médica</span>
            </h2>
            <p style={{ color: 'var(--texto-sec)', fontSize: '0.85rem', margin: 0 }}>
              Recepción y ventanilla: cobro del saldo pendiente antes de la atención.
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            disabled={procesando}
            aria-label="Cerrar modal"
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.25rem',
              color: '#64748B',
              cursor: 'pointer',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        <Alerta tipo={errorLocal ? 'error' : null} mensaje={errorLocal} />

        {/* Tarjeta de Información de la Cita */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            marginBottom: '1rem',
            fontSize: '0.86rem',
            lineHeight: 1.45,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ color: '#64748B' }}>Código de Cita:</span>
            <span className="badge-codigo-turquesa" style={{ fontFamily: 'monospace', fontWeight: 700 }}>
              {cita.codigo_cita}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ color: '#64748B' }}>Paciente:</span>
            <strong>{cita.paciente_apellidos || cita.paciente}, {cita.paciente_nombres || ''}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ color: '#64748B' }}>Especialidad:</span>
            <span>{cita.especialidad_nombre || 'Consulta Médica'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748B' }}>Médico Asignado:</span>
            <span>Dr(a). {cita.medico_apellidos || cita.medico}</span>
          </div>
        </div>

        {/* Desglose Financiero: Precio / Garantía / Saldo */}
        <div
          style={{
            backgroundColor: '#F0FDFA',
            border: '1px solid #99F6E4',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#0F766E', textTransform: 'uppercase', fontWeight: 600 }}>
              Precio Total
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#134E4A', marginTop: '2px' }}>
              {precioConsulta.toFixed(2)} Bs
            </div>
          </div>
          <div style={{ borderLeft: '1px solid #CCFBF1', borderRight: '1px solid #CCFBF1' }}>
            <div style={{ fontSize: '0.75rem', color: '#0F766E', textTransform: 'uppercase', fontWeight: 600 }}>
              Garantía Pagada
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#03543F', marginTop: '2px' }}>
              {garantiaPagada.toFixed(2)} Bs
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#B45309', textTransform: 'uppercase', fontWeight: 700 }}>
              Saldo a Cobrar
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--naranja-oscuro)', marginTop: '2px' }}>
              {saldoACobrar.toFixed(2)} Bs
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Selector de Método con Tres Botones Grandes (min-height >= 44px) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
              Método de Cobro:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setMetodo('efectivo')}
                disabled={procesando}
                style={{
                  minHeight: '46px',
                  padding: '0.5rem 0.25rem',
                  borderRadius: '8px',
                  border: metodo === 'efectivo' ? '2px solid #0A6C84' : '1px solid #CBD5E1',
                  backgroundColor: metodo === 'efectivo' ? '#F0FDFA' : '#FFFFFF',
                  color: metodo === 'efectivo' ? '#0A6C84' : '#64748B',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                💵 Efectivo
              </button>

              <button
                type="button"
                onClick={() => setMetodo('tarjeta_debito_credito')}
                disabled={procesando}
                style={{
                  minHeight: '46px',
                  padding: '0.5rem 0.25rem',
                  borderRadius: '8px',
                  border: metodo === 'tarjeta_debito_credito' ? '2px solid #0A6C84' : '1px solid #CBD5E1',
                  backgroundColor: metodo === 'tarjeta_debito_credito' ? '#F0FDFA' : '#FFFFFF',
                  color: metodo === 'tarjeta_debito_credito' ? '#0A6C84' : '#64748B',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                💳 Tarjeta
              </button>

              <button
                type="button"
                onClick={() => setMetodo('qr_transferencia')}
                disabled={procesando}
                style={{
                  minHeight: '46px',
                  padding: '0.5rem 0.25rem',
                  borderRadius: '8px',
                  border: metodo === 'qr_transferencia' ? '2px solid #0A6C84' : '1px solid #CBD5E1',
                  backgroundColor: metodo === 'qr_transferencia' ? '#F0FDFA' : '#FFFFFF',
                  color: metodo === 'qr_transferencia' ? '#0A6C84' : '#64748B',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                📱 Simple QR
              </button>
            </div>
          </div>

          {/* Opción 1: Cobro en Efectivo con Cálculo de Cambio en Vivo */}
          {metodo === 'efectivo' && (
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <CampoTexto
                etiqueta="Monto Recibido del Paciente (Bs)"
                nombre="monto_recibido"
                tipo="number"
                step="0.10"
                min={saldoACobrar}
                valor={montoRecibido}
                alCambiar={(e) => setMontoRecibido(e.target.value)}
                error={montoInsuficiente ? `El monto no puede ser menor al saldo (${saldoACobrar.toFixed(2)} Bs).` : null}
                placeholder={saldoACobrar.toFixed(2)}
                requerido
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '0.5rem',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: montoInsuficiente ? '#FEF2F2' : '#ECFDF5',
                  border: montoInsuficiente ? '1px solid #FECACA' : '1px solid #A7F3D0',
                  borderRadius: '6px',
                }}
              >
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: montoInsuficiente ? '#991B1B' : '#065F46' }}>
                  Cambio a Devolver:
                </span>
                <strong style={{ fontSize: '1.15rem', color: montoInsuficiente ? '#991B1B' : '#047857' }}>
                  {montoInsuficiente ? '0.00 Bs' : `${cambio.toFixed(2)} Bs`}
                </strong>
              </div>
            </div>
          )}

          {/* Opción 2: Tarjeta (Reutiliza el diseño del flujo de garantía) */}
          {metodo === 'tarjeta_debito_credito' && (
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', fontWeight: 600, marginBottom: '0.2rem' }}>
                  Número de Tarjeta
                </label>
                <input
                  type="text"
                  value={tarjetaNumero}
                  onChange={(e) => setTarjetaNumero(e.target.value)}
                  style={{ width: '100%', minHeight: '42px', padding: '0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem', boxSizing: 'border-box' }}
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
                    style={{ width: '100%', minHeight: '42px', padding: '0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', fontWeight: 600, marginBottom: '0.2rem' }}>
                    CVV
                  </label>
                  <input
                    type="text"
                    value={tarjetaCvv}
                    onChange={(e) => setTarjetaCvv(e.target.value)}
                    style={{ width: '100%', minHeight: '42px', padding: '0.6rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Opción 3: QR (Reutiliza el diseño del flujo de garantía) */}
          {metodo === 'qr_transferencia' && (
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
              <div
                style={{
                  display: 'inline-block',
                  padding: '8px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 12px rgba(10, 108, 132, 0.08)',
                  margin: '0 auto',
                }}
              >
                <img
                  src={qrImagen}
                  alt="Simple QR - Clínica Vida Salud"
                  style={{
                    width: '140px',
                    height: '140px',
                    display: 'block',
                    margin: '0 auto',
                    borderRadius: '4px',
                  }}
                />
              </div>
              <p style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 500, marginTop: '0.5rem', marginBottom: 0 }}>
                El paciente puede escanear este código Simple QR desde su banca móvil para transferir los <b>{saldoACobrar.toFixed(2)} Bs</b>.
              </p>
            </div>
          )}

          {/* Botonera de Acción: Naranja SOLO para la acción principal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <button
              type="submit"
              disabled={procesando || (metodo === 'efectivo' && montoInsuficiente)}
              className="boton-primario"
              style={{
                minHeight: '46px',
                width: '100%',
                fontSize: '0.95rem',
                fontWeight: 700,
                backgroundColor: 'var(--naranja)',
                borderColor: 'var(--naranja-oscuro)',
              }}
            >
              {procesando
                ? 'Registrando Cobro…'
                : `✓ Confirmar Cobro de Saldo (${saldoACobrar.toFixed(2)} Bs)`}
            </button>
            <button
              type="button"
              onClick={onCerrar}
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

