// CU-02 Cambiar contraseña — Modal de recuperación de contraseña por correo — Recuperación por correo

import { useState, useEffect, useRef } from 'react';
import api from '../../../compartido/utilidades/api';
import ChecklistContrasena, { esContrasenaSegura } from '../../../comun/componentes/ChecklistContrasena';

/**
 * ModalRecuperarContrasena (CU-02)
 * Ventana modal accesible y responsive para el restablecimiento seguro de contraseñas
 * mediante código de verificación enviado al correo electrónico registrado.
 * Flujo de 3 pasos: 1. Identificación/Solicitud -> 2. Verificación de Código -> 3. Nueva Contraseña.
 */
export default function ModalRecuperarContrasena({ abierto, alCerrar, alExito }) {
  // Estado general del flujo
  const [paso, setPaso] = useState(1); // 1: Solicitar, 2: Código, 3: Nueva contraseña
  const [exitoFinal, setExitoFinal] = useState(false);
  const [mensajeErrorGeneral, setMensajeErrorGeneral] = useState(null);

  // Paso 1: Solicitar código
  const [identificador, setIdentificador] = useState('');
  const [errorIdentificador, setErrorIdentificador] = useState(null);
  const [cargandoSolicitud, setCargandoSolicitud] = useState(false);
  const [correoEnmascarado, setCorreoEnmascarado] = useState(null);
  const [mostrarContacto, setMostrarContacto] = useState(false);

  // Paso 2: Ingresar código
  const [digitos, setDigitos] = useState(['', '', '', '', '', '']);
  const [errorCodigo, setErrorCodigo] = useState(null);
  const [cargandoVerificacion, setCargandoVerificacion] = useState(false);
  const [cargandoReenvio, setCargandoReenvio] = useState(false);
  const [segundosVigencia, setSegundosVigencia] = useState(600); // 10 minutos
  const [segundosReenvio, setSegundosReenvio] = useState(60); // 60 segundos
  const [comprobante, setComprobante] = useState(null); // Guardado SOLO en estado de React

  // Paso 3: Nueva contraseña
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [errorNueva, setErrorNueva] = useState(null);
  const [errorConfirmar, setErrorConfirmar] = useState(null);
  const [cargandoRestablecer, setCargandoRestablecer] = useState(false);

  // Referencias para accesibilidad y navegación de foco
  const modalRef = useRef(null);
  const identificadorInputRef = useRef(null);
  const casillasRefs = useRef([]);
  const nuevaContrasenaRef = useRef(null);
  const botonCerrarRef = useRef(null);

  // Reiniciar todos los estados del modal
  const reiniciarEstado = () => {
    setPaso(1);
    setExitoFinal(false);
    setMensajeErrorGeneral(null);
    setIdentificador('');
    setErrorIdentificador(null);
    setCargandoSolicitud(false);
    setCorreoEnmascarado(null);
    setMostrarContacto(false);
    setDigitos(['', '', '', '', '', '']);
    setErrorCodigo(null);
    setCargandoVerificacion(false);
    setCargandoReenvio(false);
    setSegundosVigencia(600);
    setSegundosReenvio(60);
    setComprobante(null);
    setNuevaContrasena('');
    setConfirmarContrasena('');
    setMostrarNueva(false);
    setMostrarConfirmar(false);
    setErrorNueva(null);
    setErrorConfirmar(null);
    setCargandoRestablecer(false);
  };

  // Manejo de apertura y cierre con tecla Escape
  useEffect(() => {
    if (!abierto) {
      reiniciarEstado();
      return;
    }

    const manejarTeclaEscape = (e) => {
      if (e.key === 'Escape') {
        const estaCargando = cargandoSolicitud || cargandoVerificacion || cargandoReenvio || cargandoRestablecer;
        if (!estaCargando) {
          manejarCerrarModal();
        }
      }
    };

    window.addEventListener('keydown', manejarTeclaEscape);
    return () => window.removeEventListener('keydown', manejarTeclaEscape);
  }, [abierto, cargandoSolicitud, cargandoVerificacion, cargandoReenvio, cargandoRestablecer]);

  // Foco automático contextual según el paso activo
  useEffect(() => {
    if (!abierto) return;

    const timer = setTimeout(() => {
      if (paso === 1) {
        identificadorInputRef.current?.focus();
      } else if (paso === 2) {
        casillasRefs.current[0]?.focus();
      } else if (paso === 3 && !exitoFinal) {
        nuevaContrasenaRef.current?.focus();
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [abierto, paso, exitoFinal]);

  // Temporizadores del Paso 2 (Vigencia 10:00 y Reenvío 60s)
  useEffect(() => {
    if (!abierto || paso !== 2) return;

    const intervalo = setInterval(() => {
      setSegundosVigencia((prev) => (prev > 0 ? prev - 1 : 0));
      setSegundosReenvio((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalo);
  }, [abierto, paso]);

  if (!abierto) return null;

  // Cierre limpio del modal
  const manejarCerrarModal = () => {
    const idFinal = identificador.trim();
    const fueExitoso = exitoFinal;
    reiniciarEstado();
    if (alCerrar) {
      alCerrar({ fueExitoso, identificador: idFinal });
    }
  };

  // ============================================================
  // PASO 1: SOLICITAR CÓDIGO
  // ============================================================
  const manejarSolicitarCodigo = async (e) => {
    e?.preventDefault();
    setMensajeErrorGeneral(null);
    setErrorIdentificador(null);

    const valorLimpio = identificador.trim();
    if (!valorLimpio) {
      setErrorIdentificador('Ingrese su cédula de identidad o correo electrónico.');
      identificadorInputRef.current?.focus();
      return;
    }

    setCargandoSolicitud(true);

    try {
      const peticionApi = api.post('/acceso/recuperacion/solicitar', {
        identificador: valorLimpio,
      });

      // Mínimo 1.5 segundos de espera para feedback de carga institucional
      const tiempoEspera = new Promise((resolve) => setTimeout(resolve, 1500));
      const [respuesta] = await Promise.all([peticionApi, tiempoEspera]);

      const datos = respuesta?.data;
      const correoObtenido = datos?.correoEnmascarado || datos?.datos?.correoEnmascarado || null;
      const esperaSegundos = datos?.segundosEspera || datos?.datos?.segundosEspera || 60;

      setCorreoEnmascarado(correoObtenido);
      setSegundosVigencia(600);
      setSegundosReenvio(esperaSegundos);
      setDigitos(['', '', '', '', '', '']);
      setErrorCodigo(null);
      setPaso(2);
    } catch (err) {
      if (err.response?.status === 429) {
        setMensajeErrorGeneral(
          err.response?.data?.mensaje || 'Demasiadas solicitudes. Por favor espere antes de intentar nuevamente.'
        );
      } else if (err.response?.data?.mensaje) {
        setMensajeErrorGeneral(err.response.data.mensaje);
      } else {
        setMensajeErrorGeneral('No fue posible comunicarse con el servidor. Verifique su conexión a internet.');
      }
    } finally {
      setCargandoSolicitud(false);
    }
  };

  // ============================================================
  // PASO 2: GESTIÓN DE CÓDIGO (6 DÍGITOS Y VERIFICACIÓN)
  // ============================================================
  const manejarCambioDigito = (indice, e) => {
    const valorEntrante = e.target.value.replace(/\D/g, '');
    setErrorCodigo(null);
    setMensajeErrorGeneral(null);

    // Si el usuario ingresó varios dígitos (por autocompletado del teclado móvil o pegado rápido)
    if (valorEntrante.length > 1) {
      distribuirDigitos(valorEntrante, indice);
      return;
    }

    const nuevosDigitos = [...digitos];
    nuevosDigitos[indice] = valorEntrante;
    setDigitos(nuevosDigitos);

    if (valorEntrante && indice < 5) {
      casillasRefs.current[indice + 1]?.focus();
    }
  };

  const manejarKeyDownDigito = (indice, e) => {
    if (e.key === 'Backspace') {
      if (!digitos[indice] && indice > 0) {
        casillasRefs.current[indice - 1]?.focus();
        const nuevos = [...digitos];
        nuevos[indice - 1] = '';
        setDigitos(nuevos);
      } else {
        const nuevos = [...digitos];
        nuevos[indice] = '';
        setDigitos(nuevos);
      }
    } else if (e.key === 'ArrowLeft' && indice > 0) {
      casillasRefs.current[indice - 1]?.focus();
    } else if (e.key === 'ArrowRight' && indice < 5) {
      casillasRefs.current[indice + 1]?.focus();
    }
  };

  const distribuirDigitos = (textoNumerico, inicio = 0) => {
    const cadena = textoNumerico.slice(0, 6);
    const nuevos = [...digitos];
    for (let i = 0; i < cadena.length; i++) {
      if (inicio + i < 6) {
        nuevos[inicio + i] = cadena[i];
      }
    }
    setDigitos(nuevos);
    const siguienteIndice = Math.min(inicio + cadena.length, 5);
    casillasRefs.current[siguienteIndice]?.focus();
  };

  const manejarPegarCodigo = (e) => {
    e.preventDefault();
    setErrorCodigo(null);
    setMensajeErrorGeneral(null);
    const pegado = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pegado) return;

    distribuirDigitos(pegado, 0);
  };

  // Reenviar código
  const manejarReenviarCodigo = async () => {
    if (segundosReenvio > 0 || cargandoReenvio) return;

    setCargandoReenvio(true);
    setErrorCodigo(null);
    setMensajeErrorGeneral(null);

    try {
      const peticionApi = api.post('/acceso/recuperacion/solicitar', {
        identificador: identificador.trim(),
      });
      const tiempoEspera = new Promise((resolve) => setTimeout(resolve, 1500));
      const [respuesta] = await Promise.all([peticionApi, tiempoEspera]);

      const datos = respuesta?.data;
      const correoObtenido = datos?.correoEnmascarado || datos?.datos?.correoEnmascarado || null;
      if (correoObtenido) setCorreoEnmascarado(correoObtenido);

      setSegundosVigencia(600);
      setSegundosReenvio(datos?.segundosEspera || 60);
      setDigitos(['', '', '', '', '', '']);
      casillasRefs.current[0]?.focus();
    } catch (err) {
      if (err.response?.status === 429) {
        setErrorCodigo(
          err.response?.data?.mensaje || 'Demasiadas solicitudes. Por favor espere antes de intentar nuevamente.'
        );
      } else if (err.response?.data?.mensaje) {
        setErrorCodigo(err.response.data.mensaje);
      } else {
        setErrorCodigo('No fue posible comunicarse con el servidor para el reenvío.');
      }
    } finally {
      setCargandoReenvio(false);
    }
  };

  // Verificar código
  const manejarVerificarCodigo = async (e) => {
    e?.preventDefault();
    setErrorCodigo(null);
    setMensajeErrorGeneral(null);

    const codigoCompleto = digitos.join('');
    if (codigoCompleto.length < 6) {
      setErrorCodigo('Debe ingresar los 6 dígitos del código.');
      const indiceVacio = digitos.findIndex((d) => !d);
      casillasRefs.current[indiceVacio !== -1 ? indiceVacio : 0]?.focus();
      return;
    }

    if (segundosVigencia <= 0) {
      setErrorCodigo('El código de verificación ha vencido. Por favor solicite uno nuevo.');
      return;
    }

    setCargandoVerificacion(true);

    try {
      const respuesta = await api.post('/acceso/recuperacion/verificar', {
        identificador: identificador.trim(),
        codigo: codigoCompleto,
      });

      const tokenComprobante = respuesta.data?.comprobante || respuesta.data?.datos?.comprobante;
      if (!tokenComprobante) {
        throw new Error('No se recibió el comprobante de verificación.');
      }

      // Guardar comprobante ÚNICAMENTE en el estado de React
      setComprobante(tokenComprobante);
      setPaso(3);
    } catch (err) {
      const mensajeServidor = err.response?.data?.mensaje || 'El código ingresado es incorrecto.';
      setErrorCodigo(mensajeServidor);

      // Limpiar casillas y enfocar el primer campo para reintentar
      setDigitos(['', '', '', '', '', '']);
      casillasRefs.current[0]?.focus();

      // Si los intentos fueron agotados completamente por el servidor, volver a paso 1
      if (mensajeServidor.toLowerCase().includes('solicitar un nuevo código') || mensajeServidor.toLowerCase().includes('ha superado') || mensajeServidor.toLowerCase().includes('ha expirado')) {
        setTimeout(() => {
          setPaso(1);
          setMensajeErrorGeneral(mensajeServidor);
        }, 1800);
      }
    } finally {
      setCargandoVerificacion(false);
    }
  };

  // ============================================================
  // PASO 3: RESTABLECER CONTRASEÑA
  // ============================================================
  const manejarRestablecerContrasena = async (e) => {
    e?.preventDefault();
    setErrorNueva(null);
    setErrorConfirmar(null);
    setMensajeErrorGeneral(null);

    let hayErrores = false;

    if (!nuevaContrasena) {
      setErrorNueva('Ingrese su nueva contraseña.');
      hayErrores = true;
    } else if (!esContrasenaSegura(nuevaContrasena)) {
      setErrorNueva('La nueva contraseña no cumple con todos los requisitos de seguridad.');
      hayErrores = true;
    }

    if (!confirmarContrasena) {
      setErrorConfirmar('Confirme su nueva contraseña.');
      hayErrores = true;
    } else if (nuevaContrasena && nuevaContrasena !== confirmarContrasena) {
      setErrorConfirmar('Las contraseñas no coinciden.');
      hayErrores = true;
    }

    if (hayErrores) return;

    if (!comprobante) {
      setMensajeErrorGeneral('El comprobante de verificación no está disponible. Inicie el proceso nuevamente.');
      setPaso(1);
      return;
    }

    setCargandoRestablecer(true);

    try {
      await api.post('/acceso/recuperacion/restablecer', {
        identificador: identificador.trim(),
        comprobante,
        contrasena: nuevaContrasena,
        contrasenaConfirmacion: confirmarContrasena,
      });

      setExitoFinal(true);
      if (alExito) {
        alExito({ identificador: identificador.trim() });
      }
    } catch (err) {
      if (err.response?.data?.errores) {
        const errs = err.response.data.errores;
        if (errs.contrasena) {
          setErrorNueva(Array.isArray(errs.contrasena) ? errs.contrasena[0] : errs.contrasena);
        }
        if (errs.contrasenaConfirmacion) {
          setErrorConfirmar(Array.isArray(errs.contrasenaConfirmacion) ? errs.contrasenaConfirmacion[0] : errs.contrasenaConfirmacion);
        }
      } else if (err.response?.data?.mensaje) {
        setMensajeErrorGeneral(err.response.data.mensaje);
      } else {
        setMensajeErrorGeneral('Ocurrió un error al restablecer su contraseña. Por favor intente más tarde.');
      }
    } finally {
      setCargandoRestablecer(false);
    }
  };

  // Formato MM:SS del temporizador de vigencia
  const minutosVigencia = Math.floor(segundosVigencia / 60);
  const segundosVigenciaRestantes = segundosVigencia % 60;
  const textoVigencia = `${String(minutosVigencia).padStart(2, '0')}:${String(segundosVigenciaRestantes).padStart(2, '0')}`;
  const codigoCompletoActual = digitos.join('');

  return (
    <div
      className="modal-recuperar-backdrop"
      onClick={() => {
        const estaCargando = cargandoSolicitud || cargandoVerificacion || cargandoReenvio || cargandoRestablecer;
        if (!estaCargando) manejarCerrarModal();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-recuperar"
    >
      <div
        ref={modalRef}
        className="modal-recuperar-tarjeta"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="modal-recuperar-cabecera">
          <div className="modal-recuperar-icono-badge" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>

          <div className="modal-recuperar-titulos">
            <h2 id="titulo-modal-recuperar" className="modal-recuperar-titulo">
              <strong>Recuperar Contraseña</strong> <span>de Acceso</span>
            </h2>
            <p className="modal-recuperar-subtitulo">Verificación por correo electrónico</p>
          </div>

          <button
            ref={botonCerrarRef}
            type="button"
            className="modal-recuperar-boton-cerrar"
            onClick={manejarCerrarModal}
            disabled={cargandoSolicitud || cargandoVerificacion || cargandoReenvio || cargandoRestablecer}
            aria-label="Cerrar ventana de recuperación"
          >
            ✕
          </button>
        </div>

        {/* Indicador de Pasos (1 Correo · 2 Código · 3 Nueva contraseña) */}
        {!exitoFinal && (
          <div className="indicador-pasos-contenedor" aria-label={`Paso ${paso} de 3`}>
            <div className={`indicador-paso-item ${paso === 1 ? 'activo' : ''} ${paso > 1 ? 'completado' : ''}`}>
              <div className="indicador-paso-circulo">
                {paso > 1 ? '✓' : '1'}
              </div>
              <span className="indicador-paso-texto">Correo</span>
            </div>

            <div className={`indicador-paso-linea ${paso > 1 ? 'completada' : ''}`} />

            <div className={`indicador-paso-item ${paso === 2 ? 'activo' : ''} ${paso > 2 ? 'completado' : ''}`}>
              <div className="indicador-paso-circulo">
                {paso > 2 ? '✓' : '2'}
              </div>
              <span className="indicador-paso-texto">Código</span>
            </div>

            <div className={`indicador-paso-linea ${paso > 2 ? 'completada' : ''}`} />

            <div className={`indicador-paso-item ${paso === 3 ? 'activo' : ''}`}>
              <div className="indicador-paso-circulo">3</div>
              <span className="indicador-paso-texto">Nueva contraseña</span>
            </div>
          </div>
        )}

        {/* Mensaje de error general si aplica */}
        {mensajeErrorGeneral && (
          <div className="alerta-error-recuperar" role="alert">
            <span className="alerta-error-icono">⚠️</span>
            <span>{mensajeErrorGeneral}</span>
          </div>
        )}

        {/* Contenido principal según el paso */}
        <div className="modal-recuperar-cuerpo">
          {/* ============================================================
              PASO 1: SOLICITAR CÓDIGO
              ============================================================ */}
          {paso === 1 && !exitoFinal && (
            <form onSubmit={manejarSolicitarCodigo} noValidate>
              <p className="texto-instruccion-recuperar">
                Ingrese su CI o correo electrónico. Le enviaremos un código de verificación al correo registrado en su cuenta.
              </p>

              <div className="campo-grupo-recuperar">
                <label htmlFor="identificador-recuperar" className="campo-label-recuperar">
                  <span>CI o correo electrónico</span>
                  <span className="asterisco-requerido">*</span>
                </label>
                <input
                  ref={identificadorInputRef}
                  id="identificador-recuperar"
                  type="text"
                  value={identificador}
                  onChange={(e) => {
                    setIdentificador(e.target.value);
                    if (errorIdentificador) setErrorIdentificador(null);
                    if (mensajeErrorGeneral) setMensajeErrorGeneral(null);
                  }}
                  placeholder="Ej. 1000001 o usuario@correo.com"
                  className={`campo-input-recuperar ${errorIdentificador ? 'campo-error' : ''}`}
                  disabled={cargandoSolicitud}
                  autoComplete="username"
                  aria-invalid={!!errorIdentificador}
                  aria-describedby={errorIdentificador ? 'error-identificador-desc' : undefined}
                />
                {errorIdentificador && (
                  <span id="error-identificador-desc" className="mensaje-error-campo">
                    {errorIdentificador}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="boton-accion-primario"
                disabled={cargandoSolicitud}
              >
                {cargandoSolicitud ? (
                  <span className="cargando-boton-contenedor">
                    <span className="spinner-cargando" />
                    <span>Enviando código…</span>
                  </span>
                ) : (
                  'Enviar código'
                )}
              </button>

              {/* Enlace discreto de asistencia para usuarios sin correo */}
              <div className="seccion-asistencia-contacto">
                <button
                  type="button"
                  className="enlace-asistencia-toggle"
                  onClick={() => setMostrarContacto(!mostrarContacto)}
                  aria-expanded={mostrarContacto}
                >
                  <span>{mostrarContacto ? '▲ Ocultar canales de ayuda' : '▼ ¿No tiene correo registrado?'}</span>
                </button>

                {mostrarContacto && (
                  <div className="panel-canales-contacto" role="region" aria-label="Canales de atención asistida">
                    <p className="panel-canales-aviso">
                      El personal de recepción o administración puede asistirle de forma presencial o telefónica:
                    </p>
                    <div className="canales-lista-recuperar">
                      <div className="canal-recuperar-item">
                        <span className="canal-item-icono">📞</span>
                        <div>
                          <strong>Central Telefónica:</strong>
                          <p>(591) 2 2441234 — Int. 10</p>
                        </div>
                      </div>

                      <div className="canal-recuperar-item">
                        <span className="canal-item-icono">💬</span>
                        <div>
                          <strong>WhatsApp Recepción:</strong>
                          <p>+591 70001234</p>
                        </div>
                      </div>

                      <div className="canal-recuperar-item canal-destacado">
                        <span className="canal-item-icono">🏥</span>
                        <div>
                          <strong>Atención Presencial:</strong>
                          <p>Av. Principal #1234 — Lun a Sáb: 07:00 a 20:00</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>
          )}

          {/* ============================================================
              PASO 2: INGRESAR Y VERIFICAR CÓDIGO
              ============================================================ */}
          {paso === 2 && !exitoFinal && (
            <form onSubmit={manejarVerificarCodigo} noValidate>
              <p className="texto-instruccion-recuperar">
                Enviamos un código de 6 dígitos a <strong>{correoEnmascarado || 'su correo registrado'}</strong>. Ingréselo para continuar.
              </p>

              {/* Grupo de 6 casillas numéricas */}
              <div className="casillas-codigo-fila" onPaste={manejarPegarCodigo}>
                {digitos.map((digito, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (casillasRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digito}
                    onChange={(e) => manejarCambioDigito(idx, e)}
                    onKeyDown={(e) => manejarKeyDownDigito(idx, e)}
                    className={`casilla-codigo-input ${errorCodigo ? 'casilla-error' : ''} ${digito ? 'casilla-llena' : ''}`}
                    disabled={cargandoVerificacion || cargandoReenvio || segundosVigencia <= 0}
                    autoComplete="one-time-code"
                    aria-label={`Dígito ${idx + 1} de 6 del código de verificación`}
                  />
                ))}
              </div>

              {/* Mensaje de error del código */}
              {errorCodigo && (
                <div className="mensaje-error-campo texto-centrado" role="alert">
                  {errorCodigo}
                </div>
              )}

              {/* Temporizadores de vigencia y reenvío */}
              <div className="temporizadores-recuperar-contenedor">
                <div className="vigencia-badge">
                  <span className="vigencia-icono">⏱️</span>
                  {segundosVigencia > 0 ? (
                    <span>
                      Vigencia del código: <strong>{textoVigencia}</strong>
                    </span>
                  ) : (
                    <span className="texto-vencido">El código venció</span>
                  )}
                </div>

                <div className="reenvio-seccion">
                  {segundosReenvio > 0 ? (
                    <span className="texto-reenvio-espera">
                      Reenviar en {segundosReenvio} s
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="boton-reenviar-codigo"
                      onClick={manejarReenviarCodigo}
                      disabled={cargandoReenvio || cargandoVerificacion}
                    >
                      {cargandoReenvio ? 'Enviando nuevo código…' : 'Reenviar código'}
                    </button>
                  )}
                </div>
              </div>

              {/* Botón principal de verificación */}
              <button
                type="submit"
                className="boton-accion-primario"
                disabled={cargandoVerificacion || cargandoReenvio || codigoCompletoActual.length < 6 || segundosVigencia <= 0}
              >
                {cargandoVerificacion ? (
                  <span className="cargando-boton-contenedor">
                    <span className="spinner-cargando" />
                    <span>Verificando código…</span>
                  </span>
                ) : (
                  'Verificar código'
                )}
              </button>

              {/* Enlace para volver al paso 1 */}
              <div className="pie-navegacion-paso">
                <button
                  type="button"
                  className="boton-volver-paso"
                  onClick={() => setPaso(1)}
                  disabled={cargandoVerificacion || cargandoReenvio}
                >
                  ← Volver a ingresar CI o correo
                </button>
              </div>
            </form>
          )}

          {/* ============================================================
              PASO 3: NUEVA CONTRASEÑA
              ============================================================ */}
          {paso === 3 && !exitoFinal && (
            <form onSubmit={manejarRestablecerContrasena} noValidate>
              <p className="texto-instruccion-recuperar">
                Defina su nueva contraseña de acceso. Asegúrese de cumplir con los requisitos institucionales de seguridad.
              </p>

              {/* Campo: Nueva Contraseña */}
              <div className="campo-grupo-recuperar">
                <label htmlFor="nueva-contrasena-campo" className="campo-label-recuperar">
                  <span>Nueva contraseña</span>
                  <span className="asterisco-requerido">*</span>
                </label>
                <div className="input-relativo-ojo">
                  <input
                    ref={nuevaContrasenaRef}
                    id="nueva-contrasena-campo"
                    type={mostrarNueva ? 'text' : 'password'}
                    value={nuevaContrasena}
                    onChange={(e) => {
                      setNuevaContrasena(e.target.value);
                      if (errorNueva) setErrorNueva(null);
                      if (mensajeErrorGeneral) setMensajeErrorGeneral(null);
                    }}
                    placeholder="Mínimo 8 car., mayús., minus., núm. y símbolo"
                    className={`campo-input-recuperar con-ojo ${errorNueva ? 'campo-error' : ''}`}
                    disabled={cargandoRestablecer}
                    autoComplete="new-password"
                    aria-invalid={!!errorNueva}
                  />
                  <button
                    type="button"
                    className="boton-ojo-recuperar"
                    onClick={() => setMostrarNueva(!mostrarNueva)}
                    tabIndex={-1}
                    aria-label={mostrarNueva ? 'Ocultar nueva contraseña' : 'Ver nueva contraseña'}
                  >
                    {mostrarNueva ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {errorNueva && <span className="mensaje-error-campo">{errorNueva}</span>}

                {/* Checklist Dinámico Reutilizado de CU-02 */}
                <ChecklistContrasena contrasena={nuevaContrasena} />
              </div>

              {/* Campo: Confirmar Contraseña */}
              <div className="campo-grupo-recuperar">
                <label htmlFor="confirmar-contrasena-campo" className="campo-label-recuperar">
                  <span>Confirmar contraseña</span>
                  <span className="asterisco-requerido">*</span>
                </label>
                <div className="input-relativo-ojo">
                  <input
                    id="confirmar-contrasena-campo"
                    type={mostrarConfirmar ? 'text' : 'password'}
                    value={confirmarContrasena}
                    onChange={(e) => {
                      setConfirmarContrasena(e.target.value);
                      if (errorConfirmar) setErrorConfirmar(null);
                      if (mensajeErrorGeneral) setMensajeErrorGeneral(null);
                    }}
                    placeholder="Repita la nueva contraseña"
                    className={`campo-input-recuperar con-ojo ${errorConfirmar ? 'campo-error' : ''}`}
                    disabled={cargandoRestablecer}
                    autoComplete="new-password"
                    aria-invalid={!!errorConfirmar}
                  />
                  <button
                    type="button"
                    className="boton-ojo-recuperar"
                    onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                    tabIndex={-1}
                    aria-label={mostrarConfirmar ? 'Ocultar confirmación' : 'Ver confirmación'}
                  >
                    {mostrarConfirmar ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {errorConfirmar && <span className="mensaje-error-campo">{errorConfirmar}</span>}
              </div>

              {/* Botón principal para guardar */}
              <button
                type="submit"
                className="boton-accion-primario"
                disabled={cargandoRestablecer}
              >
                {cargandoRestablecer ? (
                  <span className="cargando-boton-contenedor">
                    <span className="spinner-cargando" />
                    <span>Guardando nueva contraseña…</span>
                  </span>
                ) : (
                  'Guardar nueva contraseña'
                )}
              </button>
            </form>
          )}

          {/* ============================================================
              ESTADO DE ÉXITO FINAL
              ============================================================ */}
          {exitoFinal && (
            <div className="seccion-exito-recuperacion">
              <div className="icono-circulo-exito" aria-hidden="true">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>

              <h3 className="titulo-exito-recuperar">Su contraseña fue actualizada correctamente</h3>
              <p className="texto-exito-recuperar">
                Ya puede ingresar a la plataforma médica utilizando sus nuevas credenciales de acceso.
              </p>

              <button
                type="button"
                className="boton-accion-primario"
                onClick={manejarCerrarModal}
                autoFocus
              >
                Volver al inicio de sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          ESTILOS CSS RESPONSIVE DEL MODAL (MOBILE-FIRST)
          ============================================================ */}
      <style>{`
        .modal-recuperar-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(18, 52, 59, 0.60);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          z-index: 9999;
          box-sizing: border-box;
          font-family: 'Nunito Sans', system-ui, -apple-system, sans-serif;
        }

        .modal-recuperar-tarjeta {
          width: 100%;
          max-width: 480px;
          background: var(--blanco);
          border-radius: var(--radio, 14px);
          box-shadow: var(--sombra, 0 4px 16px rgba(10,108,132,0.10));
          border: 1px solid #DCE9ED;
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          overflow: hidden;
          box-sizing: border-box;
        }

        .modal-recuperar-cabecera {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: var(--fondo);
          border-bottom: 1px solid #DCE9ED;
          position: relative;
        }

        .modal-recuperar-icono-badge {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #E8F8FA;
          color: var(--turquesa);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .modal-recuperar-titulos {
          flex: 1;
        }

        .modal-recuperar-titulo {
          font-size: 1.15rem;
          color: var(--verde-azulado);
          margin: 0;
          line-height: 1.25;
        }

        .modal-recuperar-titulo strong {
          font-weight: 700;
        }

        .modal-recuperar-titulo span {
          font-weight: 300;
        }

        .modal-recuperar-subtitulo {
          font-size: 0.8rem;
          color: var(--texto-sec);
          margin: 2px 0 0 0;
        }

        .modal-recuperar-boton-cerrar {
          background: transparent;
          border: none;
          color: var(--texto-sec);
          font-size: 1.25rem;
          cursor: pointer;
          min-width: 44px;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: background-color 0.15s ease, color 0.15s ease;
        }

        .modal-recuperar-boton-cerrar:hover:not(:disabled) {
          background-color: #E2ECEF;
          color: var(--texto);
        }

        /* Indicador de Pasos */
        .indicador-pasos-contenedor {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          background: #FFFFFF;
          border-bottom: 1px solid #EDF5F7;
        }

        .indicador-paso-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #94A3B8;
          font-size: 0.8rem;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .indicador-paso-item.activo {
          color: var(--turquesa);
          font-weight: 700;
        }

        .indicador-paso-item.completado {
          color: var(--confirmada);
        }

        .indicador-paso-circulo {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1.5px solid #CBD5E1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          background: #FFFFFF;
          transition: all 0.2s ease;
        }

        .indicador-paso-item.activo .indicador-paso-circulo {
          border-color: var(--turquesa);
          background: var(--turquesa);
          color: #FFFFFF;
        }

        .indicador-paso-item.completado .indicador-paso-circulo {
          border-color: var(--confirmada);
          background: var(--confirmada);
          color: #FFFFFF;
        }

        .indicador-paso-linea {
          flex: 1;
          height: 2px;
          background: #E2E8F0;
          margin: 0 8px;
          transition: background-color 0.2s ease;
        }

        .indicador-paso-linea.completada {
          background: var(--confirmada);
        }

        /* Cuerpo */
        .modal-recuperar-cuerpo {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }

        .texto-instruccion-recuperar {
          font-size: 0.925rem;
          line-height: 1.5;
          color: var(--texto);
          margin: 0 0 16px 0;
        }

        .texto-instruccion-recuperar strong {
          color: var(--verde-azulado);
        }

        .campo-grupo-recuperar {
          margin-bottom: 16px;
        }

        .campo-label-recuperar {
          display: block;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--texto);
          margin-bottom: 6px;
        }

        .asterisco-requerido {
          color: var(--cancelada);
          margin-left: 3px;
        }

        .campo-input-recuperar {
          width: 100%;
          min-height: 44px;
          background: var(--blanco);
          border: 2px solid #DCE9ED;
          border-radius: 8px;
          padding: 0 14px;
          font-family: inherit;
          font-size: 0.95rem;
          color: var(--texto);
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .campo-input-recuperar:focus {
          border-color: var(--turquesa);
          box-shadow: 0 0 0 3px rgba(31, 165, 184, 0.15);
        }

        .campo-input-recuperar.campo-error {
          border-color: var(--cancelada);
          background: #FFFDFD;
        }

        .campo-input-recuperar.con-ojo {
          padding-right: 46px;
        }

        .input-relativo-ojo {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .boton-ojo-recuperar {
          position: absolute;
          right: 2px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--texto-sec);
          border-radius: 6px;
          transition: color 0.15s ease;
        }

        .boton-ojo-recuperar:hover {
          color: var(--verde-azulado);
        }

        .mensaje-error-campo {
          display: block;
          color: var(--cancelada);
          font-size: 0.8rem;
          font-weight: 600;
          margin-top: 5px;
          line-height: 1.35;
        }

        .texto-centrado {
          text-align: center;
        }

        .alerta-error-recuperar {
          margin: 12px 20px 0 20px;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 0.85rem;
          line-height: 1.45;
          background: #FEECEB;
          color: var(--cancelada);
          border: 1px solid #F5C6CB;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .alerta-error-icono {
          font-size: 1.05rem;
          line-height: 1;
        }

        /* Botón de acción principal (color naranja institucional exclusivo) */
        .boton-accion-primario {
          width: 100%;
          min-height: 44px;
          background: var(--naranja);
          color: var(--blanco);
          border: none;
          border-radius: 8px;
          padding: 10px 16px;
          font-family: inherit;
          font-size: 0.975rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(242, 140, 30, 0.25);
          transition: background-color 0.15s ease, opacity 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .boton-accion-primario:hover:not(:disabled) {
          background: var(--naranja-oscuro);
        }

        .boton-accion-primario:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          box-shadow: none;
        }

        .cargando-boton-contenedor {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .spinner-cargando {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: animSpinner 0.8s linear infinite;
        }

        @keyframes animSpinner {
          to { transform: rotate(360deg); }
        }

        /* Casillas de Código de 6 Dígitos */
        .casillas-codigo-fila {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin: 16px 0 10px 0;
        }

        .casilla-codigo-input {
          width: 44px;
          height: 50px;
          font-family: inherit;
          font-size: 1.35rem;
          font-weight: 700;
          text-align: center;
          background: var(--blanco);
          border: 2px solid #DCE9ED;
          border-radius: 8px;
          color: var(--texto);
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          box-sizing: border-box;
          padding: 0;
        }

        .casilla-codigo-input:focus {
          border-color: var(--turquesa);
          box-shadow: 0 0 0 3px rgba(31, 165, 184, 0.18);
        }

        .casilla-codigo-input.casilla-llena {
          border-color: var(--verde-azulado);
          background: #F7FCFD;
        }

        .casilla-codigo-input.casilla-error {
          border-color: var(--cancelada);
          background: #FFFDFD;
        }

        /* Temporizadores */
        .temporizadores-recuperar-contenedor {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          margin: 14px 0 18px 0;
          padding: 10px 12px;
          background: var(--fondo);
          border: 1px solid #E1EFF2;
          border-radius: 8px;
          font-size: 0.85rem;
        }

        .vigencia-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--texto);
        }

        .vigencia-icono {
          font-size: 1rem;
        }

        .texto-vencido {
          color: var(--cancelada);
          font-weight: 700;
        }

        .texto-reenvio-espera {
          color: var(--texto-sec);
          font-size: 0.825rem;
        }

        .boton-reenviar-codigo {
          background: transparent;
          border: none;
          color: var(--verde-azulado);
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          text-decoration: underline;
          transition: color 0.15s ease;
        }

        .boton-reenviar-codigo:hover:not(:disabled) {
          color: var(--turquesa);
        }

        .pie-navegacion-paso {
          margin-top: 14px;
          text-align: center;
        }

        .boton-volver-paso {
          background: transparent;
          border: none;
          color: var(--verde-azulado);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          min-height: 44px;
          padding: 6px 12px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: color 0.15s ease;
        }

        .boton-volver-paso:hover:not(:disabled) {
          color: var(--turquesa);
          text-decoration: underline;
        }

        /* Sección de asistencia (contacto) */
        .seccion-asistencia-contacto {
          margin-top: 16px;
          text-align: center;
        }

        .enlace-asistencia-toggle {
          background: transparent;
          border: none;
          color: var(--verde-azulado);
          font-size: 0.825rem;
          font-weight: 600;
          cursor: pointer;
          min-height: 44px;
          padding: 6px 10px;
          transition: color 0.15s ease;
        }

        .enlace-asistencia-toggle:hover {
          color: var(--turquesa);
          text-decoration: underline;
        }

        .panel-canales-contacto {
          margin-top: 10px;
          padding: 12px;
          background: var(--fondo);
          border: 1px solid #DCE9ED;
          border-radius: 8px;
          text-align: left;
          animation: animDesplegar 0.2s ease-out;
        }

        @keyframes animDesplegar {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .panel-canales-aviso {
          font-size: 0.8rem;
          color: var(--texto-sec);
          margin: 0 0 10px 0;
          line-height: 1.4;
        }

        .canales-lista-recuperar {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .canal-recuperar-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 8px 10px;
          background: var(--blanco);
          border: 1px solid #E1EFF2;
          border-radius: 6px;
          font-size: 0.8rem;
        }

        .canal-recuperar-item strong {
          color: var(--texto);
          display: block;
        }

        .canal-recuperar-item p {
          color: var(--texto-sec);
          margin: 1px 0 0 0;
        }

        .canal-item-icono {
          font-size: 1.15rem;
          line-height: 1;
        }

        /* Estado de Éxito */
        .seccion-exito-recuperacion {
          text-align: center;
          padding: 16px 8px;
        }

        .icono-circulo-exito {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #E8F8FA;
          color: var(--confirmada);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px auto;
          box-shadow: 0 4px 12px rgba(46, 158, 107, 0.15);
        }

        .titulo-exito-recuperar {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--verde-azulado);
          margin: 0 0 8px 0;
          line-height: 1.3;
        }

        .texto-exito-recuperar {
          font-size: 0.9rem;
          color: var(--texto-sec);
          line-height: 1.5;
          margin: 0 0 24px 0;
        }

        /* Responsive Mobile-First */
        @media (max-width: 640px) {
          .modal-recuperar-backdrop {
            padding: 0;
            align-items: flex-end;
          }

          .modal-recuperar-tarjeta {
            max-width: 100%;
            height: 100%;
            max-height: 100vh;
            border-radius: 0;
            border: none;
          }

          .modal-recuperar-cuerpo {
            padding: 16px;
          }

          .indicador-paso-texto {
            display: none;
          }

          .indicador-paso-item {
            gap: 0;
          }

          .casillas-codigo-fila {
            gap: 6px;
          }

          .casilla-codigo-input {
            width: 40px;
            height: 48px;
            font-size: 1.25rem;
          }
        }

        /* Ajuste específico para pantallas de 320px */
        @media (max-width: 360px) {
          .casillas-codigo-fila {
            gap: 4px;
          }

          .casilla-codigo-input {
            width: 36px;
            height: 44px;
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
}
