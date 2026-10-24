import React, { useState, useEffect } from 'react';
import api from '../../../compartido/utilidades/api';

/**
 * SelectorDisponibilidadTurnos (CU-10)
 * Componente modular y reutilizable para consultar y seleccionar turnos médicos disponibles.
 *
 * Props:
 * - idEspecialidad: ID de la especialidad seleccionada
 * - idMedico: ID del médico especialista seleccionado
 * - fecha: Fecha de consulta en formato YYYY-MM-DD
 * - onSeleccionarTurno: Callback invocado al hacer clic en un turno libre: (turno) => void
 * - turnoSeleccionado: Turno actualmente seleccionado { hora_inicio, hora_fin }
 */
export default function SelectorDisponibilidadTurnos({
  idEspecialidad,
  idMedico,
  fecha,
  onSeleccionarTurno,
  turnoSeleccionado = null,
}) {
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [motivoBloqueo, setMotivoBloqueo] = useState(null);
  const [errorServidor, setErrorServidor] = useState(null);

  useEffect(() => {
    if (!idMedico || !idEspecialidad || !fecha) {
      setTurnos([]);
      setMotivoBloqueo(null);
      setErrorServidor(null);
      return;
    }

    setCargando(true);
    setMotivoBloqueo(null);
    setErrorServidor(null);

    api.get(`/catalogos/disponibilidad?id_medico=${idMedico}&id_especialidad=${idEspecialidad}&fecha=${fecha}`)
      .then((res) => {
        const resultado = res.data?.datos || {};
        if (resultado.disponible) {
          setTurnos(resultado.turnos || []);
          setMotivoBloqueo(null);
        } else {
          setTurnos([]);
          setMotivoBloqueo(resultado.motivo_bloqueo || 'No hay turnos disponibles para la fecha indicada.');
        }
      })
      .catch((err) => {
        setTurnos([]);
        const msj = err.response?.data?.mensaje || 'Error al consultar disponibilidad de turnos.';
        setErrorServidor(msj);
      })
      .finally(() => {
        setCargando(false);
      });
  }, [idMedico, idEspecialidad, fecha]);

  return (
    <div className="selector-disponibilidad-contenedor" style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }}>
      <label
        className="etiqueta-campo"
        style={{
          display: 'block',
          marginBottom: '0.6rem',
          fontWeight: 700,
          color: '#0A6C84',
          fontSize: '0.9rem',
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
        }}
      >
        Turnos de Atención Disponibles:
      </label>

      {/* 1. Estado de Carga */}
      {cargando && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--turquesa)', padding: '0.75rem 0' }}>
          <span className="spinner-tabla" style={{ width: '16px', height: '16px' }} />
          <span style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>Calculando turnos disponibles en tiempo real…</span>
        </div>
      )}

      {/* 2. Error de Bloqueo institucional o médico (RN20, suspensiones) */}
      {!cargando && motivoBloqueo && (
        <div
          className="alerta-error"
          style={{
            margin: '0.5rem 0',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.88rem',
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#B91C1C',
          }}
        >
          {motivoBloqueo}
        </div>
      )}

      {/* 3. Error HTTP / Validación (RN06, RN18 o general) */}
      {!cargando && errorServidor && (
        <div
          className="alerta-error"
          style={{
            margin: '0.5rem 0',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.88rem',
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#B91C1C',
          }}
        >
          {errorServidor}
        </div>
      )}

      {/* 4. Sin turnos disponibles para ese día */}
      {!cargando && !motivoBloqueo && !errorServidor && turnos.length === 0 && idMedico && idEspecialidad && (
        <div
          style={{
            padding: '1rem',
            background: '#F8FAFC',
            border: '1px dashed #CBD5E1',
            borderRadius: '8px',
            textAlign: 'center',
            color: 'var(--texto-sec)',
            fontSize: '0.88rem',
          }}
        >
          No hay turnos disponibles para los criterios seleccionados. Intenta seleccionar otra fecha.
        </div>
      )}

      {/* 5. Cuadrícula de Turnos (6 columnas en Desktop, 3 columnas en Móvil <= 640px) */}
      {!cargando && !motivoBloqueo && !errorServidor && turnos.length > 0 && (
        <>
          <div className="cuadricula-turnos-cu10">
            {turnos.map((t) => {
              const seleccionado = turnoSeleccionado?.hora_inicio === t.hora_inicio;
              return (
                <button
                  key={t.hora_inicio}
                  type="button"
                  disabled={!t.disponible}
                  onClick={() => onSeleccionarTurno && onSeleccionarTurno(t)}
                  className={`slot-turno-cu10 ${t.disponible ? 'disponible' : 'ocupado'} ${seleccionado ? 'seleccionado' : ''}`}
                  title={t.disponible ? `Seleccionar turno ${t.hora_inicio} - ${t.hora_fin}` : 'Turno ocupado'}
                  aria-label={`Turno ${t.hora_inicio} a ${t.hora_fin}, ${t.disponible ? 'disponible' : 'ocupado'}`}
                >
                  <span className="slot-hora-inicio">{t.hora_inicio}</span>
                  <span className="slot-hora-fin">{t.hora_fin}</span>
                </button>
              );
            })}
          </div>

          {turnoSeleccionado && (
            <div
              style={{
                marginTop: '0.85rem',
                padding: '0.6rem 0.9rem',
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '6px',
                color: '#166534',
                fontSize: '0.9rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Turno seleccionado: <strong>{turnoSeleccionado.hora_inicio} - {turnoSeleccionado.hora_fin}</strong></span>
            </div>
          )}
        </>
      )}

      <style>{`
        .cuadricula-turnos-cu10 {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 0.65rem;
          margin-top: 0.75rem;
          width: 100%;
          box-sizing: border-box;
        }

        .slot-turno-cu10 {
          min-height: 44px;
          min-width: 44px;
          padding: 0.45rem 0.25rem;
          border: 1.5px solid #CFDEE3;
          border-radius: 8px;
          background: #FFFFFF;
          color: var(--texto);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s ease-in-out;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          box-sizing: border-box;
          user-select: none;
        }

        .slot-turno-cu10 .slot-hora-inicio {
          font-size: 0.92rem;
          line-height: 1.15;
          font-weight: 700;
        }

        .slot-turno-cu10 .slot-hora-fin {
          font-size: 0.72rem;
          opacity: 0.8;
          line-height: 1.1;
        }

        .slot-turno-cu10.disponible:hover {
          border-color: var(--naranja);
          background: #FFF8F2;
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(242, 140, 30, 0.18);
        }

        .slot-turno-cu10.seleccionado {
          border-color: var(--naranja) !important;
          background: var(--naranja) !important;
          color: #FFFFFF !important;
          box-shadow: 0 2px 8px rgba(242, 140, 30, 0.35);
        }

        .slot-turno-cu10.ocupado {
          background: #F1F5F7;
          color: #94A3B8;
          border-color: #E2E8F0;
          cursor: not-allowed;
          opacity: 0.7;
          text-decoration: line-through;
        }

        @media (max-width: 640px) {
          .cuadricula-turnos-cu10 {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 0.5rem;
          }

          .slot-turno-cu10 {
            min-height: 44px !important;
            padding: 0.5rem 0.2rem !important;
          }
        }
      `}</style>
    </div>
  );
}
