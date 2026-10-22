import React, { useState, useEffect } from 'react';
import api from '../../../compartido/utilidades/api';
import InsigniaEstado from '../../../compartido/componentes/InsigniaEstado';
import Alerta from '../../../compartido/componentes/Alerta';
import LayoutPrincipal from '../../../compartido/layouts/LayoutPrincipal';

export default function PaginaHistorialCitas() {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [alerta, setAlerta] = useState(null);

  const cargarCitas = () => {
    setCargando(true);
    api.get('/citas/historial')
      .then((res) => {
        setCitas(res.data.datos || []);
      })
      .catch((err) => {
        setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al cargar citas.' });
      })
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarCitas();
  }, []);

  const cancelarCita = async (idCita) => {
    if (!window.confirm('¿Está seguro de que desea cancelar esta cita médica?')) return;

    try {
      await api.put(`/citas/${idCita}/cancelar`, { motivo: 'Cancelado por el paciente' });
      setAlerta({ tipo: 'exito', mensaje: 'Cita cancelada correctamente.' });
      cargarCitas();
    } catch (err) {
      setAlerta({
        tipo: 'error',
        mensaje: err.response?.data?.mensaje || 'No se pudo cancelar la cita. Recuerde el límite de horas de anticipación.',
      });
    }
  };

  return (
    <LayoutPrincipal>
      <div style={{ maxWidth: '950px', margin: '0 auto' }}>
        <h2 className="titulo" style={{ marginBottom: '0.25rem' }}>
          <b>Historial</b> <span>y Seguimiento de Citas</span>
        </h2>
        <p style={{ color: 'var(--texto-sec)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Consulta el estado de tus citas programadas y tu registro de atenciones previas.
        </p>

        <Alerta tipo={alerta?.tipo} mensaje={alerta?.mensaje} />

        <div className="tarjeta" style={{ padding: 0 }}>
          <div className="tabla-contenedor">
            <table className="tabla-clinica">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Fecha y Hora</th>
                  <th>Especialidad</th>
                  <th>Médico</th>
                  <th>Estado</th>
                  <th>Observaciones</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                      Cargando historial de citas…
                    </td>
                  </tr>
                ) : citas.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--texto-sec)' }}>
                      No tienes citas registradas.
                    </td>
                  </tr>
                ) : (
                  citas.map((c) => (
                    <tr key={c.id_cita}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.codigo_cita}</td>
                      <td>
                        <strong>{c.fecha_cita}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--texto-sec)' }}>
                          {c.hora_inicio} - {c.hora_fin}
                        </div>
                      </td>
                      <td>{c.especialidad_nombre}</td>
                      <td>Dr. {c.medico_apellidos}, {c.medico_nombres}</td>
                      <td>
                        <InsigniaEstado estado={c.estado_codigo} texto={c.estado_nombre} />
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {c.motivo_consulta || c.observaciones || '—'}
                      </td>
                      <td>
                        {['pendiente', 'confirmada'].includes(c.estado_codigo) && (
                          <button
                            type="button"
                            onClick={() => cancelarCita(c.id_cita)}
                            className="boton-peligro"
                            style={{ minHeight: '32px', padding: '0 0.6rem', fontSize: '0.8rem' }}
                          >
                            Cancelar
                          </button>
                        )}
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
