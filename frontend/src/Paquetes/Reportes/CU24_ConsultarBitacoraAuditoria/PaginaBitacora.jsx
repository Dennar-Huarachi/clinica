import React, { useState, useEffect } from 'react';
import api from '../../../compartido/utilidades/api';
import CampoTexto from '../../../compartido/componentes/CampoTexto';
import Alerta from '../../../compartido/componentes/Alerta';
import LayoutPrincipal from '../../../compartido/layouts/LayoutPrincipal';

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

  return (
    <LayoutPrincipal>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h2 className="titulo" style={{ marginBottom: '0.25rem' }}>
          <b>Bitácora</b> <span>de Auditoría del Sistema</span>
        </h2>
        <p style={{ color: 'var(--texto-sec)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Registro estricto e inmutable de eventos, accesos y operaciones por caso de uso.
        </p>

        <Alerta tipo={alerta?.tipo} mensaje={alerta?.mensaje} />

        <div className="tarjeta" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <CampoTexto
                etiqueta="Filtrar por Caso de Uso"
                nombre="casoUso"
                valor={casoUso}
                alCambiar={(e) => setCasoUso(e.target.value)}
                marcador="Ej: CU12, CU01, CU05…"
              />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <CampoTexto
                etiqueta="Filtrar por Acción"
                nombre="accion"
                valor={accion}
                alCambiar={(e) => setAccion(e.target.value)}
                marcador="Ej: CREAR_CITA, INICIAR_SESION…"
              />
            </div>
          </div>
        </div>

        <div className="tarjeta" style={{ padding: 0 }}>
          <div className="tabla-contenedor">
            <table className="tabla-clinica">
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Caso de Uso</th>
                  <th>Acción</th>
                  <th>Tabla / Registro</th>
                  <th>Usuario</th>
                  <th>IP Origen</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                      Cargando registros de auditoría…
                    </td>
                  </tr>
                ) : registros.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--texto-sec)' }}>
                      No se encontraron eventos en la bitácora.
                    </td>
                  </tr>
                ) : (
                  registros.map((r) => (
                    <tr key={r.id_bitacora}>
                      <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        {r.fecha_hora}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--verde-azulado)', fontSize: '0.85rem' }}>
                        {r.caso_uso}
                      </td>
                      <td>
                        <span style={{ background: '#E8F6F8', color: 'var(--texto)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                          {r.accion}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {r.tabla_afectada ? `${r.tabla_afectada} #${r.registro_id || ''}` : '—'}
                      </td>
                      <td>{r.nombre_usuario || 'Anónimo / Sistema'}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--texto-sec)' }}>{r.ip_origen}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LayoutPrincipal>
  );
}
