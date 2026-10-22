import React, { useState, useEffect } from 'react';
import api from '../../../compartido/utilidades/api';
import CampoTexto from '../../../compartido/componentes/CampoTexto';
import InsigniaEstado from '../../../compartido/componentes/InsigniaEstado';
import Alerta from '../../../compartido/componentes/Alerta';
import LayoutPrincipal from '../../../compartido/layouts/LayoutPrincipal';

export default function PaginaMedicos() {
  const [medicos, setMedicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [termino, setTermino] = useState('');
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [medicoEditando, setMedicoEditando] = useState(null);
  const [formulario, setFormulario] = useState({
    ci: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    nro_matricula: '',
    biografia: '',
    especialidades: [],
  });
  const [errores, setErrores] = useState({});

  const cargarDatos = () => {
    setCargando(true);
    Promise.all([
      api.get(`/catalogos/medicos-publicos?termino=${encodeURIComponent(termino)}`),
      api.get('/catalogos/especialidades-publicas'),
    ])
      .then(([resMed, resEsp]) => {
        setMedicos(resMed.data.datos || []);
        setEspecialidades(resEsp.data.datos || []);
      })
      .catch((err) => setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al cargar médicos.' }))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarDatos();
  }, [termino]);

  const abrirModalCrear = () => {
    setMedicoEditando(null);
    setFormulario({
      ci: '',
      nombres: '',
      apellidos: '',
      correo: '',
      telefono: '',
      nro_matricula: '',
      biografia: '',
      especialidades: [],
    });
    setErrores({});
    setModalAbierto(true);
  };

  const abrirModalEditar = (m) => {
    setMedicoEditando(m);
    setFormulario({
      ci: m.ci || '',
      nombres: m.nombres || '',
      apellidos: m.apellidos || '',
      correo: m.correo || '',
      telefono: m.telefono || '',
      nro_matricula: m.nro_matricula || '',
      biografia: m.biografia || '',
      especialidades: (m.especialidades || []).map((e) => e.id_especialidad),
    });
    setErrores({});
    setModalAbierto(true);
  };

  const manejarCheckboxEspecialidad = (idEspecialidad) => {
    setFormulario((prev) => {
      const existe = prev.especialidades.includes(idEspecialidad);
      if (existe) {
        return { ...prev, especialidades: prev.especialidades.filter((id) => id !== idEspecialidad) };
      } else {
        return { ...prev, especialidades: [...prev.especialidades, idEspecialidad] };
      }
    });
  };

  const guardarMedico = async (e) => {
    e.preventDefault();
    setErrores({});

    if (formulario.especialidades.length === 0) {
      setErrores({ especialidades: 'Debe seleccionar al menos una especialidad médica.' });
      return;
    }

    try {
      if (medicoEditando) {
        await api.put(`/catalogos/medicos/${medicoEditando.id_medico}`, formulario);
        setAlerta({ tipo: 'exito', mensaje: 'Médico actualizado exitosamente.' });
      } else {
        await api.post('/catalogos/medicos', formulario);
        setAlerta({ tipo: 'exito', mensaje: 'Médico registrado exitosamente.' });
      }
      setModalAbierto(false);
      cargarDatos();
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errores) {
        setErrores(err.response.data.errores);
      } else {
        setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al guardar médico.' });
      }
    }
  };

  const alternarEstado = async (idMedico) => {
    try {
      const res = await api.patch(`/catalogos/medicos/${idMedico}/alternar-estado`);
      setAlerta({ tipo: 'exito', mensaje: res.data.mensaje || 'Estado del médico actualizado.' });
      cargarDatos();
    } catch (err) {
      setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al cambiar estado.' });
    }
  };

  return (
    <LayoutPrincipal>
      <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 className="titulo">
              <b>Cuerpo</b> <span>Médico de la Clínica</span>
            </h2>
            <p style={{ color: 'var(--texto-sec)', fontSize: '0.9rem' }}>
              Gestión de profesionales de salud, matrículas colegiadas y asignación de especialidades.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ width: '220px' }}>
              <CampoTexto
                etiqueta="Buscar"
                nombre="termino"
                valor={termino}
                alCambiar={(e) => setTermino(e.target.value)}
                marcador="Buscar médico…"
              />
            </div>
            <button
              type="button"
              onClick={abrirModalCrear}
              className="boton-primario"
              style={{ minHeight: '44px', marginBottom: '1.25rem' }}
            >
              + Nuevo Médico
            </button>
          </div>
        </div>

        <Alerta tipo={alerta?.tipo} mensaje={alerta?.mensaje} />

        <div className="tarjeta" style={{ padding: 0 }}>
          <div className="tabla-contenedor">
            <table className="tabla-clinica">
              <thead>
                <tr>
                  <th>Matrícula</th>
                  <th>Médico</th>
                  <th>Especialidades Asignadas</th>
                  <th>Contacto</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                      Cargando cuerpo médico…
                    </td>
                  </tr>
                ) : (
                  medicos.map((m) => (
                    <tr key={m.id_medico}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{m.nro_matricula}</td>
                      <td>
                        <strong>Dr. {m.apellidos}, {m.nombres}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--texto-sec)' }}>CI: {m.ci || '—'}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                          {(m.especialidades || []).map((e) => (
                            <span
                              key={e.id_especialidad}
                              style={{
                                background: '#EDF6F8',
                                color: 'var(--verde-azulado)',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                              }}
                            >
                              {e.nombre}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.875rem' }}>
                        <div>{m.telefono || '—'}</div>
                        <div style={{ color: 'var(--texto-sec)', fontSize: '0.8rem' }}>{m.correo}</div>
                      </td>
                      <td>
                        <InsigniaEstado estado={m.estado} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => abrirModalEditar(m)}
                            className="boton-terciario"
                            style={{ minHeight: '32px', padding: '0 0.6rem', fontSize: '0.8rem' }}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => alternarEstado(m.id_medico)}
                            className={m.estado === 'activo' ? 'boton-peligro' : 'boton-primario'}
                            style={{ minHeight: '32px', padding: '0 0.6rem', fontSize: '0.8rem' }}
                            title="Desactivación lógica (prohibido borrado físico)"
                          >
                            {m.estado === 'activo' ? 'Desactivar' : 'Activar'}
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

        {/* Modal Formulario Médico */}
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
            <div className="tarjeta" style={{ maxWidth: '620px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 className="titulo" style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>
                <b>{medicoEditando ? 'Editar' : 'Registrar'}</b> <span>Médico</span>
              </h3>

              <form onSubmit={guardarMedico}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0 1rem' }}>
                  <CampoTexto
                    etiqueta="Cédula de Identidad"
                    nombre="ci"
                    valor={formulario.ci}
                    alCambiar={(e) => setFormulario({ ...formulario, ci: e.target.value })}
                    error={errores.ci?.[0] || errores.ci}
                    requerido
                  />
                  <CampoTexto
                    etiqueta="Nro. Matrícula Profesional"
                    nombre="nro_matricula"
                    valor={formulario.nro_matricula}
                    alCambiar={(e) => setFormulario({ ...formulario, nro_matricula: e.target.value })}
                    error={errores.nro_matricula?.[0] || errores.nro_matricula}
                    requerido
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0 1rem' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0 1rem' }}>
                  <CampoTexto
                    etiqueta="Correo Electrónico"
                    nombre="correo"
                    tipo="email"
                    valor={formulario.correo}
                    alCambiar={(e) => setFormulario({ ...formulario, correo: e.target.value })}
                    error={errores.correo?.[0] || errores.correo}
                    requerido
                  />
                  <CampoTexto
                    etiqueta="Teléfono"
                    nombre="telefono"
                    valor={formulario.telefono}
                    alCambiar={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
                  />
                </div>

                {/* Especialidades */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="etiqueta-campo" style={{ display: 'block', marginBottom: '0.4rem' }}>
                    Especialidades Médicas Asignadas <span style={{ color: 'var(--cancelada)' }}>*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem', background: '#F8FCFD', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CFE2E8' }}>
                    {especialidades.map((esp) => (
                      <label key={esp.id_especialidad} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formulario.especialidades.includes(esp.id_especialidad)}
                          onChange={() => manejarCheckboxEspecialidad(esp.id_especialidad)}
                        />
                        {esp.nombre}
                      </label>
                    ))}
                  </div>
                  {errores.especialidades && (
                    <span className="mensaje-error-campo">{errores.especialidades}</span>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button type="button" onClick={() => setModalAbierto(false)} className="boton-terciario">
                    Cancelar
                  </button>
                  <button type="submit" className="boton-primario">
                    Guardar Médico
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
