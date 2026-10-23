import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../compartido/utilidades/api';
import CampoTexto from '../../../compartido/componentes/CampoTexto';
import CampoSelect from '../../../compartido/componentes/CampoSelect';
import Alerta from '../../../compartido/componentes/Alerta';
import LayoutPrincipal from '../../../compartido/layouts/LayoutPrincipal';

export default function PaginaReservaCitas() {
  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [turnos, setTurnos] = useState([]);

  const [idEspecialidad, setIdEspecialidad] = useState('');
  const [idMedico, setIdMedico] = useState('');
  const [idPaciente, setIdPaciente] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [motivoConsulta, setMotivoConsulta] = useState('');

  const [cargandoDisponibilidad, setCargandoDisponibilidad] = useState(false);
  const [motivoBloqueo, setMotivoBloqueo] = useState(null);
  const [errores, setErrores] = useState({});
  const [alerta, setAlerta] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario_clinica') || '{}');
  const esPersonal = ['administrador', 'recepcionista'].includes((usuario?.rol || '').toLowerCase());

  // Cargar especialidades y médicos
  useEffect(() => {
    api.get('/catalogos/especialidades-publicas')
      .then((res) => setEspecialidades(res.data.datos || []))
      .catch(() => {});

    if (esPersonal) {
      api.get('/pacientes')
        .then((res) => setPacientes(res.data.datos || []))
        .catch(() => {});
    }
  }, [esPersonal]);

  // Filtrar médicos al cambiar especialidad
  useEffect(() => {
    if (idEspecialidad) {
      api.get(`/catalogos/medicos-publicos?id_especialidad=${idEspecialidad}`)
        .then((res) => {
          setMedicos(res.data.datos || []);
          setIdMedico('');
          setTurnos([]);
          setTurnoSeleccionado(null);
        })
        .catch(() => {});
    } else {
      setMedicos([]);
      setIdMedico('');
      setTurnos([]);
      setTurnoSeleccionado(null);
    }
  }, [idEspecialidad]);

  // Consultar disponibilidad al cambiar médico o fecha
  useEffect(() => {
    if (idMedico && idEspecialidad && fecha) {
      setCargandoDisponibilidad(true);
      setMotivoBloqueo(null);
      setTurnoSeleccionado(null);

      api.get(`/catalogos/disponibilidad?id_medico=${idMedico}&id_especialidad=${idEspecialidad}&fecha=${fecha}`)
        .then((res) => {
          const resultado = res.data.datos;
          if (resultado.disponible) {
            setTurnos(resultado.turnos || []);
            setMotivoBloqueo(null);
          } else {
            setTurnos([]);
            setMotivoBloqueo(resultado.motivo_bloqueo || 'No hay turnos disponibles para esta fecha.');
          }
        })
        .catch((err) => {
          setTurnos([]);
          setMotivoBloqueo(err.response?.data?.mensaje || 'Error al consultar disponibilidad.');
        })
        .finally(() => setCargandoDisponibilidad(false));
    }
  }, [idMedico, idEspecialidad, fecha]);

  const manejarReserva = async (e) => {
    e.preventDefault();
    setAlerta(null);
    setErrores({});

    if (!turnoSeleccionado) {
      setAlerta({ tipo: 'error', mensaje: 'Debe seleccionar un turno disponible en la lista inferior.' });
      return;
    }

    setEnviando(true);

    const payload = {
      id_especialidad: Number(idEspecialidad),
      id_medico: Number(idMedico),
      fecha_cita: fecha,
      hora_inicio: turnoSeleccionado.hora_inicio,
      motivo_consulta: motivoConsulta,
    };

    if (esPersonal) {
      payload.id_paciente = Number(idPaciente);
    } else {
      payload.id_paciente = usuario.id_paciente;
    }

    try {
      const res = await api.post('/citas', payload);
      setAlerta({
        tipo: 'exito',
        mensaje: `¡Cita agendada exitosamente! Código: ${res.data.datos.codigo_cita}.`,
      });

      // Refrescar turnos disponibles
      setTurnoSeleccionado(null);
      setMotivoConsulta('');
      setTimeout(() => {
        if (!esPersonal) navigate('/citas/historial');
      }, 1500);
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errores) {
        setErrores(err.response.data.errores);
      } else {
        setAlerta({
          tipo: 'error',
          mensaje: err.response?.data?.mensaje || 'No se pudo reservar el turno médico.',
        });
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <LayoutPrincipal>
      <div style={{ maxWidth: '800px', margin: '0.5rem auto', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
        <div className="tarjeta" style={{ overflowX: 'hidden', width: '100%', boxSizing: 'border-box' }}>
          <h2 className="titulo" style={{ marginBottom: '0.25rem' }}>
            <b>Reserva</b> <span>de Citas Médicas</span>
          </h2>
          <p style={{ color: 'var(--texto-sec)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Selecciona la especialidad, el médico y el horario de tu preferencia con confirmación inmediata.
          </p>

          <Alerta tipo={alerta?.tipo} mensaje={alerta?.mensaje} />

          <form onSubmit={manejarReserva}>
            {esPersonal && (
              <CampoSelect
                etiqueta="Paciente Destinatario"
                nombre="id_paciente"
                valor={idPaciente}
                alCambiar={(e) => setIdPaciente(e.target.value)}
                error={errores.id_paciente?.[0] || errores.id_paciente}
                opciones={pacientes.map((p) => ({
                  valor: p.id_paciente,
                  etiqueta: `${p.apellidos}, ${p.nombres} (CI: ${p.ci || 'S/N'} - Hist: ${p.codigo_historia})`,
                }))}
                requerido
              />
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0 1rem' }}>
              <CampoSelect
                etiqueta="Especialidad Médica"
                nombre="id_especialidad"
                valor={idEspecialidad}
                alCambiar={(e) => setIdEspecialidad(e.target.value)}
                error={errores.id_especialidad?.[0] || errores.id_especialidad}
                opciones={especialidades.map((esp) => ({
                  valor: esp.id_especialidad,
                  etiqueta: `${esp.nombre} (${esp.duracion_turno_minutos} min)`,
                }))}
                requerido
              />

              <CampoSelect
                etiqueta="Médico Especialista"
                nombre="id_medico"
                valor={idMedico}
                alCambiar={(e) => setIdMedico(e.target.value)}
                error={errores.id_medico?.[0] || errores.id_medico}
                opciones={medicos.map((med) => ({
                  valor: med.id_medico,
                  etiqueta: `Dr. ${med.apellidos}, ${med.nombres} (Matrícula: ${med.nro_matricula})`,
                }))}
                deshabilitado={!idEspecialidad}
                requerido
              />
            </div>

            <CampoTexto
              etiqueta="Fecha de la Consulta"
              nombre="fecha_cita"
              tipo="date"
              valor={fecha}
              alCambiar={(e) => setFecha(e.target.value)}
              error={errores.fecha_cita?.[0] || errores.fecha_cita}
              requerido
            />

            {/* Selector de Turnos / Disponibilidad */}
            <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              <label className="etiqueta-campo" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Turnos Disponibles para la Fecha Seleccionada:
              </label>

              {cargandoDisponibilidad && (
                <p style={{ color: 'var(--turquesa)', fontStyle: 'italic' }}>Calculando turnos disponibles…</p>
              )}

              {motivoBloqueo && (
                <div className="alerta-error" style={{ marginBottom: 0 }}>
                  {motivoBloqueo}
                </div>
              )}

              {!cargandoDisponibilidad && !motivoBloqueo && turnos.length === 0 && idMedico && (
                <p style={{ color: 'var(--texto-sec)' }}>No hay turnos disponibles para esta combinación.</p>
              )}

              {!cargandoDisponibilidad && turnos.length > 0 && (
                <div className="grid-turnos">
                  {turnos.map((t) => {
                    const seleccionado = turnoSeleccionado?.hora_inicio === t.hora_inicio;
                    return (
                      <button
                        key={t.hora_inicio}
                        type="button"
                        disabled={!t.disponible}
                        onClick={() => setTurnoSeleccionado(t)}
                        className={`slot-turno ${t.disponible ? 'disponible' : 'ocupado'} ${seleccionado ? 'seleccionado' : ''}`}
                      >
                        <span>{t.hora_inicio}</span>
                        <small style={{ fontSize: '0.7rem', opacity: 0.85 }}>{t.hora_fin}</small>
                      </button>
                    );
                  })}
                </div>
              )}

              {turnoSeleccionado && (
                <p style={{ marginTop: '0.75rem', color: 'var(--verde-azulado)', fontWeight: 600 }}>
                  Turno seleccionado: {turnoSeleccionado.hora_inicio} - {turnoSeleccionado.hora_fin}
                </p>
              )}
            </div>

            <CampoTexto
              etiqueta="Motivo de la Consulta (Opcional)"
              nombre="motivo_consulta"
              valor={motivoConsulta}
              alCambiar={(e) => setMotivoConsulta(e.target.value)}
              error={errores.motivo_consulta?.[0] || errores.motivo_consulta}
              marcador="Describa brevemente sus síntomas o motivo de atención"
              filas={3}
            />

            <button
              type="submit"
              className="boton-primario"
              style={{ width: '100%', minHeight: '48px', fontSize: '1rem', marginTop: '0.5rem' }}
              disabled={enviando || !turnoSeleccionado}
            >
              {enviando ? 'Confirmando Reserva…' : 'Confirmar y Reservar Cita'}
            </button>
          </form>
        </div>
      </div>
    </LayoutPrincipal>
  );
}
