import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../compartido/utilidades/api';
import CampoTexto from '../../../compartido/componentes/CampoTexto';
import CampoSelect from '../../../compartido/componentes/CampoSelect';
import Alerta from '../../../compartido/componentes/Alerta';
import LayoutPrincipal from '../../../compartido/layouts/LayoutPrincipal';

export default function PaginaRegistroPaciente() {
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
    nombre_usuario: '',
    contrasena: '',
  });
  const [errores, setErrores] = useState({});
  const [alerta, setAlerta] = useState(null);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: null }));
    }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setAlerta(null);
    setErrores({});
    setCargando(true);

    try {
      const respuesta = await api.post('/acceso/registro-paciente', formulario);
      const { token, usuario } = respuesta.data.datos;

      localStorage.setItem('token_clinica', token);
      localStorage.setItem('usuario_clinica', JSON.stringify(usuario));

      setAlerta({ tipo: 'exito', mensaje: 'Registro exitoso. Redirigiendo...' });
      setTimeout(() => navigate('/citas/reserva'), 1200);
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errores) {
        setErrores(err.response.data.errores);
      } else {
        setAlerta({
          tipo: 'error',
          mensaje: err.response?.data?.mensaje || 'Error al completar el registro.',
        });
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <LayoutPrincipal>
      <div style={{ maxWidth: '640px', margin: '1.5rem auto' }}>
        <div className="tarjeta">
          <h2 className="titulo" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
            <b>Registro</b> <span>de Paciente</span>
          </h2>
          <p style={{ color: 'var(--texto-sec)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Crea tu cuenta de paciente para reservar y gestionar tus citas médicas en línea.
          </p>

          <Alerta tipo={alerta?.tipo} mensaje={alerta?.mensaje} />

          <form onSubmit={manejarEnvio}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0 1rem' }}>
              <CampoTexto
                etiqueta="Cédula de Identidad"
                nombre="ci"
                valor={formulario.ci}
                alCambiar={manejarCambio}
                error={errores.ci?.[0] || errores.ci}
                requerido
              />

              <CampoTexto
                etiqueta="Teléfono / Celular"
                nombre="telefono"
                valor={formulario.telefono}
                alCambiar={manejarCambio}
                error={errores.telefono?.[0] || errores.telefono}
                requerido
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0 1rem' }}>
              <CampoTexto
                etiqueta="Nombres"
                nombre="nombres"
                valor={formulario.nombres}
                alCambiar={manejarCambio}
                error={errores.nombres?.[0] || errores.nombres}
                requerido
              />

              <CampoTexto
                etiqueta="Apellidos"
                nombre="apellidos"
                valor={formulario.apellidos}
                alCambiar={manejarCambio}
                error={errores.apellidos?.[0] || errores.apellidos}
                requerido
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0 1rem' }}>
              <CampoTexto
                etiqueta="Fecha de Nacimiento"
                nombre="fecha_nacimiento"
                tipo="date"
                valor={formulario.fecha_nacimiento}
                alCambiar={manejarCambio}
                error={errores.fecha_nacimiento?.[0] || errores.fecha_nacimiento}
                requerido
              />

              <CampoSelect
                etiqueta="Sexo"
                nombre="sexo"
                valor={formulario.sexo}
                alCambiar={manejarCambio}
                error={errores.sexo?.[0] || errores.sexo}
                opciones={[
                  { valor: 'M', etiqueta: 'Masculino' },
                  { valor: 'F', etiqueta: 'Femenino' },
                ]}
                requerido
              />

              <CampoSelect
                etiqueta="Grupo Sanguíneo"
                nombre="grupo_sanguineo"
                valor={formulario.grupo_sanguineo}
                alCambiar={manejarCambio}
                error={errores.grupo_sanguineo?.[0] || errores.grupo_sanguineo}
                opciones={[
                  { valor: 'O+', etiqueta: 'O Positivo (O+)' },
                  { valor: 'O-', etiqueta: 'O Negativo (O-)' },
                  { valor: 'A+', etiqueta: 'A Positivo (A+)' },
                  { valor: 'A-', etiqueta: 'A Negativo (A-)' },
                  { valor: 'B+', etiqueta: 'B Positivo (B+)' },
                  { valor: 'B-', etiqueta: 'B Negativo (B-)' },
                  { valor: 'AB+', etiqueta: 'AB Positivo (AB+)' },
                  { valor: 'AB-', etiqueta: 'AB Negativo (AB-)' },
                ]}
              />
            </div>

            <CampoTexto
              etiqueta="Correo Electrónico"
              nombre="correo"
              tipo="email"
              valor={formulario.correo}
              alCambiar={manejarCambio}
              error={errores.correo?.[0] || errores.correo}
              requerido
            />

            <CampoTexto
              etiqueta="Dirección de Domicilio"
              nombre="direccion"
              valor={formulario.direccion}
              alCambiar={manejarCambio}
              error={errores.direccion?.[0] || errores.direccion}
            />

            <hr style={{ border: 'none', borderTop: '1px solid #E8F1F3', margin: '1.25rem 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0 1rem' }}>
              <CampoTexto
                etiqueta="Nombre de Usuario para Acceso"
                nombre="nombre_usuario"
                valor={formulario.nombre_usuario}
                alCambiar={manejarCambio}
                error={errores.nombre_usuario?.[0] || errores.nombre_usuario}
                requerido
              />

              <CampoTexto
                etiqueta="Contraseña"
                nombre="contrasena"
                tipo="password"
                valor={formulario.contrasena}
                alCambiar={manejarCambio}
                error={errores.contrasena?.[0] || errores.contrasena}
                requerido
              />
            </div>

            <button
              type="submit"
              className="boton-primario"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={cargando}
            >
              {cargando ? 'Registrando cuenta…' : 'Crear Cuenta de Paciente'}
            </button>
          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem' }}>
            <p>
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" style={{ fontWeight: 700 }}>
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </LayoutPrincipal>
  );
}
