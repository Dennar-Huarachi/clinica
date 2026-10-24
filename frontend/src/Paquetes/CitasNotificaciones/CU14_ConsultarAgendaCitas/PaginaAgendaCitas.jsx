import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../compartido/utilidades/api';
import CampoTexto from '../../../compartido/componentes/CampoTexto';
import CampoSelect from '../../../compartido/componentes/CampoSelect';
import InsigniaEstado from '../../../compartido/componentes/InsigniaEstado';
import Alerta from '../../../compartido/componentes/Alerta';
import LayoutPrincipal from '../../../compartido/layouts/LayoutPrincipal';
import TablaExpandible from '../../../comun/componentes/TablaExpandible';
import InsigniaEstadoPago from '../CU27_GestionarPagosReembolsos/InsigniaEstadoPago';

export default function PaginaAgendaCitas() {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState(null);

  // Filtros dinámicos de agenda (CU-14)
  const [especialidades, setEspecialidades] = useState([]);
  const [idEspecialidad, setIdEspecialidad] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [medicos, setMedicos] = useState([]);
  const [idMedicoFiltro, setIdMedicoFiltro] = useState('');

  // Estados de modales
  const [citaCancelar, setCitaCancelar] = useState(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [procesandoCancelacion, setProcesandoCancelacion] = useState(false);

  const [citaCorreccionRN16, setCitaCorreccionRN16] = useState(null);
  const [nuevoEstadoRN16, setNuevoEstadoRN16] = useState('');
  const [motivoCorreccionRN16, setMotivoCorreccionRN16] = useState('');
  const [procesandoCorreccion, setProcesandoCorreccion] = useState(false);

  const usuario = JSON.parse(localStorage.getItem('usuario_clinica') || '{}');
  const rol = (usuario?.rol || '').toLowerCase();
  const esMedico = rol === 'medico';
  const esAdmin = rol === 'administrador';

  // Cargar especialidades y médicos activos
  useEffect(() => {
    api.get('/catalogos/especialidades-publicas?estado=activo')
      .then((res) => {
        setEspecialidades(res.data.datos || []);
      })
      .catch(() => {});

    if (!esMedico) {
      api.get('/catalogos/medicos-publicos?estado=activo')
        .then((res) => {
          setMedicos(res.data.datos || []);
        })
        .catch(() => {});
    }
  }, [esMedico]);

  const cargarAgenda = () => {
    setCargando(true);
    let url = `/citas/agenda?fecha=${fecha}`;
    if (idMedicoFiltro) {
      url += `&id_medico=${idMedicoFiltro}`;
    }
    if (idEspecialidad) {
      url += `&id_especialidad=${idEspecialidad}`;
    }
    if (estadoFiltro) {
      url += `&estado=${estadoFiltro}`;
    }

    api.get(url)
      .then((res) => {
        setCitas(res.data.datos?.citas || []);
      })
      .catch((err) => {
        setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al cargar agenda.' });
      })
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarAgenda();
  }, [fecha, idEspecialidad, estadoFiltro, idMedicoFiltro]);

  // Acción rápida: Marcar presencia / asistencia / inasistencia
  const marcarAsistencia = async (idCita, nuevoEstado) => {
    try {
      await api.put(`/citas/${idCita}/asistencia`, {
        id_cita: idCita,
        estado: nuevoEstado,
      });
      setAlerta({ tipo: 'exito', mensaje: `Estado de la cita actualizado a: ${nuevoEstado}` });
      cargarAgenda();
    } catch (err) {
      setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'No se pudo actualizar el estado de la cita.' });
    }
  };

  // Acción: Confirmar Cita (CU-12)
  const confirmarCita = async (idCita) => {
    try {
      await api.put(`/citas/${idCita}/confirmar`);
      setAlerta({ tipo: 'exito', mensaje: 'Cita confirmada correctamente.' });
      cargarAgenda();
    } catch (err) {
      setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'No se pudo confirmar la cita.' });
    }
  };

  // Abrir modal de cancelación
  const abrirModalCancelar = (cita) => {
    setCitaCancelar(cita);
    setMotivoCancelacion('');
  };

  // Ejecutar cancelación lógica
  const ejecutarCancelacion = async (e) => {
    e.preventDefault();
    if (!motivoCancelacion.trim()) {
      setAlerta({ tipo: 'error', mensaje: 'Debe ingresar un motivo obligatorio para cancelar la cita.' });
      return;
    }

    setProcesandoCancelacion(true);
    try {
      await api.put(`/citas/${citaCancelar.id_cita}/cancelar`, {
        motivo: motivoCancelacion.trim(),
      });
      setAlerta({ tipo: 'exito', mensaje: `Cita ${citaCancelar.codigo_cita} cancelada exitosamente.` });
      setCitaCancelar(null);
      cargarAgenda();
    } catch (err) {
      setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'No se pudo cancelar la cita.' });
    } finally {
      setProcesandoCancelacion(false);
    }
  };

  // Abrir modal de corrección RN16 (Solo Administrador para citas cerradas)
  const abrirModalCorreccionRN16 = (cita) => {
    setCitaCorreccionRN16(cita);
    // Conmutación automática atendida ⇄ inasistencia
    const conmutado = cita.estado_codigo === 'atendida' ? 'inasistencia' : 'atendida';
    setNuevoEstadoRN16(conmutado);
    setMotivoCorreccionRN16('');
  };

  // Ejecutar corrección administrativa RN16
  const ejecutarCorreccionRN16 = async (e) => {
    e.preventDefault();
    if (!motivoCorreccionRN16.trim()) {
      setAlerta({ tipo: 'error', mensaje: 'El motivo justificado de corrección es obligatorio.' });
      return;
    }

    setProcesandoCorreccion(true);
    try {
      await api.put(`/citas/${citaCorreccionRN16.id_cita}/asistencia`, {
        id_cita: citaCorreccionRN16.id_cita,
        estado: nuevoEstadoRN16,
        motivo_correccion: motivoCorreccionRN16.trim(),
      });
      setAlerta({ tipo: 'exito', mensaje: 'Corrección administrativa de estado aplicada y auditada en bitácora.' });
      setCitaCorreccionRN16(null);
      cargarAgenda();
    } catch (err) {
      setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al aplicar corrección de cita.' });
    } finally {
      setProcesandoCorreccion(false);
    }
  };

  const opcionesEspecialidades = especialidades.map((esp) => ({
    valor: esp.id_especialidad,
    etiqueta: esp.nombre,
  }));

  const opcionesEstados = [
    { valor: 'pendiente', etiqueta: 'Programada / Pendiente' },
    { valor: 'confirmada', etiqueta: 'Confirmada' },
    { valor: 'en_espera', etiqueta: 'En Sala / Presente' },
    { valor: 'atendida', etiqueta: 'Atendida' },
  ];

  const opcionesMedicos = medicos.map((med) => ({
    valor: med.id_medico,
    etiqueta: `Dr. ${med.apellidos}, ${med.nombres}`,
  }));

  const columnasDesktop = [
    'Horario',
    'Código',
    'Paciente',
    'Especialidad / Médico',
    'Motivo',
    'Estado',
    'Acciones',
    '',
  ];

  return (
    <LayoutPrincipal>
      <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 className="titulo">
            <b>Agenda</b> <span>de Citas Médicas</span>
          </h2>
          <p style={{ color: 'var(--texto-sec)', fontSize: '0.9rem' }}>
            Control y seguimiento diario del flujo de atención de pacientes citados.
          </p>
        </div>

        {/* Barra de Filtros Dinámicos de Agenda (CU-14) */}
        <div
          className="tarjeta"
          style={{
            marginBottom: '1.5rem',
            padding: '1.25rem',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              alignItems: 'end',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ width: '100%', boxSizing: 'border-box' }}>
              <CampoTexto
                etiqueta="Fecha a Consultar"
                nombre="fecha"
                tipo="date"
                valor={fecha}
                alCambiar={(e) => setFecha(e.target.value)}
              />
            </div>

            {!esMedico && (
              <div style={{ width: '100%', boxSizing: 'border-box' }}>
                <CampoSelect
                  etiqueta="Médico Responsable"
                  nombre="id_medico"
                  valor={idMedicoFiltro}
                  alCambiar={(e) => setIdMedicoFiltro(e.target.value)}
                  opciones={opcionesMedicos}
                  textoVacio="Todos los médicos"
                />
              </div>
            )}

            <div style={{ width: '100%', boxSizing: 'border-box' }}>
              <CampoSelect
                etiqueta="Especialidad"
                nombre="id_especialidad"
                valor={idEspecialidad}
                alCambiar={(e) => setIdEspecialidad(e.target.value)}
                opciones={opcionesEspecialidades}
                textoVacio="Todas las especialidades"
              />
            </div>

            <div style={{ width: '100%', boxSizing: 'border-box' }}>
              <CampoSelect
                etiqueta="Estado"
                nombre="estado"
                valor={estadoFiltro}
                alCambiar={(e) => setEstadoFiltro(e.target.value)}
                opciones={opcionesEstados}
                textoVacio="Todos los estados"
              />
            </div>
          </div>

          {(idEspecialidad || estadoFiltro || idMedicoFiltro) && (
            <div style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setIdEspecialidad('');
                  setEstadoFiltro('');
                  setIdMedicoFiltro('');
                }}
                className="boton-terciario"
                style={{ minHeight: '38px', padding: '0 0.85rem', fontSize: '0.85rem' }}
              >
                ✕ Limpiar Filtros
              </button>
            </div>
          )}
        </div>

        <Alerta tipo={alerta?.tipo} mensaje={alerta?.mensaje} />

        {/* Tabla Responsiva Mobile-First con Acordeón Institucional */}
        <div className="tarjeta" style={{ padding: 0, overflow: 'hidden' }}>
          <TablaExpandible
            columnas={columnasDesktop}
            datos={citas}
            cargando={cargando}
            mensajeVacio={`No se registran citas para los filtros seleccionados (${fecha}).`}
            obtenerClaveFila={(c) => c.id_cita}
            renderFilaPrincipal={(c, isExpanded, toggleExpand) => (
              <>
                <td style={{ fontWeight: 700, color: 'var(--verde-azulado)' }}>
                  {c.hora_inicio} - {c.hora_fin}
                </td>
                <td>
                  <span className="badge-codigo-turquesa">{c.codigo_cita}</span>
                </td>
                <td>
                  <strong>{c.paciente_apellidos}, {c.paciente_nombres}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--texto-sec)' }}>
                    CI: {c.paciente_ci || 'S/N'} | Hist: {c.codigo_historia}
                  </div>
                </td>
                <td>
                  <div>{c.especialidad_nombre}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--texto-sec)' }}>
                    Dr. {c.medico_apellidos}
                  </div>
                </td>
                <td style={{ fontSize: '0.85rem' }}>
                  {c.motivo_consulta || 'Consulta general'}
                </td>
                <td>
                  <InsigniaEstado estado={c.estado_codigo} texto={c.estado_nombre} />
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {c.estado_codigo === 'pendiente' && (
                      <button
                        type="button"
                        onClick={() => confirmarCita(c.id_cita)}
                        className="boton-secundario"
                        style={{ minHeight: '34px', padding: '0 0.6rem', fontSize: '0.8rem' }}
                        title="Confirmar Cita"
                      >
                        Confirmar
                      </button>
                    )}

                    {['pendiente', 'confirmada'].includes(c.estado_codigo) && (
                      <button
                        type="button"
                        onClick={() => marcarAsistencia(c.id_cita, 'en_espera')}
                        className="boton-primario"
                        style={{ minHeight: '34px', padding: '0 0.6rem', fontSize: '0.8rem' }}
                        title="Registrar presencia en sala de espera"
                      >
                        Presente
                      </button>
                    )}

                    {esMedico && ['en_espera', 'confirmada', 'pendiente'].includes(c.estado_codigo) && (
                      <Link
                        to={`/historia-clinica/atencion/${c.id_cita}`}
                        className="boton-primario"
                        style={{ minHeight: '34px', padding: '0 0.6rem', fontSize: '0.8rem', backgroundColor: '#F28C1E' }}
                      >
                        Atender
                      </Link>
                    )}
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    className={`boton-chevron-expandir ${isExpanded ? 'rotado' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand();
                    }}
                    aria-label="Ver detalles y acciones"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                </td>
              </>
            )}
            renderFilaMovil={(c, isExpanded, toggleExpand) => (
              <div className="fila-resumen-movil">
                <div className="fila-resumen-movil-linea1">
                  <div style={{ fontWeight: 700, color: '#0A6C84', fontSize: '0.95rem' }}>
                    {c.hora_inicio} - {c.hora_fin}
                  </div>
                  <InsigniaEstado estado={c.estado_codigo} texto={c.estado_nombre} />
                </div>
                <div className="fila-resumen-movil-linea2">
                  <div className="fila-resumen-movil-nombre">
                    <span className="nombre-paciente-destacado">
                      {c.paciente_apellidos}, {c.paciente_nombres}
                    </span>
                    <span className="ci-paciente-sub">
                      {c.especialidad_nombre} • Dr. {c.medico_apellidos}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`boton-chevron-expandir ${isExpanded ? 'rotado' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand();
                    }}
                    aria-label="Expandir opciones"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            )}
            renderDetalle={(c) => (
              <div>
                <div className="panel-detalle-grid">
                  <div className="detalle-dato-item">
                    <span className="detalle-etiqueta">Código de Cita</span>
                    <span className="detalle-valor badge-codigo-turquesa" style={{ display: 'inline-block', width: 'fit-content' }}>
                      {c.codigo_cita}
                    </span>
                  </div>
                  <div className="detalle-dato-item">
                    <span className="detalle-etiqueta">Canal de Reserva</span>
                    <span className="detalle-valor">
                      {c.canal === 'en_linea' ? '🌐 Autoservicio en Línea' : '🏢 Ventanilla / Recepción'}
                    </span>
                  </div>
                  <div className="detalle-dato-item">
                    <span className="detalle-etiqueta">Paciente / Contacto</span>
                    <span className="detalle-valor">
                      {c.paciente_apellidos}, {c.paciente_nombres} (Tel: {c.paciente_telefono || 'No registrado'})
                    </span>
                  </div>
                  <div className="detalle-dato-item">
                    <span className="detalle-etiqueta">Historial Clínico</span>
                    <span className="detalle-valor">
                      Código: {c.codigo_historia || 'S/N'} | CI: {c.paciente_ci || 'S/N'}
                    </span>
                  </div>
                  <div className="detalle-dato-item">
                    <span className="detalle-etiqueta">Motivo de Consulta</span>
                    <span className="detalle-valor">
                      {c.motivo_consulta || 'Sin motivo especificado'}
                    </span>
                  </div>
                  <div className="detalle-dato-item">
                    <span className="detalle-etiqueta">Garantía de Reserva</span>
                    <span className="detalle-valor" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <InsigniaEstadoPago estado={c.estado_pago} monto={c.pago_monto || '50.00'} />
                      {c.nro_transaccion && (
                        <span style={{ fontSize: '0.8rem', color: '#64748B', fontFamily: 'monospace' }}>
                          (Tx: {c.nro_transaccion})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="detalle-dato-item">
                    <span className="detalle-etiqueta">Observaciones / Historial</span>
                    <span className="detalle-valor">
                      {c.observaciones || 'Sin observaciones registradas'}
                    </span>
                  </div>
                </div>

                {/* Botonera de acciones apilada en móvil (min-height: 44px) */}
                <div className="panel-detalle-acciones">
                  {c.estado_codigo === 'pendiente' && (
                    <button
                      type="button"
                      onClick={() => confirmarCita(c.id_cita)}
                      className="boton-secundario"
                    >
                      ✓ Confirmar Cita
                    </button>
                  )}

                  {['pendiente', 'confirmada'].includes(c.estado_codigo) && (
                    <button
                      type="button"
                      onClick={() => marcarAsistencia(c.id_cita, 'en_espera')}
                      className="boton-primario"
                    >
                      📍 Marcar Presente / En Sala
                    </button>
                  )}

                  {['pendiente', 'confirmada', 'en_espera'].includes(c.estado_codigo) && (
                    <button
                      type="button"
                      onClick={() => marcarAsistencia(c.id_cita, 'inasistencia')}
                      className="boton-terciario"
                      style={{ borderColor: '#E53E3E', color: '#E53E3E' }}
                    >
                      ✕ Marcar Inasistencia
                    </button>
                  )}

                  {esMedico && ['en_espera', 'confirmada', 'pendiente'].includes(c.estado_codigo) && (
                    <Link
                      to={`/historia-clinica/atencion/${c.id_cita}`}
                      className="boton-primario btn-accion-destacado"
                    >
                      🩺 Iniciar Atención Médica
                    </Link>
                  )}

                  <Link
                    to={`/historia-clinica/${c.id_paciente}`}
                    className="boton-terciario"
                  >
                    📋 Ver Historial Clínico
                  </Link>

                  {['pendiente', 'confirmada', 'en_espera'].includes(c.estado_codigo) && (
                    <button
                      type="button"
                      onClick={() => abrirModalCancelar(c)}
                      className="boton-peligro"
                    >
                      🗑️ Cancelar Cita
                    </button>
                  )}

                  {/* Corrección administrativa para Administrador en citas cerradas */}
                  {esAdmin && ['atendida', 'inasistencia'].includes(c.estado_codigo) && (
                    <button
                      type="button"
                      onClick={() => abrirModalCorreccionRN16(c)}
                      className="boton-secundario"
                      style={{ border: '2px solid #0A6C84', fontWeight: 700 }}
                    >
                      ⚙️ Corrección Administrativa
                    </button>
                  )}
                </div>
              </div>
            )}
          />
        </div>

        {/* MODAL 1: Cancelación Lógica de Cita */}
        {citaCancelar && (
          <div className="modal-backdrop" style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}>
            <div className="modal-contenido tarjeta" style={{
              maxWidth: '480px',
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#1C2D37' }}>
                Cancelar Cita Médica
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--texto-sec)', marginBottom: '1rem' }}>
                Cita: <b>{citaCancelar.codigo_cita}</b> | Paciente: <b>{citaCancelar.paciente_apellidos}, {citaCancelar.paciente_nombres}</b>
              </p>

              <form onSubmit={ejecutarCancelacion}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Motivo de Cancelación (Obligatorio)
                  </label>
                  <textarea
                    rows="3"
                    value={motivoCancelacion}
                    onChange={(e) => setMotivoCancelacion(e.target.value)}
                    placeholder="Indique la justificación de la cancelación..."
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button
                    type="submit"
                    disabled={procesandoCancelacion}
                    className="boton-peligro"
                    style={{ minHeight: '44px', width: '100%' }}
                  >
                    {procesandoCancelacion ? 'Cancelando cita…' : 'Confirmar Cancelación'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCitaCancelar(null)}
                    disabled={procesandoCancelacion}
                    className="boton-terciario"
                    style={{ minHeight: '44px', width: '100%' }}
                  >
                    Volver Atrás
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: Corrección Administrativa Autorizada RN16 */}
        {citaCorreccionRN16 && (
          <div className="modal-backdrop" style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}>
            <div className="modal-contenido tarjeta" style={{
              maxWidth: '520px',
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>⚙️</span>
                <h3 style={{ margin: 0, color: '#0A6C84' }}>
                  Corrección Autorizada de Cita Cerrada
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>
                Ajuste autorizado para citas concluidas o con inasistencia.
              </p>

              <div style={{
                backgroundColor: '#F1F5F9',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.88rem'
              }}>
                <div><b>Cita:</b> {citaCorreccionRN16.codigo_cita}</div>
                <div><b>Paciente:</b> {citaCorreccionRN16.paciente_apellidos}, {citaCorreccionRN16.paciente_nombres}</div>
                <div style={{ marginTop: '0.25rem' }}>
                  <b>Transición autorizada:</b>{' '}
                  <span style={{ color: '#E53E3E', fontWeight: 700 }}>{citaCorreccionRN16.estado_nombre}</span>
                  {' ➔ '}
                  <span style={{ color: '#0A6C84', fontWeight: 700 }}>
                    {nuevoEstadoRN16 === 'atendida' ? 'Atendida' : 'Inasistencia'}
                  </span>
                </div>
              </div>

              <form onSubmit={ejecutarCorreccionRN16}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Motivo Justificado de Corrección (Obligatorio para Auditoría)
                  </label>
                  <textarea
                    rows="3"
                    value={motivoCorreccionRN16}
                    onChange={(e) => setMotivoCorreccionRN16(e.target.value)}
                    placeholder="Explique detalladamente la causa administrativa de la conmutación..."
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button
                    type="submit"
                    disabled={procesandoCorreccion}
                    className="boton-primario"
                    style={{ minHeight: '44px', width: '100%', backgroundColor: '#0A6C84' }}
                  >
                    {procesandoCorreccion ? 'Aplicando corrección…' : 'Confirmar y Auditar Corrección'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCitaCorreccionRN16(null)}
                    disabled={procesandoCorreccion}
                    className="boton-terciario"
                    style={{ minHeight: '44px', width: '100%' }}
                  >
                    Descartar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </LayoutPrincipal>
  );
}
