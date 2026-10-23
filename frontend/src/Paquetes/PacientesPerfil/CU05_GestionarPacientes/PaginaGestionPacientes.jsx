import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../compartido/utilidades/api';
import CampoTexto from '../../../compartido/componentes/CampoTexto';
import CampoSelect from '../../../compartido/componentes/CampoSelect';
import InsigniaEstado from '../../../compartido/componentes/InsigniaEstado';
import Alerta from '../../../compartido/componentes/Alerta';
import LayoutPrincipal from '../../../compartido/layouts/LayoutPrincipal';
import TablaExpandible from '../../../comun/componentes/TablaExpandible';

export default function PaginaGestionPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [termino, setTermino] = useState('');
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState(null);

  // Modal de creación / edición
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pacienteEditando, setPacienteEditando] = useState(null);
  const [formulario, setFormulario] = useState({
    ci: '',
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '',
    sexo: 'M',
    telefono: '',
    correo: '',
    direccion: '',
    grupo_sanguineo: 'O+',
    alergias: '',
    enfermedades_cronicas: '',
  });
  const [errores, setErrores] = useState({});

  const cargarPacientes = () => {
    setCargando(true);
    api.get(`/pacientes?termino=${encodeURIComponent(termino)}`)
      .then((res) => setPacientes(res.data.datos || []))
      .catch((err) => setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al cargar pacientes.' }))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarPacientes();
  }, [termino]);

  const abrirModalCrear = () => {
    setPacienteEditando(null);
    setFormulario({
      ci: '',
      nombres: '',
      apellidos: '',
      fecha_nacimiento: '',
      sexo: 'M',
      telefono: '',
      correo: '',
      direccion: '',
      grupo_sanguineo: 'O+',
      alergias: '',
      enfermedades_cronicas: '',
    });
    setErrores({});
    setModalAbierto(true);
  };

  const abrirModalEditar = async (idPaciente) => {
    try {
      const res = await api.get(`/pacientes/${idPaciente}`);
      const p = res.data.datos;
      setPacienteEditando(p);
      setFormulario({
        ci: p.ci || '',
        nombres: p.nombres || '',
        apellidos: p.apellidos || '',
        fecha_nacimiento: p.fecha_nacimiento || '',
        sexo: p.sexo || 'M',
        telefono: p.telefono || '',
        correo: p.correo || '',
        direccion: p.direccion || '',
        grupo_sanguineo: p.grupo_sanguineo || 'O+',
        alergias: p.alergias || '',
        enfermedades_cronicas: p.enfermedades_cronicas || '',
      });
      setErrores({});
      setModalAbierto(true);
    } catch {
      setAlerta({ tipo: 'error', mensaje: 'No se pudo cargar la información del paciente.' });
    }
  };

  const guardarPaciente = async (e) => {
    e.preventDefault();
    setErrores({});

    try {
      if (pacienteEditando) {
        await api.put(`/pacientes/${pacienteEditando.id_paciente}`, formulario);
        setAlerta({ tipo: 'exito', mensaje: 'Paciente actualizado correctamente.' });
      } else {
        await api.post('/pacientes', formulario);
        setAlerta({ tipo: 'exito', mensaje: 'Paciente registrado exitosamente.' });
      }
      setModalAbierto(false);
      cargarPacientes();
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errores) {
        setErrores(err.response.data.errores);
      } else {
        setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al guardar paciente.' });
      }
    }
  };

  const alternarEstadoLogico = async (idPaciente) => {
    try {
      const res = await api.patch(`/pacientes/${idPaciente}/alternar-estado`);
      setAlerta({ tipo: 'exito', mensaje: res.data.mensaje || 'Estado lógico actualizado.' });
      cargarPacientes();
    } catch (err) {
      setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al cambiar estado.' });
    }
  };

  return (
    <LayoutPrincipal>
      <div className="gestion-pacientes-contenedor">
        <div className="gestion-pacientes-cabecera">
          <div>
            <h2 className="titulo">
              <b>Gestión</b> <span>de Pacientes</span>
            </h2>
            <p style={{ color: 'var(--texto-sec)', fontSize: '0.9rem' }}>
              Padrón de pacientes, historias clínicas y fichas de salud.
            </p>
          </div>

          <div className="gestion-pacientes-barra-acciones">
            <div className="gestion-pacientes-buscador">
              <CampoTexto
                etiqueta="Buscar paciente"
                nombre="termino"
                valor={termino}
                alCambiar={(e) => setTermino(e.target.value)}
                marcador="Buscar por CI, nombre o historia…"
              />
            </div>
            <button
              type="button"
              onClick={abrirModalCrear}
              className="boton-primario gestion-pacientes-btn-nuevo"
              style={{ minHeight: '44px' }}
            >
              + Nuevo Paciente
            </button>
          </div>
        </div>

        <Alerta tipo={alerta?.tipo} mensaje={alerta?.mensaje} />

        {/* Padrón de Pacientes con TablaExpandible (Tarea 4) */}
        <TablaExpandible
          columnas={['Código Paciente', 'Nombre Completo', 'Teléfono', 'Estado', '']}
          datos={pacientes}
          cargando={cargando}
          obtenerClaveFila={(p) => p.id_paciente}
          mensajeVacio="No se encontraron pacientes registrados con el criterio especificado."
          /* 1. Vista Desktop (> 640px): Tabla estándar con todas las columnas */
          renderFilaPrincipal={(p, isExpanded, toggleExpand) => (
            <>
              <td>
                <span className="badge-codigo-turquesa">
                  {p.codigo_historia}
                </span>
              </td>
              <td>
                <strong style={{ color: '#1C2D37' }}>{p.apellidos}, {p.nombres}</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--texto-sec)' }}>
                  CI: {p.ci || '—'}
                </div>
              </td>
              <td>
                <div>{p.telefono || 'Sin teléfono'}</div>
              </td>
              <td>
                <InsigniaEstado estado={p.estado} />
              </td>
              <td style={{ width: '44px', textAlign: 'center' }}>
                <button
                  type="button"
                  className={`boton-chevron-expandir ${isExpanded ? 'rotado' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand();
                  }}
                  title={isExpanded ? 'Colapsar detalles' : 'Expandir información'}
                  aria-label="Expandir detalles"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </td>
            </>
          )}
          /* 2. Vista Móvil (<= 640px): 100% vertical, cabecera de 2 líneas (Línea 1: Código + Estado, Línea 2: Nombre + Chevron) */
          renderFilaMovil={(p, isExpanded, toggleExpand) => (
            <div className="fila-resumen-movil">
              {/* Línea 1 (Arriba): Código del paciente (badge turquesa) y a la derecha el Estado ("ACTIVO" en verde) */}
              <div className="fila-resumen-movil-linea1">
                <span className="badge-codigo-turquesa">
                  {p.codigo_historia}
                </span>
                <InsigniaEstado estado={p.estado} />
              </div>

              {/* Línea 2 (Abajo): Nombre completo del paciente en negrita y la flecha/chevron (▲ / ▼) a la derecha */}
              <div className="fila-resumen-movil-linea2">
                <div className="fila-resumen-movil-nombre">
                  <strong className="nombre-paciente-destacado">{p.apellidos}, {p.nombres}</strong>
                  {p.ci && <span className="ci-paciente-sub">CI: {p.ci}</span>}
                </div>
                <button
                  type="button"
                  className={`boton-chevron-expandir ${isExpanded ? 'rotado' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand();
                  }}
                  title={isExpanded ? 'Colapsar detalles' : 'Expandir información'}
                  aria-label={isExpanded ? 'Colapsar detalles' : 'Expandir información'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          /* 3. Subpanel Expandido: Grid 1 columna + Botonera de acciones apilada accesible (min-height: 44px) */
          renderDetalle={(p) => {
            const edadTexto = (() => {
              if (!p.fecha_nacimiento) return '—';
              const nac = new Date(p.fecha_nacimiento);
              if (isNaN(nac.getTime())) return '—';
              const hoy = new Date();
              let edad = hoy.getFullYear() - nac.getFullYear();
              const m = hoy.getMonth() - nac.getMonth();
              if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
              return `${p.fecha_nacimiento} (${edad} años)`;
            })();

            return (
              <>
                <div className="panel-detalle-grid">
                  <div className="detalle-dato-item">
                    <span className="detalle-etiqueta">Cédula de Identidad (CI)</span>
                    <span className="detalle-valor">{p.ci || 'Sin registrar'}</span>
                  </div>
                  <div className="detalle-dato-item">
                    <span className="detalle-etiqueta">Teléfono de Contacto</span>
                    <span className="detalle-valor">{p.telefono || 'Sin teléfono registrado'}</span>
                  </div>
                  <div className="detalle-dato-item">
                    <span className="detalle-etiqueta">Sexo</span>
                    <span className="detalle-valor">
                      {p.sexo === 'M' ? 'Masculino' : p.sexo === 'F' ? 'Femenino' : '—'}
                    </span>
                  </div>
                  <div className="detalle-dato-item">
                    <span className="detalle-etiqueta">Fecha de Nacimiento / Edad</span>
                    <span className="detalle-valor">{edadTexto}</span>
                  </div>
                  <div className="detalle-dato-item">
                    <span className="detalle-etiqueta">Correo Electrónico</span>
                    <span className="detalle-valor">{p.correo || 'Sin correo electrónico'}</span>
                  </div>
                  <div className="detalle-dato-item">
                    <span className="detalle-etiqueta">Dirección de Domicilio</span>
                    <span className="detalle-valor">{p.direccion || 'Sin dirección declarada'}</span>
                  </div>
                  <div className="detalle-dato-item">
                    <span className="detalle-etiqueta">Grupo Sanguíneo</span>
                    <span className="detalle-valor" style={{ color: 'var(--turquesa)', fontWeight: 700 }}>
                      {p.grupo_sanguineo || 'Sin determinar'}
                    </span>
                  </div>
                  <div className="detalle-dato-item">
                    <span className="detalle-etiqueta">Alergias Declaradas</span>
                    <span className="detalle-valor" style={{ color: p.alergias ? '#DC2626' : 'inherit' }}>
                      {p.alergias || 'Ninguna registrada'}
                    </span>
                  </div>
                  <div className="detalle-dato-item">
                    <span className="detalle-etiqueta">Contacto de Emergencia</span>
                    <span className="detalle-valor">
                      {p.contacto_nombre ? (
                        `${p.contacto_nombre} (${p.contacto_relacion || 'Contacto'}) · Tel: ${p.contacto_telefono || '—'}`
                      ) : (
                        'No asignado'
                      )}
                    </span>
                  </div>
                </div>

                <div className="panel-detalle-acciones">
                  {/* Botón principal de acción ("Nueva Cita") destacado con fondo naranja (#F28C1E) */}
                  <Link
                    to="/citas/reserva"
                    state={{ pacienteId: p.id_paciente }}
                    className="boton-primario btn-accion-destacado"
                    style={{ minHeight: '44px' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                      <line x1="12" y1="14" x2="12" y2="18" />
                      <line x1="10" y1="16" x2="14" y2="16" />
                    </svg>
                    Nueva Cita
                  </Link>

                  {/* Botón secundario Historia Clínica */}
                  <Link
                    to={`/historia-clinica/${p.id_paciente}`}
                    className="boton-secundario"
                    style={{ minHeight: '44px' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      <line x1="12" y1="11" x2="12" y2="17" />
                      <line x1="9" y1="14" x2="15" y2="14" />
                    </svg>
                    Historia Clínica
                  </Link>

                  {/* Botón terciario Editar Ficha */}
                  <button
                    type="button"
                    onClick={() => abrirModalEditar(p.id_paciente)}
                    className="boton-terciario"
                    style={{ minHeight: '44px' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Editar Ficha
                  </button>

                  {/* Botón Desactivar / Activar Paciente */}
                  <button
                    type="button"
                    onClick={() => alternarEstadoLogico(p.id_paciente)}
                    className={p.estado === 'activo' ? 'boton-peligro' : 'boton-primario'}
                    style={{ minHeight: '44px' }}
                    title="Cambio de estado lógico (prohibido borrado físico)"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    </svg>
                    {p.estado === 'activo' ? 'Desactivar Paciente' : 'Activar Paciente'}
                  </button>
                </div>
              </>
            );
          }}
        />

        <style>{`
          .gestion-pacientes-contenedor {
            max-width: 1100px;
            margin: 0 auto;
            width: 100%;
            box-sizing: border-box;
            overflow-x: hidden;
          }

          .gestion-pacientes-cabecera {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
            margin-bottom: 1.5rem;
            width: 100%;
            box-sizing: border-box;
          }

          .gestion-pacientes-barra-acciones {
            display: flex;
            gap: 0.75rem;
            align-items: flex-end;
            flex-wrap: wrap;
          }

          .gestion-pacientes-buscador {
            width: 260px;
          }

          @media (max-width: 640px) {
            .gestion-pacientes-cabecera {
              flex-direction: column;
              align-items: stretch;
              gap: 1rem;
              margin-bottom: 1.25rem;
            }

            .gestion-pacientes-barra-acciones {
              flex-direction: column;
              align-items: stretch;
              width: 100%;
              gap: 0.75rem;
            }

            .gestion-pacientes-buscador {
              width: 100% !important;
            }

            .gestion-pacientes-btn-nuevo {
              width: 100% !important;
              margin-bottom: 0 !important;
            }
          }
        `}</style>

        {/* Modal Formulario Paciente */}
        {modalAbierto && (
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
            <div
              className="tarjeta"
              style={{
                maxWidth: '650px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <h3 className="titulo" style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>
                <b>{pacienteEditando ? 'Editar' : 'Registrar'}</b> <span>Paciente</span>
              </h3>

              <form onSubmit={guardarPaciente}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0 1rem' }}>
                  <CampoTexto
                    etiqueta="Cédula de Identidad"
                    nombre="ci"
                    valor={formulario.ci}
                    alCambiar={(e) => setFormulario({ ...formulario, ci: e.target.value })}
                    error={errores.ci?.[0] || errores.ci}
                    requerido
                  />
                  <CampoTexto
                    etiqueta="Teléfono"
                    nombre="telefono"
                    valor={formulario.telefono}
                    alCambiar={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
                    error={errores.telefono?.[0] || errores.telefono}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0 1rem' }}>
                  <CampoTexto
                    etiqueta="Nombres"
                    nombre="nombres"
                    valor={formulario.nombres}
                    alCambiar={(e) => setFormulario({ ...formulario, nombres: e.target.value })}
                    error={errores.nombres?.[0] || errores.nombres}
                    requerido
                  />
                  <CampoTexto
                    etiqueta="Apellidos"
                    nombre="apellidos"
                    valor={formulario.apellidos}
                    alCambiar={(e) => setFormulario({ ...formulario, apellidos: e.target.value })}
                    error={errores.apellidos?.[0] || errores.apellidos}
                    requerido
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0 1rem' }}>
                  <CampoTexto
                    etiqueta="Fecha Nacimiento"
                    nombre="fecha_nacimiento"
                    tipo="date"
                    valor={formulario.fecha_nacimiento}
                    alCambiar={(e) => setFormulario({ ...formulario, fecha_nacimiento: e.target.value })}
                    error={errores.fecha_nacimiento?.[0] || errores.fecha_nacimiento}
                  />
                  <CampoSelect
                    etiqueta="Sexo"
                    nombre="sexo"
                    valor={formulario.sexo}
                    alCambiar={(e) => setFormulario({ ...formulario, sexo: e.target.value })}
                    opciones={[{ valor: 'M', etiqueta: 'Masculino' }, { valor: 'F', etiqueta: 'Femenino' }]}
                  />
                  <CampoSelect
                    etiqueta="Grupo Sang."
                    nombre="grupo_sanguineo"
                    valor={formulario.grupo_sanguineo}
                    alCambiar={(e) => setFormulario({ ...formulario, grupo_sanguineo: e.target.value })}
                    opciones={[
                      { valor: 'O+', etiqueta: 'O+' },
                      { valor: 'O-', etiqueta: 'O-' },
                      { valor: 'A+', etiqueta: 'A+' },
                      { valor: 'A-', etiqueta: 'A-' },
                      { valor: 'B+', etiqueta: 'B+' },
                      { valor: 'B-', etiqueta: 'B-' },
                      { valor: 'AB+', etiqueta: 'AB+' },
                      { valor: 'AB-', etiqueta: 'AB-' },
                    ]}
                  />
                </div>

                <CampoTexto
                  etiqueta="Correo Electrónico"
                  nombre="correo"
                  tipo="email"
                  valor={formulario.correo}
                  alCambiar={(e) => setFormulario({ ...formulario, correo: e.target.value })}
                  error={errores.correo?.[0] || errores.correo}
                />

                <CampoTexto
                  etiqueta="Dirección"
                  nombre="direccion"
                  valor={formulario.direccion}
                  alCambiar={(e) => setFormulario({ ...formulario, direccion: e.target.value })}
                />

                <CampoTexto
                  etiqueta="Alergias Conocidas"
                  nombre="alergias"
                  valor={formulario.alergias}
                  alCambiar={(e) => setFormulario({ ...formulario, alergias: e.target.value })}
                  marcador="Ej: Penicilina, sulfas, látex"
                  filas={2}
                />

                <CampoTexto
                  etiqueta="Enfermedades Crónicas"
                  nombre="enfermedades_cronicas"
                  valor={formulario.enfermedades_cronicas}
                  alCambiar={(e) => setFormulario({ ...formulario, enfermedades_cronicas: e.target.value })}
                  marcador="Ej: Hipertensión arterial, diabetes tipo 2"
                  filas={2}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setModalAbierto(false)}
                    className="boton-terciario"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="boton-primario"
                  >
                    Guardar Paciente
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
