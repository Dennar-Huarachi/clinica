import React, { useState, useEffect } from 'react';
import api from '../../../compartido/utilidades/api';
import CampoTexto from '../../../compartido/componentes/CampoTexto';
import InsigniaEstado from '../../../compartido/componentes/InsigniaEstado';
import Alerta from '../../../compartido/componentes/Alerta';
import LayoutPrincipal from '../../../compartido/layouts/LayoutPrincipal';

export default function PaginaEspecialidades() {
  const [especialidades, setEspecialidades] = useState([]);
  const [termino, setTermino] = useState('');
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [espEditando, setEspEditando] = useState(null);
  const [formulario, setFormulario] = useState({
    nombre: '',
    descripcion: '',
    duracion_turno_minutos: 15,
  });
  const [errores, setErrores] = useState({});

  const cargarEspecialidades = () => {
    setCargando(true);
    api.get(`/catalogos/especialidades-publicas?termino=${encodeURIComponent(termino)}`)
      .then((res) => setEspecialidades(res.data.datos || []))
      .catch((err) => setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al cargar especialidades.' }))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarEspecialidades();
  }, [termino]);

  const abrirModalCrear = () => {
    setEspEditando(null);
    setFormulario({ nombre: '', descripcion: '', duracion_turno_minutos: 15 });
    setErrores({});
    setModalAbierto(true);
  };

  const abrirModalEditar = (esp) => {
    setEspEditando(esp);
    setFormulario({
      nombre: esp.nombre,
      descripcion: esp.descripcion || '',
      duracion_turno_minutos: esp.duracion_turno_minutos || 15,
    });
    setErrores({});
    setModalAbierto(true);
  };

  const guardarEspecialidad = async (e) => {
    e.preventDefault();
    setErrores({});

    try {
      if (espEditando) {
        await api.put(`/catalogos/especialidades/${espEditando.id_especialidad}`, formulario);
        setAlerta({ tipo: 'exito', mensaje: 'Especialidad médica actualizada.' });
      } else {
        await api.post('/catalogos/especialidades', formulario);
        setAlerta({ tipo: 'exito', mensaje: 'Especialidad creada con éxito.' });
      }
      setModalAbierto(false);
      cargarEspecialidades();
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errores) {
        setErrores(err.response.data.errores);
      } else {
        setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al guardar.' });
      }
    }
  };

  const alternarEstado = async (id) => {
    try {
      const res = await api.patch(`/catalogos/especialidades/${id}/alternar-estado`);
      setAlerta({ tipo: 'exito', mensaje: res.data.mensaje || 'Estado actualizado.' });
      cargarEspecialidades();
    } catch (err) {
      setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al cambiar estado.' });
    }
  };

  return (
    <LayoutPrincipal>
      <div style={{ maxWidth: '950px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 className="titulo">
              <b>Catálogo</b> <span>de Especialidades Médicas</span>
            </h2>
            <p style={{ color: 'var(--texto-sec)', fontSize: '0.9rem' }}>
              Gestión de ramas médicas y configuración de duración estándar de consulta.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ width: '220px' }}>
              <CampoTexto
                etiqueta="Buscar"
                nombre="termino"
                valor={termino}
                alCambiar={(e) => setTermino(e.target.value)}
                marcador="Buscar especialidad…"
              />
            </div>
            <button
              type="button"
              onClick={abrirModalCrear}
              className="boton-primario"
              style={{ minHeight: '44px', marginBottom: '1.25rem' }}
            >
              + Nueva Especialidad
            </button>
          </div>
        </div>

        <Alerta tipo={alerta?.tipo} mensaje={alerta?.mensaje} />

        <div className="tarjeta" style={{ padding: 0 }}>
          <div className="tabla-contenedor">
            <table className="tabla-clinica">
              <thead>
                <tr>
                  <th>Especialidad</th>
                  <th>Descripción</th>
                  <th>Duración Turno</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                      Cargando catálogo…
                    </td>
                  </tr>
                ) : (
                  especialidades.map((esp) => (
                    <tr key={esp.id_especialidad}>
                      <td><strong style={{ color: 'var(--verde-azulado)' }}>{esp.nombre}</strong></td>
                      <td style={{ fontSize: '0.875rem' }}>{esp.descripcion || '—'}</td>
                      <td>{esp.duracion_turno_minutos} minutos</td>
                      <td>
                        <InsigniaEstado estado={esp.estado} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => abrirModalEditar(esp)}
                            className="boton-terciario"
                            style={{ minHeight: '32px', padding: '0 0.6rem', fontSize: '0.8rem' }}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => alternarEstado(esp.id_especialidad)}
                            className={esp.estado === 'activo' ? 'boton-peligro' : 'boton-primario'}
                            style={{ minHeight: '32px', padding: '0 0.6rem', fontSize: '0.8rem' }}
                          >
                            {esp.estado === 'activo' ? 'Desactivar' : 'Activar'}
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

        {/* Modal */}
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
            <div className="tarjeta" style={{ maxWidth: '500px', width: '100%' }}>
              <h3 className="titulo" style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>
                <b>{espEditando ? 'Editar' : 'Nueva'}</b> <span>Especialidad</span>
              </h3>

              <form onSubmit={guardarEspecialidad}>
                <CampoTexto
                  etiqueta="Nombre de la Especialidad"
                  nombre="nombre"
                  valor={formulario.nombre}
                  alCambiar={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                  error={errores.nombre?.[0] || errores.nombre}
                  requerido
                />

                <CampoTexto
                  etiqueta="Duración Estándar de Consulta (Minutos)"
                  nombre="duracion_turno_minutos"
                  tipo="number"
                  valor={formulario.duracion_turno_minutos}
                  alCambiar={(e) => setFormulario({ ...formulario, duracion_turno_minutos: Number(e.target.value) })}
                  error={errores.duracion_turno_minutos?.[0] || errores.duracion_turno_minutos}
                  requerido
                />

                <CampoTexto
                  etiqueta="Descripción / Alcance"
                  nombre="descripcion"
                  valor={formulario.descripcion}
                  alCambiar={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
                  filas={3}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button type="button" onClick={() => setModalAbierto(false)} className="boton-terciario">
                    Cancelar
                  </button>
                  <button type="submit" className="boton-primario">
                    Guardar Especialidad
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
