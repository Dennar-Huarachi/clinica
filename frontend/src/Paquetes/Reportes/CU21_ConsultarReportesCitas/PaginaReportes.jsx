import React, { useState, useEffect } from 'react';
import api from '../../../compartido/utilidades/api';
import CampoTexto from '../../../compartido/componentes/CampoTexto';
import Alerta from '../../../compartido/componentes/Alerta';
import LayoutPrincipal from '../../../compartido/layouts/LayoutPrincipal';

export default function PaginaReportes() {
  const [fechaInicio, setFechaInicio] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);

  const [reporteCitas, setReporteCitas] = useState(null);
  const [reporteAsistencia, setReporteAsistencia] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState(null);

  const cargarReportes = () => {
    setCargando(true);
    setAlerta(null);

    Promise.all([
      api.get(`/reportes/citas?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`),
      api.get(`/reportes/asistencia?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`),
    ])
      .then(([resCitas, resAsistencia]) => {
        setReporteCitas(resCitas.data.datos);
        setReporteAsistencia(resAsistencia.data.datos);
      })
      .catch((err) => {
        setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al generar los reportes.' });
      })
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarReportes();
  }, []);

  const exportarCSV = async () => {
    try {
      const res = await api.get(`/reportes/exportar?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
      const { filas, columnas, nombre_archivo } = res.data.datos;

      if (!filas || filas.length === 0) {
        setAlerta({ tipo: 'error', mensaje: 'No hay registros para exportar en este período.' });
        return;
      }

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [columnas.join(','), ...filas.map((f) => columnas.map((c) => `"${f[c] || ''}"`).join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', nombre_archivo);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setAlerta({ tipo: 'exito', mensaje: `Reporte descargado: ${nombre_archivo}` });
    } catch {
      setAlerta({ tipo: 'error', mensaje: 'Error al exportar reporte a CSV.' });
    }
  };

  return (
    <LayoutPrincipal>
      <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 className="titulo">
              <b>Módulo</b> <span>de Reportes y Estadísticas</span>
            </h2>
            <p style={{ color: 'var(--texto-sec)', fontSize: '0.9rem' }}>
              Consolidación de atención médica, demanda por especialidad y tasas de asistencia.
            </p>
          </div>

          <button
            type="button"
            onClick={exportarCSV}
            className="boton-primario"
          >
            📥 Exportar Reporte a CSV
          </button>
        </div>

        {/* Filtros de período */}
        <div className="tarjeta" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ width: '180px' }}>
              <CampoTexto
                etiqueta="Fecha Inicial"
                nombre="fecha_inicio"
                tipo="date"
                valor={fechaInicio}
                alCambiar={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div style={{ width: '180px' }}>
              <CampoTexto
                etiqueta="Fecha Final"
                nombre="fecha_fin"
                tipo="date"
                valor={fechaFin}
                alCambiar={(e) => setFechaFin(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={cargarReportes}
              className="boton-secundario"
              style={{ minHeight: '44px', marginBottom: '1.25rem' }}
              disabled={cargando}
            >
              {cargando ? 'Filtrando…' : 'Aplicar Período'}
            </button>
          </div>
        </div>

        <Alerta tipo={alerta?.tipo} mensaje={alerta?.mensaje} />

        {/* Métricas de Asistencia */}
        {reporteAsistencia && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div className="tarjeta" style={{ borderLeft: '4px solid var(--verde-azulado)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--texto-sec)' }}>Total Citas del Período</span>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--verde-azulado)' }}>
                {reporteAsistencia.total_citas}
              </div>
            </div>

            <div className="tarjeta" style={{ borderLeft: '4px solid var(--confirmada)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--texto-sec)' }}>Tasa de Asistencia Efectiva</span>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--confirmada)' }}>
                {reporteAsistencia.porcentajes.tasa_asistencia}%
              </div>
              <small style={{ color: 'var(--texto-sec)' }}>{reporteAsistencia.atendidas} citas atendidas</small>
            </div>

            <div className="tarjeta" style={{ borderLeft: '4px solid var(--inasistencia)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--texto-sec)' }}>Tasa de Inasistencia</span>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--inasistencia)' }}>
                {reporteAsistencia.porcentajes.tasa_inasistencia}%
              </div>
              <small style={{ color: 'var(--texto-sec)' }}>{reporteAsistencia.inasistencias} pacientes ausentes</small>
            </div>

            <div className="tarjeta" style={{ borderLeft: '4px solid var(--cancelada)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--texto-sec)' }}>Tasa de Cancelación</span>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--cancelada)' }}>
                {reporteAsistencia.porcentajes.tasa_cancelacion}%
              </div>
              <small style={{ color: 'var(--texto-sec)' }}>{reporteAsistencia.canceladas} citas canceladas</small>
            </div>
          </div>
        )}

        {/* Tablas de desglose */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Por especialidad */}
          <div className="tarjeta" style={{ padding: 0 }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid #E8F1F3' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--verde-azulado)' }}>Demanda por Especialidad</h3>
            </div>
            <div className="tabla-contenedor">
              <table className="tabla-clinica">
                <thead>
                  <tr>
                    <th>Especialidad</th>
                    <th>Citas</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteCitas?.por_especialidad?.map((e, idx) => (
                    <tr key={idx}>
                      <td><strong>{e.especialidad}</strong></td>
                      <td>{e.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Por médico */}
          <div className="tarjeta" style={{ padding: 0 }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid #E8F1F3' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--verde-azulado)' }}>Atención por Médico</h3>
            </div>
            <div className="tabla-contenedor">
              <table className="tabla-clinica">
                <thead>
                  <tr>
                    <th>Médico</th>
                    <th>Citas Atendidas</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteCitas?.por_medico?.map((m, idx) => (
                    <tr key={idx}>
                      <td>Dr. {m.medico}</td>
                      <td><strong>{m.total}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </LayoutPrincipal>
  );
}
