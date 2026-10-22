import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../compartido/utilidades/api';
import CampoTexto from '../../../compartido/componentes/CampoTexto';
import CampoSelect from '../../../compartido/componentes/CampoSelect';
import InsigniaEstado from '../../../compartido/componentes/InsigniaEstado';
import Alerta from '../../../compartido/componentes/Alerta';
import LayoutPrincipal from '../../../compartido/layouts/LayoutPrincipal';

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
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 className="titulo">
              <b>Gestión</b> <span>de Pacientes</span>
            </h2>
            <p style={{ color: 'var(--texto-sec)', fontSize: '0.9rem' }}>
              Padrón de pacientes, historias clínicas y fichas de salud.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ width: '260px' }}>
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
              className="boton-primario"
              style={{ minHeight: '44px', marginBottom: '1.25rem' }}
            >
              + Nuevo Paciente
            </button>
          </div>
        </div>

        <Alerta tipo={alerta?.tipo} mensaje={alerta?.mensaje} />

        <div className="tarjeta" style={{ padding: 0 }}>
          <div className="tabla-contenedor">
            <table className="tabla-clinica">
              <thead>
                <tr>
                  <th>Historia</th>
                  <th>Cédula</th>
                  <th>Paciente</th>
                  <th>Contacto</th>
                  <th>Grupo Sang.</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                      Cargando pacientes…
                    </td>
                  </tr>
                ) : pacientes.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--texto-sec)' }}>
                      No se encontraron pacientes con el criterio especificado.
                    </td>
                  </tr>
                ) : (
                  pacientes.map((p) => (
                    <tr key={p.id_paciente}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--verde-azulado)' }}>
                        {p.codigo_historia}
                      </td>
                      <td>{p.ci || '—'}</td>
                      <td>
                        <strong>{p.apellidos}, {p.nombres}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--texto-sec)' }}>
                          {p.sexo === 'M' ? 'Masculino' : 'Femenino'} | Nac: {p.fecha_nacimiento || '—'}
                        </div>
                      </td>
                      <td>
                        <div>{p.telefono || 'Sin teléfono'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--texto-sec)' }}>{p.correo || '—'}</div>
                      </td>
                      <td>{p.grupo_sanguineo || '—'}</td>
                      <td>
                        <InsigniaEstado estado={p.estado} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <Link
                            to={`/historia-clinica/${p.id_paciente}`}
                            className="boton-secundario"
                            style={{ minHeight: '32px', padding: '0 0.6rem', fontSize: '0.8rem' }}
                          >
                            Historia
                          </Link>

                          <button
                            type="button"
                            onClick={() => abrirModalEditar(p.id_paciente)}
                            className="boton-terciario"
                            style={{ minHeight: '32px', padding: '0 0.6rem', fontSize: '0.8rem' }}
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => alternarEstadoLogico(p.id_paciente)}
                            className={p.estado === 'activo' ? 'boton-peligro' : 'boton-primario'}
                            style={{ minHeight: '32px', padding: '0 0.6rem', fontSize: '0.8rem' }}
                            title="Cambio de estado lógico (prohibido borrado físico)"
                          >
                            {p.estado === 'activo' ? 'Desactivar' : 'Activar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

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
