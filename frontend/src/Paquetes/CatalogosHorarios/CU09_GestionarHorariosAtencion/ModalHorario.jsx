import React, { useState, useEffect } from 'react';
import CampoTexto from '../../../compartido/componentes/CampoTexto';

const DIAS_SEMANA = [
  { id: 1, nombre: 'Lunes' },
  { id: 2, nombre: 'Martes' },
  { id: 3, nombre: 'Miércoles' },
  { id: 4, nombre: 'Jueves' },
  { id: 5, nombre: 'Viernes' },
  { id: 6, nombre: 'Sábado' },
  { id: 7, nombre: 'Domingo' },
];

export default function ModalHorario({
  abierto,
  alCerrar,
  alGuardar,
  horarioEditando,
  medicos,
  cargando,
}) {
  const [idMedico, setIdMedico] = useState('');
  const [idEspecialidad, setIdEspecialidad] = useState('');
  const [diaSemana, setDiaSemana] = useState(1);
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('12:00');
  const [duracion, setDuracion] = useState(15);
  const [errores, setErrores] = useState({});

  // Cargar y auto-seleccionar datos al abrir modal o al cambiar horarioEditando
  useEffect(() => {
    if (!abierto) return;

    if (horarioEditando) {
      const medId = horarioEditando.id_medico ? String(horarioEditando.id_medico) : '';
      const espId = horarioEditando.id_especialidad ? String(horarioEditando.id_especialidad) : '';
      setIdMedico(medId);
      setIdEspecialidad(espId);
      setDiaSemana(horarioEditando.dia_semana || 1);
      setHoraInicio(horarioEditando.hora_inicio ? horarioEditando.hora_inicio.substring(0, 5) : '08:00');
      setHoraFin(horarioEditando.hora_fin ? horarioEditando.hora_fin.substring(0, 5) : '12:00');
      setDuracion(horarioEditando.duracion_intervalo_minutos || 15);
    } else {
      const primerMed = medicos.find((m) => (m.especialidades || []).length > 0) || medicos[0];
      const medId = primerMed ? String(primerMed.id_medico) : '';
      const primerEsp = primerMed?.especialidades?.[0];
      const espId = primerEsp ? String(primerEsp.id_especialidad) : '';

      setIdMedico(medId);
      setIdEspecialidad(espId);
      setDiaSemana(1);
      setHoraInicio('08:00');
      setHoraFin('12:00');
      setDuracion(primerEsp?.duracion_turno_minutos || 15);
    }
    setErrores({});
  }, [horarioEditando, abierto, medicos]);

  // Obtener médico seleccionado para extraer sus especialidades vinculadas
  const medicoSeleccionado = medicos.find((m) => Number(m.id_medico) === Number(idMedico));
  const especialidadesDisponibles = medicoSeleccionado?.especialidades || [];

  // Cuando cambia el médico desde el select, auto-seleccionar su primera especialidad y sincronizar inmediatamente
  const manejarCambioMedico = (nuevoIdMedico) => {
    setIdMedico(nuevoIdMedico);
    const med = medicos.find((m) => Number(m.id_medico) === Number(nuevoIdMedico));
    const primerEsp = med?.especialidades?.[0];
    if (primerEsp) {
      setIdEspecialidad(String(primerEsp.id_especialidad));
      if (primerEsp.duracion_turno_minutos) {
        setDuracion(primerEsp.duracion_turno_minutos);
      }
    } else {
      setIdEspecialidad('');
    }
    setErrores((prev) => ({ ...prev, id_medico: null, id_especialidad: null, general: null }));
  };

  // Sincronización continua de seguridad: si idEspecialidad no coincide con ninguna del médico seleccionado
  useEffect(() => {
    if (medicoSeleccionado && especialidadesDisponibles.length > 0) {
      const existe = especialidadesDisponibles.some(
        (e) => Number(e.id_especialidad) === Number(idEspecialidad)
      );
      if (!existe) {
        const primera = especialidadesDisponibles[0];
        setIdEspecialidad(String(primera.id_especialidad));
        if (primera.duracion_turno_minutos) {
          setDuracion(primera.duracion_turno_minutos);
        }
      }
    } else if (!medicoSeleccionado || especialidadesDisponibles.length === 0) {
      setIdEspecialidad('');
    }
  }, [idMedico, medicoSeleccionado, especialidadesDisponibles, idEspecialidad]);

  // Al seleccionar especialidad manualmente, heredar duración configurada (si existe)
  const manejarCambioEspecialidad = (idEsp) => {
    setIdEspecialidad(String(idEsp));
    const esp = especialidadesDisponibles.find((e) => Number(e.id_especialidad) === Number(idEsp));
    if (esp?.duracion_turno_minutos) {
      setDuracion(esp.duracion_turno_minutos);
    }
    setErrores((prev) => ({ ...prev, id_especialidad: null, general: null }));
  };

  // Cálculo reactivo de turnos generados
  const calcularTurnos = () => {
    if (!horaInicio || !horaFin || !duracion || duracion <= 0) {
      return { valido: false, mensaje: 'Ingrese horas y duración válidas para calcular los turnos.' };
    }

    const [hIni, mIni] = horaInicio.split(':').map(Number);
    const [hFin, mFin] = horaFin.split(':').map(Number);

    if (isNaN(hIni) || isNaN(mIni) || isNaN(hFin) || isNaN(mFin)) {
      return { valido: false, mensaje: 'Formato de hora no válido (HH:mm).' };
    }

    const totalMinutosInicio = hIni * 60 + mIni;
    const totalMinutosFin = hFin * 60 + mFin;
    const diferencia = totalMinutosFin - totalMinutosInicio;

    if (diferencia <= 0) {
      return { valido: false, mensaje: 'La hora de fin debe ser estrictamente posterior a la hora de inicio.' };
    }

    const resto = diferencia % duracion;
    const turnos = Math.floor(diferencia / duracion);

    if (resto !== 0) {
      return {
        valido: false,
        mensaje: `⚠️ El rango seleccionado (${diferencia} min) no es divisible de forma exacta entre ${duracion} min (sobran ${resto} min). Ajuste la hora o duración para cumplir RN08.`,
        turnos,
      };
    }

    return {
      valido: true,
      mensaje: `⚡ Capacidad calculada: de ${horaInicio} a ${horaFin} cada ${duracion} min = ${turnos} turnos generados por jornada.`,
      turnos,
    };
  };

  const calculo = calcularTurnos();

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setErrores({});

    const medIdNum = Number(idMedico);
    let espIdNum = Number(idEspecialidad);

    // Auto-recuperación si no estaba casteado pero hay especialidades
    if (!espIdNum && especialidadesDisponibles.length > 0) {
      espIdNum = Number(especialidadesDisponibles[0].id_especialidad);
      setIdEspecialidad(String(espIdNum));
    }

    if (!medIdNum) {
      setErrores({ id_medico: 'Debe seleccionar un profesional médico.' });
      return;
    }

    const espValida = especialidadesDisponibles.some(
      (esp) => Number(esp.id_especialidad) === espIdNum
    );

    if (!espIdNum || !espValida) {
      setErrores({ id_especialidad: 'Debe seleccionar una especialidad médica asignada al profesional.' });
      return;
    }

    if (!calculo.valido) {
      setErrores({ general: calculo.mensaje });
      return;
    }

    const payload = {
      id_medico: medIdNum,
      id_especialidad: espIdNum,
      dia_semana: parseInt(diaSemana, 10),
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      duracion_intervalo_minutos: parseInt(duracion, 10),
      estado: horarioEditando ? horarioEditando.estado : 'activo',
    };

    alGuardar(payload, setErrores);
  };

  if (!abierto) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(18, 52, 59, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div className="tarjeta" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 className="titulo" style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>
          <b>{horarioEditando ? 'Editar Franja' : 'Configurar Nuevo'}</b> <span>Horario de Atención</span>
        </h3>

        {errores.general && (
          <div
            style={{
              background: '#FEE2E2',
              color: '#991B1B',
              border: '1px solid #F87171',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              lineHeight: 1.45,
            }}
          >
            {errores.general}
          </div>
        )}

        <form onSubmit={manejarEnvio}>
          {/* Selector de Médico */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="etiqueta-campo" htmlFor="selector-medico" style={{ display: 'block', marginBottom: '0.35rem' }}>
              Profesional Médico <span style={{ color: 'var(--cancelada)' }}>*</span>
            </label>
            <select
              id="selector-medico"
              value={idMedico}
              onChange={(e) => manejarCambioMedico(e.target.value)}
              className="campo-control"
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                borderRadius: '6px',
                border: errores.id_medico ? '1.5px solid var(--cancelada)' : '1px solid var(--borde-campo)',
                background: '#FFFFFF',
                fontSize: '0.95rem',
              }}
            >
              <option value="">-- Seleccionar Médico --</option>
              {medicos.map((m) => (
                <option key={m.id_medico} value={String(m.id_medico)}>
                  Dr. {m.apellidos}, {m.nombres} ({m.nro_matricula})
                </option>
              ))}
            </select>
            {errores.id_medico && (
              <span className="mensaje-error-campo" style={{ color: 'var(--cancelada)', fontSize: '0.8rem' }}>
                {errores.id_medico}
              </span>
            )}
          </div>

          {/* Selector de Especialidad */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="etiqueta-campo" htmlFor="selector-especialidad" style={{ display: 'block', marginBottom: '0.35rem' }}>
              Especialidad Médica Asignada (RN05) <span style={{ color: 'var(--cancelada)' }}>*</span>
            </label>
            <select
              id="selector-especialidad"
              value={idEspecialidad}
              onChange={(e) => manejarCambioEspecialidad(e.target.value)}
              disabled={especialidadesDisponibles.length === 0}
              className="campo-control"
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                borderRadius: '6px',
                border: errores.id_especialidad ? '1.5px solid var(--cancelada)' : '1px solid var(--borde-campo)',
                background: especialidadesDisponibles.length === 0 ? '#F3F4F6' : '#FFFFFF',
                fontSize: '0.95rem',
              }}
            >
              {especialidadesDisponibles.length === 0 ? (
                <option value="">El médico no tiene especialidades asignadas</option>
              ) : (
                especialidadesDisponibles.map((esp) => (
                  <option key={esp.id_especialidad} value={esp.id_especialidad}>
                    🩺 {esp.nombre}
                  </option>
                ))
              )}
            </select>
            {errores.id_especialidad && (
              <span className="mensaje-error-campo" style={{ color: 'var(--cancelada)', fontSize: '0.8rem' }}>
                {errores.id_especialidad}
              </span>
            )}
          </div>

          {/* Selector de Día y Duración */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="etiqueta-campo" htmlFor="selector-dia" style={{ display: 'block', marginBottom: '0.35rem' }}>
                Día de Atención Semanal <span style={{ color: 'var(--cancelada)' }}>*</span>
              </label>
              <select
                id="selector-dia"
                value={diaSemana}
                onChange={(e) => setDiaSemana(e.target.value)}
                className="campo-control"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--borde-campo)',
                  background: '#FFFFFF',
                  fontSize: '0.95rem',
                }}
              >
                {DIAS_SEMANA.map((d) => (
                  <option key={d.id} value={d.id}>
                    📅 {d.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="etiqueta-campo" htmlFor="input-duracion" style={{ display: 'block', marginBottom: '0.35rem' }}>
                Duración por Turno (min) <span style={{ color: 'var(--cancelada)' }}>*</span>
              </label>
              <input
                id="input-duracion"
                type="number"
                min="5"
                max="120"
                step="5"
                value={duracion}
                onChange={(e) => setDuracion(Number(e.target.value))}
                className="campo-control"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '6px',
                  border: errores.duracion_intervalo_minutos ? '1.5px solid var(--cancelada)' : '1px solid var(--borde-campo)',
                  background: '#FFFFFF',
                  fontSize: '0.95rem',
                }}
                required
              />
              {errores.duracion_intervalo_minutos && (
                <span className="mensaje-error-campo" style={{ color: 'var(--cancelada)', fontSize: '0.8rem' }}>
                  {errores.duracion_intervalo_minutos}
                </span>
              )}
            </div>
          </div>

          {/* Franja Horaria (Inicio y Fin) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="etiqueta-campo" htmlFor="input-inicio" style={{ display: 'block', marginBottom: '0.35rem' }}>
                Hora Inicial <span style={{ color: 'var(--cancelada)' }}>*</span>
              </label>
              <input
                id="input-inicio"
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="campo-control"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '6px',
                  border: errores.hora_inicio ? '1.5px solid var(--cancelada)' : '1px solid var(--borde-campo)',
                  background: '#FFFFFF',
                  fontSize: '0.95rem',
                }}
                required
              />
              {errores.hora_inicio && (
                <span className="mensaje-error-campo" style={{ color: 'var(--cancelada)', fontSize: '0.8rem' }}>
                  {errores.hora_inicio}
                </span>
              )}
            </div>

            <div>
              <label className="etiqueta-campo" htmlFor="input-fin" style={{ display: 'block', marginBottom: '0.35rem' }}>
                Hora Final <span style={{ color: 'var(--cancelada)' }}>*</span>
              </label>
              <input
                id="input-fin"
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                className="campo-control"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '6px',
                  border: errores.hora_fin ? '1.5px solid var(--cancelada)' : '1px solid var(--borde-campo)',
                  background: '#FFFFFF',
                  fontSize: '0.95rem',
                }}
                required
              />
              {errores.hora_fin && (
                <span className="mensaje-error-campo" style={{ color: 'var(--cancelada)', fontSize: '0.8rem' }}>
                  {errores.hora_fin}
                </span>
              )}
            </div>
          </div>

          {/* Previsualizador reactivo de capacidad de turnos */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              background: calculo.valido ? '#ECFDF5' : '#FEF2F2',
              border: `1.5px solid ${calculo.valido ? '#10B981' : '#F87171'}`,
              color: calculo.valido ? '#065F46' : '#991B1B',
              fontSize: '0.875rem',
              lineHeight: 1.45,
            }}
          >
            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {calculo.mensaje}
            </div>
          </div>

          {/* Botones de acción accesibles */}
          <div className="modal-horarios-botones" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={alCerrar}
              className="boton-terciario"
              style={{ minHeight: '44px' }}
              disabled={cargando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="boton-primario"
              style={{ minHeight: '44px' }}
              disabled={cargando || !calculo.valido}
            >
              {cargando ? 'Guardando...' : horarioEditando ? 'Actualizar Horario' : 'Guardar Horario'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .modal-horarios-botones {
            flex-direction: column !important;
            width: 100%;
            gap: 0.5rem !important;
          }
          .modal-horarios-botones button {
            width: 100% !important;
            min-height: 44px !important;
          }
        }
      `}</style>
    </div>
  );
}
