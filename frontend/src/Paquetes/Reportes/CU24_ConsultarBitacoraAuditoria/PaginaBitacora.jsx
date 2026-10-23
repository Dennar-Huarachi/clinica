import React, { useState, useEffect } from 'react';
import api from '../../../compartido/utilidades/api';
import CampoTexto from '../../../compartido/componentes/CampoTexto';
import Alerta from '../../../compartido/componentes/Alerta';
import LayoutPrincipal from '../../../compartido/layouts/LayoutPrincipal';
import TablaExpandible from '../../../comun/componentes/TablaExpandible';

/**
 * PaginaBitacora (CU-24)
 * Registro de auditoría del sistema con patrón de acordeón / TablaExpandible (Tarea 4)
 */
export default function PaginaBitacora() {
  const [registros, setRegistros] = useState([]);
  const [casoUso, setCasoUso] = useState('');
  const [accion, setAccion] = useState('');
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState(null);

  const cargarBitacora = () => {
    setCargando(true);
    api.get(`/auditoria/bitacora?caso_uso=${encodeURIComponent(casoUso)}&accion=${encodeURIComponent(accion)}`)
      .then((res) => setRegistros(res.data.datos || []))
      .catch((err) => setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al cargar bitácora.' }))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarBitacora();
  }, [casoUso, accion]);

  // Función para formatear objetos JSON de datos anteriores / nuevos
  const formatearJson = (valor) => {
    if (!valor) return null;
    if (typeof valor === 'object') return valor;
    try {
      return JSON.parse(valor);
    } catch {
      return valor;
    }
  };

  return (
    <LayoutPrincipal titulo="Reportes · Bitácora de Auditoría del Sistema">
      <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
        <h2 className="titulo" style={{ marginBottom: '0.25rem' }}>
          <b>Bitácora</b> <span>de Auditoría del Sistema</span>
        </h2>
        <p style={{ color: 'var(--texto-sec)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Registro estricto e inmutable de eventos, accesos y operaciones por caso de uso (RN21).
        </p>

        <Alerta tipo={alerta?.tipo} mensaje={alerta?.mensaje} />

        {/* Filtros de Auditoría */}
        <div className="tarjeta" style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <CampoTexto
                etiqueta="Filtrar por Caso de Uso"
                nombre="casoUso"
                valor={casoUso}
                alCambiar={(e) => setCasoUso(e.target.value)}
                placeholder="Ej: CU02, CU04, CU05…"
              />
            </div>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <CampoTexto
                etiqueta="Filtrar por Acción"
                nombre="accion"
                valor={accion}
                alCambiar={(e) => setAccion(e.target.value)}
                placeholder="Ej: CAMBIO_CONTRASENA, CREAR_ROL…"
              />
            </div>
          </div>
        </div>

        {/* Tabla Expandible de Auditoría (Tarea 4) */}
        <TablaExpandible
          columnas={['Fecha y Hora', 'Usuario Ejecutor', 'Evento / Acción', '']}
          datos={registros}
          cargando={cargando}
          obtenerClaveFila={(r) => r.id_bitacora}
          mensajeVacio="No se encontraron eventos registrados en la bitácora de auditoría."
          renderFilaPrincipal={(r, isExpanded, toggleExpand) => (
            <>
              <td>
                <span style={{ fontWeight: 600, color: '#1C2D37', fontSize: '0.85rem' }}>
                  {r.fecha_hora}
                </span>
                <div style={{ fontSize: '0.78rem', color: 'var(--texto-sec)' }}>
                  Caso: {r.caso_uso}
                </div>
              </td>
              <td>
                <span style={{ fontWeight: 600, color: 'var(--verde-azulado)' }}>
                  {r.nombre_usuario ? `@${r.nombre_usuario}` : 'Sistema / Anónimo'}
                </span>
              </td>
              <td>
                <span
                  style={{
                    background: '#E8F6F8',
                    color: '#0A6C84',
                    border: '1px solid #CCEAF0',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                  }}
                >
                  {r.accion}
                </span>
              </td>
              <td style={{ width: '44px', textAlign: 'center' }}>
                <button
                  type="button"
                  className={`boton-chevron-expandir ${isExpanded ? 'rotado' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand();
                  }}
                  title={isExpanded ? 'Colapsar detalles' : 'Expandir información de auditoría'}
                  aria-label="Expandir auditoría"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </td>
            </>
          )}
          renderFilaMovil={(r, isExpanded, toggleExpand) => (
            <div className="fila-resumen-movil">
              {/* Línea 1 (Arriba): Acción (badge turquesa) y Fecha/Hora a la derecha */}
              <div className="fila-resumen-movil-linea1">
                <span className="badge-codigo-turquesa">
                  {r.accion}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--texto-sec)', fontWeight: 600 }}>
                  {r.fecha_hora}
                </span>
              </div>

              {/* Línea 2 (Abajo): Usuario ejecutor y caso de uso, Chevron a la derecha */}
              <div className="fila-resumen-movil-linea2">
                <div className="fila-resumen-movil-nombre">
                  <strong className="nombre-paciente-destacado" style={{ color: 'var(--verde-azulado)' }}>
                    {r.nombre_usuario ? `@${r.nombre_usuario}` : 'Sistema / Anónimo'}
                  </strong>
                  <span className="ci-paciente-sub">Caso: {r.caso_uso}</span>
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
          renderDetalle={(r) => {
            const anterioresObj = formatearJson(r.datos_anteriores);
            const nuevosObj = formatearJson(r.datos_nuevos);

            return (
              <>
                <div className="panel-detalle-grid">
                  <div className="detalle-dato-item">
                    <span className="detalle-etiqueta">Dirección IP de Origen</span>
                    <span className="detalle-valor" style={{ fontFamily: 'monospace' }}>
                      {r.ip_origen || '127.0.0.1'}
                    </span>
                  </div>

                  <div className="detalle-dato-item">
                    <span className="detalle-etiqueta">Tabla Afectada</span>
                    <span className="detalle-valor" style={{ fontFamily: 'monospace' }}>
                      {r.tabla_afectada ? `${r.tabla_afectada}` : 'No aplica'}
                    </span>
                  </div>

                  <div className="detalle-dato-item">
                    <span className="detalle-etiqueta">ID de Registro Afectado</span>
                    <span className="detalle-valor" style={{ fontFamily: 'monospace' }}>
                      {r.registro_id ? `#${r.registro_id}` : 'No aplica'}
                    </span>
                  </div>

                  <div className="detalle-dato-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="detalle-etiqueta">Agente de Usuario (User Agent)</span>
                    <span className="detalle-valor" style={{ fontSize: '12px', color: '#5A7184', wordBreak: 'break-all' }}>
                      {r.user_agent || 'Cliente Web / API'}
                    </span>
                  </div>
                </div>

                {/* Comparativa estructurada en dos bloques: Valores Anteriores vs. Valores Nuevos */}
                <div style={{ marginTop: '12px' }}>
                  <span className="detalle-etiqueta" style={{ display: 'block', marginBottom: '8px' }}>
                    Trazabilidad de Cambios (Valores Anteriores vs. Valores Nuevos)
                  </span>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                    {/* Bloque 1: Valores Anteriores */}
                    <div
                      style={{
                        backgroundColor: '#FFF8F8',
                        border: '1px solid #FED7D7',
                        borderRadius: '8px',
                        padding: '10px 14px',
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#C53030', textTransform: 'uppercase', marginBottom: '6px' }}>
                        🔴 Valores Anteriores
                      </div>
                      {anterioresObj ? (
                        <pre style={{ margin: 0, fontSize: '11.5px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#742A2A' }}>
                          {JSON.stringify(anterioresObj, null, 2)}
                        </pre>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#A0AEC0', fontStyle: 'italic' }}>
                          (Ninguno / Creación inicial de registro)
                        </span>
                      )}
                    </div>

                    {/* Bloque 2: Valores Nuevos */}
                    <div
                      style={{
                        backgroundColor: '#F0FFF4',
                        border: '1px solid #C6F6D5',
                        borderRadius: '8px',
                        padding: '10px 14px',
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#276749', textTransform: 'uppercase', marginBottom: '6px' }}>
                        🟢 Valores Nuevos
                      </div>
                      {nuevosObj ? (
                        <pre style={{ margin: 0, fontSize: '11.5px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#22543D' }}>
                          {JSON.stringify(nuevosObj, null, 2)}
                        </pre>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#A0AEC0', fontStyle: 'italic' }}>
                          (Ninguno / Eliminación o acción sin payload nuevo)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            );
          }}
        />
      </div>
    </LayoutPrincipal>
  );
}
