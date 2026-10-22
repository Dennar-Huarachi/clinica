import React, { useState, useEffect } from 'react';
import api from '../../../compartido/utilidades/api';
import CampoTexto from '../../../compartido/componentes/CampoTexto';
import Alerta from '../../../compartido/componentes/Alerta';
import LayoutPrincipal from '../../../compartido/layouts/LayoutPrincipal';

export default function PaginaMiPerfil() {
  const [datos, setDatos] = useState(null);
  const [formulario, setFormulario] = useState({
    correo: '',
    telefono: '',
    direccion: '',
    contacto_nombre: '',
    contacto_relacion: '',
    contacto_telefono: '',
  });

  const [formContrasena, setFormContrasena] = useState({
    contrasena_actual: '',
    contrasena_nueva: '',
    confirmacion_contrasena: '',
  });

  const [errores, setErrores] = useState({});
  const [alerta, setAlerta] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargarPerfil = () => {
    api.get('/perfil/mi-perfil')
      .then((res) => {
        const d = res.data.datos;
        setDatos(d);
        setFormulario({
          correo: d.persona?.correo || d.usuario?.correo || '',
          telefono: d.persona?.telefono || '',
          direccion: d.persona?.direccion || '',
          contacto_nombre: d.contacto_emergencia?.nombre_completo || '',
          contacto_relacion: d.contacto_emergencia?.relacion || '',
          contacto_telefono: d.contacto_emergencia?.telefono || '',
        });
      })
      .catch((err) => setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al cargar perfil.' }));
  };

  useEffect(() => {
    cargarPerfil();
  }, []);

  const guardarDatos = async (e) => {
    e.preventDefault();
    setAlerta(null);
    setErrores({});
    setGuardando(true);

    try {
      await api.put('/perfil/mi-perfil', formulario);
      setAlerta({ tipo: 'exito', mensaje: 'Información de perfil actualizada exitosamente.' });
      cargarPerfil();
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errores) {
        setErrores(err.response.data.errores);
      } else {
        setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al actualizar perfil.' });
      }
    } finally {
      setGuardando(false);
    }
  };

  const cambiarContrasena = async (e) => {
    e.preventDefault();
    setAlerta(null);
    setErrores({});

    try {
      await api.post('/acceso/cambiar-contrasena', formContrasena);
      setAlerta({ tipo: 'exito', mensaje: 'Contraseña actualizada correctamente.' });
      setFormContrasena({ contrasena_actual: '', contrasena_nueva: '', confirmacion_contrasena: '' });
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errores) {
        setErrores(err.response.data.errores);
      } else {
        setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al cambiar contraseña.' });
      }
    }
  };

  if (!datos) {
    return (
      <LayoutPrincipal>
        <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando perfil de usuario…</div>
      </LayoutPrincipal>
    );
  }

  return (
    <LayoutPrincipal>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 className="titulo" style={{ marginBottom: '0.25rem' }}>
          <b>Mi</b> <span>Perfil y Seguridad</span>
        </h2>
        <p style={{ color: 'var(--texto-sec)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Actualiza tus datos de contacto y credenciales de acceso institucional.
        </p>

        <Alerta tipo={alerta?.tipo} mensaje={alerta?.mensaje} />

        <div className="tarjeta" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--verde-azulado)', marginBottom: '1rem' }}>
            Información Personal ({datos.usuario?.rol})
          </h3>

          <form onSubmit={guardarDatos}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0 1rem' }}>
              <CampoTexto
                etiqueta="Nombres y Apellidos"
                nombre="nombre_completo"
                valor={`${datos.persona?.nombres || ''} ${datos.persona?.apellidos || ''}`}
                deshabilitado
              />
              <CampoTexto
                etiqueta="Cédula de Identidad"
                nombre="ci"
                valor={datos.persona?.ci || '—'}
                deshabilitado
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
                etiqueta="Teléfono / Celular"
                nombre="telefono"
                valor={formulario.telefono}
                alCambiar={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
                error={errores.telefono?.[0] || errores.telefono}
              />
            </div>

            <CampoTexto
              etiqueta="Dirección de Domicilio"
              nombre="direccion"
              valor={formulario.direccion}
              alCambiar={(e) => setFormulario({ ...formulario, direccion: e.target.value })}
            />

            {datos.usuario?.id_paciente && (
              <>
                <hr style={{ border: 'none', borderTop: '1px solid #E8F1F3', margin: '1rem 0' }} />
                <h4 style={{ color: 'var(--texto-sec)', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                  Contacto de Emergencia
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0 1rem' }}>
                  <CampoTexto
                    etiqueta="Nombre del Contacto"
                    nombre="contacto_nombre"
                    valor={formulario.contacto_nombre}
                    alCambiar={(e) => setFormulario({ ...formulario, contacto_nombre: e.target.value })}
                  />
                  <CampoTexto
                    etiqueta="Relación / Parentesco"
                    nombre="contacto_relacion"
                    valor={formulario.contacto_relacion}
                    alCambiar={(e) => setFormulario({ ...formulario, contacto_relacion: e.target.value })}
                  />
                  <CampoTexto
                    etiqueta="Teléfono del Contacto"
                    nombre="contacto_telefono"
                    valor={formulario.contacto_telefono}
                    alCambiar={(e) => setFormulario({ ...formulario, contacto_telefono: e.target.value })}
                  />
                </div>
              </>
            )}

            <button type="submit" className="boton-primario" disabled={guardando} style={{ marginTop: '0.5rem' }}>
              {guardando ? 'Guardando…' : 'Actualizar Datos de Perfil'}
            </button>
          </form>
        </div>

        {/* Cambio de Contraseña CU02 */}
        <div className="tarjeta">
          <h3 style={{ fontSize: '1.2rem', color: 'var(--verde-azulado)', marginBottom: '1rem' }}>
            Seguridad: Cambiar Contraseña (CU02)
          </h3>

          <form onSubmit={cambiarContrasena}>
            <CampoTexto
              etiqueta="Contraseña Actual"
              nombre="contrasena_actual"
              tipo="password"
              valor={formContrasena.contrasena_actual}
              alCambiar={(e) => setFormContrasena({ ...formContrasena, contrasena_actual: e.target.value })}
              error={errores.contrasena_actual?.[0] || errores.contrasena_actual}
              requerido
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0 1rem' }}>
              <CampoTexto
                etiqueta="Nueva Contraseña"
                nombre="contrasena_nueva"
                tipo="password"
                valor={formContrasena.contrasena_nueva}
                alCambiar={(e) => setFormContrasena({ ...formContrasena, contrasena_nueva: e.target.value })}
                error={errores.contrasena_nueva?.[0] || errores.contrasena_nueva}
                requerido
              />
              <CampoTexto
                etiqueta="Confirmar Nueva Contraseña"
                nombre="confirmacion_contrasena"
                tipo="password"
                valor={formContrasena.confirmacion_contrasena}
                alCambiar={(e) => setFormContrasena({ ...formContrasena, confirmacion_contrasena: e.target.value })}
                error={errores.confirmacion_contrasena?.[0] || errores.confirmacion_contrasena}
                requerido
              />
            </div>

            <button type="submit" className="boton-secundario" style={{ marginTop: '0.5rem' }}>
              Modificar Contraseña
            </button>
          </form>
        </div>
      </div>
    </LayoutPrincipal>
  );
}
