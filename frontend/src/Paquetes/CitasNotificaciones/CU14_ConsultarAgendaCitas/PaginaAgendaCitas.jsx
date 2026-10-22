import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../compartido/utilidades/api';
import CampoTexto from '../../../compartido/componentes/CampoTexto';
import InsigniaEstado from '../../../compartido/componentes/InsigniaEstado';
import Alerta from '../../../compartido/componentes/Alerta';
import LayoutPrincipal from '../../../compartido/layouts/LayoutPrincipal';

export default function PaginaAgendaCitas() {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState(null);

  const usuario = JSON.parse(localStorage.getItem('usuario_clinica') || '{}');
  const esMedico = (usuario?.rol || '').toLowerCase() === 'medico';

  const cargarAgenda = () => {
    setCargando(true);
    api.get(`/citas/agenda?fecha=${fecha}`)
      .then((res) => {
        setCitas(res.data.datos?.citas || []);
      })
      .catch((err) => {
        setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al cargar agenda.' });
      })
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarAgenda();
  }, [fecha]);

  const marcarAsistencia = async (idCita, nuevoEstado) => {
    try {
      await api.put(`/citas/${idCita}/asistencia`, {
        id_cita: idCita,
        estado_asistencia: nuevoEstado,
      });
      setAlerta({ tipo: 'exito', mensaje: `Estado de cita actualizado a: ${nuevoEstado}` });
      cargarAgenda();
    } catch (err) {
      setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'No se pudo actualizar el estado.' });
    }
  };

  return (
    <LayoutPrincipal>
      <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 className="titulo">
              <b>Agenda</b> <span>de Citas Médicas</span>
            </h2>
            <p style={{ color: 'var(--texto-sec)', fontSize: '0.9rem' }}>
              Control y seguimiento diario de pacientes citados.
            </p>
          </div>

          <div style={{ width: '200px' }}>
            <CampoTexto
              etiqueta="Fecha a Consultar"
              nombre="fecha"
              tipo="date"
              valor={fecha}
              alCambiar={(e) => setFecha(e.target.value)}
            />
          </div>
        </div>

        <Alerta tipo={alerta?.tipo} mensaje={alerta?.mensaje} />

        <div className="tarjeta" style={{ padding: 0 }}>
          <div className="tabla-contenedor">
            <table className="tabla-clinica">
              <thead>
                <tr>
                  <th>Horario</th>
                  <th>Código</th>
                  <th>Paciente</th>
                  <th>Especialidad / Médico</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                      Cargando agenda de citas…
                    </td>
                  </tr>
                ) : citas.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--texto-sec)' }}>
                      No se registran citas para el día seleccionado ({fecha}).
                    </td>
                  </tr>
                ) : (
                  citas.map((c) => (
                    <tr key={c.id_cita}>
                      <td style={{ fontWeight: 700, color: 'var(--verde-azulado)' }}>
                        {c.hora_inicio} - {c.hora_fin}
                      </td>
                      <td style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                        {c.codigo_cita}
                      </td>
                      <td>
                        <strong>{c.paciente_apellidos}, {c.paciente_nombres}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--texto-sec)' }}>
                          Hist: {c.codigo_historia} | Tel: {c.paciente_telefono || 'S/N'}
                        </div>
                      </td>
                      <td>
                        <div>{c.especialidad_nombre}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--texto-sec)' }}>
                          Dr. {c.medico_apellidos}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {c.motivo_consulta || 'Consulta general'}
                      </td>
                      <td>
                        <InsigniaEstado estado={c.estado_codigo} texto={c.estado_nombre} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {c.estado_codigo === 'pendiente' && (
                            <button
                              type="button"
                              onClick={() => marcarAsistencia(c.id_cita, 'en_espera')}
                              className="boton-secundario"
                              style={{ minHeight: '32px', padding: '0 0.6rem', fontSize: '0.8rem' }}
                            >
                              Presente
                            </button>
                          )}

                          {['pendiente', 'en_espera'].includes(c.estado_codigo) && (
                            <button
                              type="button"
                              onClick={() => marcarAsistencia(c.id_cita, 'inasistencia')}
                              className="boton-terciario"
                              style={{ minHeight: '32px', padding: '0 0.6rem', fontSize: '0.8rem', borderColor: 'var(--inasistencia)', color: 'var(--inasistencia)' }}
                            >
                              Inasistencia
                            </button>
                          )}

                          {esMedico && ['en_espera', 'confirmada', 'pendiente'].includes(c.estado_codigo) && (
                            <Link
                              to={`/historia-clinica/atencion/${c.id_cita}`}
                              className="boton-primario"
                              style={{ minHeight: '32px', padding: '0 0.6rem', fontSize: '0.8rem' }}
                            >
                              Atender
                            </Link>
                          )}

                          <Link
                            to={`/historia-clinica/${c.id_paciente}`}
                            className="boton-terciario"
                            style={{ minHeight: '32px', padding: '0 0.6rem', fontSize: '0.8rem' }}
                          >
                            Historial
                          </Link>
                        </div>
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
