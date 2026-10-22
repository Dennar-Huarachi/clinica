import React, { useState, useEffect } from 'react';
import api from '../../../compartido/utilidades/api';
import CampoTexto from '../../../compartido/componentes/CampoTexto';
import CampoSelect from '../../../compartido/componentes/CampoSelect';
import InsigniaEstado from '../../../compartido/componentes/InsigniaEstado';
import Alerta from '../../../compartido/componentes/Alerta';
import LayoutPrincipal from '../../../compartido/layouts/LayoutPrincipal';

export default function PaginaUsuariosRoles() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [termino, setTermino] = useState('');
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formulario, setFormulario] = useState({
    ci: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    id_rol: '',
    nombre_usuario: '',
    contrasena: '',
  });
  const [errores, setErrores] = useState({});

  const cargarDatos = () => {
    setCargando(true);
    Promise.all([
      api.get(`/administracion/usuarios?termino=${encodeURIComponent(termino)}`),
      api.get('/administracion/roles'),
    ])
      .then(([resUsr, resRol]) => {
        setUsuarios(resUsr.data.datos || []);
        setRoles(resRol.data.datos || []);
      })
      .catch((err) => setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al cargar usuarios.' }))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarDatos();
  }, [termino]);

  const abrirModalCrear = () => {
    setUsuarioEditando(null);
    setFormulario({
      ci: '',
      nombres: '',
      apellidos: '',
      correo: '',
      telefono: '',
      id_rol: roles[0]?.id_rol || '',
      nombre_usuario: '',
      contrasena: '',
    });
    setErrores({});
    setModalAbierto(true);
  };

  const abrirModalEditar = (u) => {
    setUsuarioEditando(u);
    setFormulario({
      ci: u.ci || '',
      nombres: u.nombres || '',
      apellidos: u.apellidos || '',
      correo: u.correo || '',
      telefono: u.telefono || '',
      id_rol: u.id_rol || '',
      nombre_usuario: u.nombre_usuario || '',
      contrasena: '',
    });
    setErrores({});
    setModalAbierto(true);
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();
    setErrores({});

    try {
      if (usuarioEditando) {
        await api.put(`/administracion/usuarios/${usuarioEditando.id_usuario}`, formulario);
        setAlerta({ tipo: 'exito', mensaje: 'Usuario actualizado satisfactoriamente.' });
      } else {
        await api.post('/administracion/usuarios', formulario);
        setAlerta({ tipo: 'exito', mensaje: 'Usuario creado satisfactoriamente.' });
      }
      setModalAbierto(false);
      cargarDatos();
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errores) {
        setErrores(err.response.data.errores);
      } else {
        setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al guardar usuario.' });
      }
    }
  };

  const alternarEstado = async (idUsuario) => {
    try {
      const res = await api.patch(`/administracion/usuarios/${idUsuario}/alternar-estado`);
      setAlerta({ tipo: 'exito', mensaje: res.data.mensaje || 'Estado de usuario actualizado.' });
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
              <b>Administración</b> <span>de Usuarios y Roles</span>
            </h2>
            <p style={{ color: 'var(--texto-sec)', fontSize: '0.9rem' }}>
              Gestión de cuentas institucionales y privilegios de acceso al sistema.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ width: '240px' }}>
              <CampoTexto
                etiqueta="Buscar usuario"
                nombre="termino"
                valor={termino}
                alCambiar={(e) => setTermino(e.target.value)}
                marcador="Usuario, nombre o CI…"
              />
            </div>
            <button
              type="button"
              onClick={abrirModalCrear}
              className="boton-primario"
              style={{ minHeight: '44px', marginBottom: '1.25rem' }}
            >
              + Nuevo Usuario
            </button>
          </div>
        </div>

        <Alerta tipo={alerta?.tipo} mensaje={alerta?.mensaje} />

        <div className="tarjeta" style={{ padding: 0 }}>
          <div className="tabla-contenedor">
            <table className="tabla-clinica">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Persona Asignada</th>
                  <th>Cédula</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Último Acceso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                      Cargando usuarios…
                    </td>
                  </tr>
                ) : (
                  usuarios.map((u) => (
                    <tr key={u.id_usuario}>
                      <td style={{ fontWeight: 700, color: 'var(--verde-azulado)' }}>
                        {u.nombre_usuario}
                        <div style={{ fontSize: '0.8rem', color: 'var(--texto-sec)' }}>{u.correo}</div>
                      </td>
                      <td>{u.apellidos}, {u.nombres}</td>
                      <td>{u.ci || '—'}</td>
                      <td>
                        <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                          {u.rol}
                        </span>
                      </td>
                      <td>
                        <InsigniaEstado estado={u.estado} />
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{u.ultimo_acceso || 'Nunca'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => abrirModalEditar(u)}
                            className="boton-terciario"
                            style={{ minHeight: '32px', padding: '0 0.6rem', fontSize: '0.8rem' }}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => alternarEstado(u.id_usuario)}
                            className={u.estado === 'activo' ? 'boton-peligro' : 'boton-primario'}
                            style={{ minHeight: '32px', padding: '0 0.6rem', fontSize: '0.8rem' }}
                          >
                            {u.estado === 'activo' ? 'Desactivar' : 'Activar'}
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

        {/* Modal Formulario Usuario */}
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
            <div className="tarjeta" style={{ maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 className="titulo" style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>
                <b>{usuarioEditando ? 'Editar' : 'Crear'}</b> <span>Usuario</span>
              </h3>

              <form onSubmit={guardarUsuario}>
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

                <CampoTexto
                  etiqueta="Correo Electrónico"
                  nombre="correo"
                  tipo="email"
                  valor={formulario.correo}
                  alCambiar={(e) => setFormulario({ ...formulario, correo: e.target.value })}
                  error={errores.correo?.[0] || errores.correo}
                  requerido
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0 1rem' }}>
                  <CampoSelect
                    etiqueta="Rol Asignado"
                    nombre="id_rol"
                    valor={formulario.id_rol}
                    alCambiar={(e) => setFormulario({ ...formulario, id_rol: e.target.value })}
                    error={errores.id_rol?.[0] || errores.id_rol}
                    opciones={roles.map((r) => ({ valor: r.id_rol, etiqueta: r.nombre }))}
                    requerido
                  />

                  <CampoTexto
                    etiqueta="Nombre de Usuario"
                    nombre="nombre_usuario"
                    valor={formulario.nombre_usuario}
                    alCambiar={(e) => setFormulario({ ...formulario, nombre_usuario: e.target.value })}
                    error={errores.nombre_usuario?.[0] || errores.nombre_usuario}
                    requerido
                  />
                </div>

                <CampoTexto
                  etiqueta={usuarioEditando ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña Inicial'}
                  nombre="contrasena"
                  tipo="password"
                  valor={formulario.contrasena}
                  alCambiar={(e) => setFormulario({ ...formulario, contrasena: e.target.value })}
                  error={errores.contrasena?.[0] || errores.contrasena}
                  requerido={!usuarioEditando}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button type="button" onClick={() => setModalAbierto(false)} className="boton-terciario">
                    Cancelar
                  </button>
                  <button type="submit" className="boton-primario">
                    Guardar Usuario
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
