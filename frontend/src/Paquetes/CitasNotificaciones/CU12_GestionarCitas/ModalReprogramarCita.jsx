import React, { useState, useEffect } from 'react';
import useDisponibilidadTurnos from '../../CatalogosHorarios/CU10_ConsultarDisponibilidad/useDisponibilidadTurnos';

export default function ModalReprogramarCita({
  abierto,
  onCerrar,
  cita,
  onConfirmar,
  guardando = false,
  especialidades = [],
}) {
  const hoyStr = new Date().toISOString().split('T')[0];

  const [nuevaFecha, setNuevaFecha] = useState(hoyStr);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [motivoReprogramacion, setMotivoReprogramacion] = useState('');
  const [errorLocal, setErrorLocal] = useState(null);

  // Obtener especialidad si no viniera directamente en la cita
  const idEspecialidadFinal =
    cita?.id_especialidad ||
    especialidades?.find(
      (e) =>
        e.nombre === cita?.especialidad_nombre ||
        e.nombre === cita?.especialidad ||
        e.id_especialidad === cita?.id_especialidad
    )?.id_especialidad;

  const {
    turnos,
    turnosDisponibles,
    cargando: cargandoTurnos,
    motivoBloqueo,
    errorServidor,
    refrescar: refrescarTurnos,
  } = useDisponibilidadTurnos({
    idMedico: cita?.id_medico,
    idEspecialidad: idEspecialidadFinal,
    fecha: nuevaFecha,
    turnoSeleccionado,
    onDeseleccionarTurno: () => setTurnoSeleccionado(null),
    activo: Boolean(abierto && cita && cita.id_medico && nuevaFecha),
  });

  useEffect(() => {
    if (abierto && cita) {
      setNuevaFecha(cita.fecha_cita >= hoyStr ? cita.fecha_cita : hoyStr);
      setTurnoSeleccionado(null);
      setMotivoReprogramacion('');
      setErrorLocal(null);
    }
  }, [abierto, cita, hoyStr]);

  if (!abierto || !cita) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorLocal(null);

    if (!turnoSeleccionado) {
      setErrorLocal('Debe seleccionar un horario disponible para la cita.');
      return;
    }

    let horaLimpia = String(turnoSeleccionado.hora_inicio).trim();
    if (horaLimpia.length > 5) horaLimpia = horaLimpia.slice(0, 5);

    const payload = {
      id_cita: cita.id_cita,
      fecha_cita: nuevaFecha,
      hora_inicio: horaLimpia,
      motivo_reprogramacion: motivoReprogramacion.trim() || 'Reprogramación solicitada en ventanilla',
    };

    onConfirmar(payload, (error) => {
      setErrorLocal(error);
      setTurnoSeleccionado(null);
      refrescarTurnos();
    });
  };

  const pacienteNombre = cita.paciente_apellidos
    ? `${cita.paciente_apellidos}, ${cita.paciente_nombres || ''}`
    : (cita.paciente || 'Paciente');

  const medicoNombre = cita.medico_apellidos
    ? `Dr(a). ${cita.medico_apellidos}, ${cita.medico_nombres || ''}`
    : (cita.medico || 'Médico asignado');

  const especialidadNombre = cita.especialidad_nombre || cita.especialidad || 'Consulta Externa';
  const horaActualStr = cita.hora_inicio ? cita.hora_inicio.substring(0, 5) : '--:--';

  return (
    <div
      className="modal-backdrop modal-overlay"
      onClick={onCerrar}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        className="modal-contenido modal-contenedor tarjeta"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          maxWidth: '580px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Cabecera del Modal */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            borderBottom: '1px solid #E2E8F0',
            paddingBottom: '0.75rem',
          }}
        >
          <div>
            <h3 style={{ margin: 0, color: 'var(--azul-petroleo, #0A6C84)', fontSize: '1.25rem' }}>
              Reprogramar Cita Médica
            </h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--texto-sec, #64748B)', fontSize: '0.85rem' }}>
              Seleccione una nueva fecha y horario disponible para el paciente.
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              color: '#64748B',
              padding: '4px 8px',
            }}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Alerta de Error Local */}
        {errorLocal && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.88rem',
              marginBottom: '1rem',
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#B91C1C',
            }}
          >
            ⚠️ {errorLocal}
          </div>
        )}

        {/* 1. Datos Actuales de la Cita */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            fontSize: '0.88rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.5rem 1rem',
          }}
        >
          <div>
            <span style={{ color: '#64748B', fontSize: '0.78rem', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
              Código de Cita
            </span>
            <span className="badge-codigo-turquesa" style={{ marginTop: '2px' }}>
              {cita.codigo_cita}
            </span>
          </div>

          <div>
            <span style={{ color: '#64748B', fontSize: '0.78rem', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
              Paciente
            </span>
            <span style={{ fontWeight: 600, color: '#1E293B' }}>
              {pacienteNombre}
            </span>
            {cita.paciente_ci && (
              <span style={{ fontSize: '0.8rem', color: '#64748B', marginLeft: '4px' }}>
                (CI: {cita.paciente_ci})
              </span>
            )}
          </div>

          <div>
            <span style={{ color: '#64748B', fontSize: '0.78rem', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
              Médico
            </span>
            <span style={{ fontWeight: 600, color: '#1E293B' }}>
              {medicoNombre}
            </span>
          </div>

          <div>
            <span style={{ color: '#64748B', fontSize: '0.78rem', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
              Especialidad
            </span>
            <span style={{ fontWeight: 600, color: '#0A6C84' }}>
              {especialidadNombre}
            </span>
          </div>

          <div style={{ gridColumn: '1 / -1', borderTop: '1px dashed #CBD5E1', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
            <span style={{ color: '#64748B', fontSize: '0.8rem' }}>
              Turno actual: <strong style={{ color: '#B91C1C' }}>{cita.fecha_cita} a las {horaActualStr}</strong>
            </span>
            <span style={{ margin: '0 0.5rem', color: '#CBD5E1' }}>•</span>
            <span style={{ color: '#0A6C84', fontSize: '0.8rem', fontWeight: 500 }}>
              Garantía pagada conservada intacta
            </span>
          </div>
        </div>

        {/* Formulario de Reprogramación */}
        <form onSubmit={handleSubmit}>
          {/* 2. Selección de Nueva Fecha */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="nueva-fecha-reprog"
              style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.35rem', color: '#1E293B' }}
            >
              Nueva Fecha de Atención *
            </label>
            <input
              type="date"
              id="nueva-fecha-reprog"
              className="campo-control"
              value={nuevaFecha}
              min={hoyStr}
              onChange={(e) => setNuevaFecha(e.target.value)}
              disabled={guardando}
              required
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Horarios Disponibles en Tiempo Real (CU-10) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0A6C84' }}>
                Horarios Disponibles para el {nuevaFecha}:
              </label>
              <button
                type="button"
                onClick={refrescarTurnos}
                className="boton-terciario"
                style={{ fontSize: '0.75rem', padding: '2px 8px', minHeight: 'auto' }}
                title="Actualizar disponibilidad"
              >
                🔄 Actualizar
              </button>
            </div>

            {cargandoTurnos ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#0A6C84',
                  padding: '1.25rem',
                  background: '#F0F9FF',
                  borderRadius: '8px',
                  justifyContent: 'center',
                }}
              >
                <span className="spinner-tabla" style={{ width: '16px', height: '16px' }} />
                <span style={{ fontSize: '0.88rem', fontStyle: 'italic' }}>
                  Consultando turnos libres en tiempo real…
                </span>
              </div>
            ) : motivoBloqueo ? (
              <div
                style={{
                  padding: '0.85rem',
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: '8px',
                  color: '#B91C1C',
                  fontSize: '0.88rem',
                }}
              >
                {motivoBloqueo}
              </div>
            ) : errorServidor ? (
              <div
                style={{
                  padding: '0.85rem',
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: '8px',
                  color: '#B91C1C',
                  fontSize: '0.88rem',
                }}
              >
                {errorServidor}
              </div>
            ) : turnos.filter((t) => t.disponible === true || t.disponible === 1).length === 0 ? (
              <div
                style={{
                  padding: '1rem',
                  background: '#F8FAFC',
                  border: '1px dashed #CBD5E1',
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: '#64748B',
                  fontSize: '0.88rem',
                }}
              >
                No hay turnos libres disponibles para la fecha seleccionada. Por favor seleccione otra fecha.
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(75px, 1fr))',
                  gap: '8px',
                  maxHeight: '190px',
                  overflowY: 'auto',
                  padding: '4px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                }}
              >
                {turnos
                  .filter((t) => t.disponible === true || t.disponible === 1)
                  .map((t) => {
                    const horaFormateada = t.hora_inicio ? String(t.hora_inicio).substring(0, 5) : '';
                    const seleccionado = turnoSeleccionado?.hora_inicio === horaFormateada;
                    return (
                      <button
                        key={t.hora_inicio}
                        type="button"
                        disabled={guardando}
                        onClick={() => setTurnoSeleccionado({ ...t, hora_inicio: horaFormateada })}
                        style={{
                          padding: '0.55rem 0.35rem',
                          borderRadius: '6px',
                          border: seleccionado ? '2px solid #F28C1E' : '1px solid #CBD5E1',
                          background: seleccionado ? '#F28C1E' : '#FFFFFF',
                          color: seleccionado ? '#FFFFFF' : '#1E293B',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {horaFormateada}
                      </button>
                    );
                  })}
              </div>
            )}

            {turnoSeleccionado && (
              <div
                style={{
                  marginTop: '0.5rem',
                  fontSize: '0.85rem',
                  color: '#15803D',
                  fontWeight: 600,
                  backgroundColor: '#F0FDF4',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  border: '1px solid #BBF7D0',
                  display: 'inline-block',
                }}
              >
                ✓ Nuevo horario seleccionado: <strong>{turnoSeleccionado.hora_inicio}</strong>
              </div>
            )}
          </div>

          {/* 3. Motivo u Observación de la Reprogramación */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="motivo-reprog"
              style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.35rem', color: '#1E293B' }}
            >
              Motivo u Observación de la Reprogramación
            </label>
            <textarea
              id="motivo-reprog"
              value={motivoReprogramacion}
              onChange={(e) => setMotivoReprogramacion(e.target.value)}
              placeholder="Indique la causa o detalle del cambio de horario (opcional)..."
              rows={2}
              disabled={guardando}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.88rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 4. Botones de Acción */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
            <button
              type="button"
              onClick={onCerrar}
              disabled={guardando}
              className="boton-terciario"
              style={{ minHeight: '42px', padding: '0 1.25rem' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || !turnoSeleccionado}
              className="boton-primario"
              style={{
                minHeight: '42px',
                padding: '0 1.5rem',
                backgroundColor: '#0A6C84',
                borderColor: '#0A6C84',
              }}
            >
              {guardando ? 'Reprogramando cita…' : 'Confirmar Reprogramación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
