import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../compartido/utilidades/api';
import InsigniaEstado from '../../../compartido/componentes/InsigniaEstado';
import Alerta from '../../../compartido/componentes/Alerta';
import LayoutPrincipal from '../../../compartido/layouts/LayoutPrincipal';

export default function PaginaDashboard() {
  const [metricas, setMetricas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [alerta, setAlerta] = useState(null);

  useEffect(() => {
    api.get('/dashboard/metricas')
      .then((res) => setMetricas(res.data.datos))
      .catch((err) => setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al cargar métricas del dashboard.' }))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return (
      <LayoutPrincipal>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Cargando panel de control ejecutivo…</p>
        </div>
      </LayoutPrincipal>
    );
  }

  const kpis = metricas?.kpis || {};
  const ultimasCitas = metricas?.ultimas_citas || [];

  return (
    <LayoutPrincipal>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 className="titulo">
              <b>Panel</b> <span>de Control Administrativo</span>
            </h2>
            <p style={{ color: 'var(--texto-sec)', fontSize: '0.9rem' }}>
              Métricas operativas en tiempo real de la Clínica Vida Salud — {metricas?.fecha_actual}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/citas/reserva" className="boton-primario">
              + Nueva Cita
            </Link>
            <Link to="/reportes" className="boton-secundario">
              Ver Reportes
            </Link>
          </div>
        </div>

        <Alerta tipo={alerta?.tipo} mensaje={alerta?.mensaje} />

        {/* Tarjetas KPI */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div className="tarjeta" style={{ borderTop: '4px solid var(--verde-azulado)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--texto-sec)', fontWeight: 600 }}>Citas de Hoy</span>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--verde-azulado)', margin: '0.35rem 0' }}>
              {kpis.citas_hoy || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--confirmada)', fontWeight: 600 }}>
              {kpis.citas_atendidas_hoy || 0} atendidas | {kpis.citas_pendientes_hoy || 0} pendientes
            </div>
          </div>

          <div className="tarjeta" style={{ borderTop: '4px solid var(--turquesa)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--texto-sec)', fontWeight: 600 }}>Citas Esta Semana</span>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--turquesa)', margin: '0.35rem 0' }}>
              {kpis.citas_semana || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--texto-sec)' }}>
              Total programadas activas
            </div>
          </div>

          <div className="tarjeta" style={{ borderTop: '4px solid var(--naranja)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--texto-sec)', fontWeight: 600 }}>Pacientes Registrados</span>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--naranja-oscuro)', margin: '0.35rem 0' }}>
              {kpis.total_pacientes || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--texto-sec)' }}>
              Padrón clínico activo
            </div>
          </div>

          <div className="tarjeta" style={{ borderTop: '4px solid var(--confirmada)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--texto-sec)', fontWeight: 600 }}>Cuerpo Médico</span>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--confirmada)', margin: '0.35rem 0' }}>
              {kpis.total_medicos || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--texto-sec)' }}>
              En {kpis.total_especialidades || 0} especialidades
            </div>
          </div>
        </div>

        {/* Últimas citas del sistema */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="titulo" style={{ fontSize: '1.25rem' }}>
            <b>Últimas</b> <span>Citas Registradas</span>
          </h3>
          <Link to="/citas/agenda" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            Ver agenda completa →
          </Link>
        </div>

        <div className="tarjeta" style={{ padding: 0, marginBottom: '2rem' }}>
          <div className="tabla-contenedor">
            <table className="tabla-clinica">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Fecha y Hora</th>
                  <th>Paciente</th>
                  <th>Médico</th>
                  <th>Especialidad</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {ultimasCitas.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--texto-sec)' }}>
                      No se registran citas recientes.
                    </td>
                  </tr>
                ) : (
                  ultimasCitas.map((c) => (
                    <tr key={c.id_cita}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.codigo_cita}</td>
                      <td>{c.fecha_cita} {c.hora_inicio}</td>
                      <td><strong>{c.paciente}</strong></td>
                      <td>Dr. {c.medico}</td>
                      <td>{c.especialidad}</td>
                      <td>
                        <InsigniaEstado estado={c.estado_codigo} texto={c.estado_nombre} />
                      </td>
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
