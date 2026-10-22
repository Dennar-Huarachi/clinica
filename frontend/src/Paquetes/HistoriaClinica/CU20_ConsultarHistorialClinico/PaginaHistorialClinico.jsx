import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../../compartido/utilidades/api';
import Alerta from '../../../compartido/componentes/Alerta';
import LayoutPrincipal from '../../../compartido/layouts/LayoutPrincipal';

export default function PaginaHistorialClinico() {
  const { idPaciente } = useParams();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [alerta, setAlerta] = useState(null);

  const usuario = JSON.parse(localStorage.getItem('usuario_clinica') || '{}');
  const idTarget = idPaciente || usuario.id_paciente;

  useEffect(() => {
    if (idTarget) {
      setCargando(true);
      api.get(`/historia-clinica/pacientes/${idTarget}`)
        .then((res) => setDatos(res.data.datos))
        .catch((err) => setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al cargar historia clínica.' }))
        .finally(() => setCargando(false));
    }
  }, [idTarget]);

  if (cargando) {
    return (
      <LayoutPrincipal>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Cargando expediente clínico electrónico…</p>
        </div>
      </LayoutPrincipal>
    );
  }

  if (!datos) {
    return (
      <LayoutPrincipal>
        <Alerta tipo={alerta?.tipo || 'error'} mensaje={alerta?.mensaje || 'No se encontró el historial clínico.'} />
      </LayoutPrincipal>
    );
  }

  const { paciente, informacion_medica, contactos_emergencia, atenciones, resultados_laboratorio } = datos;

  return (
    <LayoutPrincipal>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Cabecera del expediente */}
        <div className="tarjeta" style={{ marginBottom: '1.5rem', borderLeft: '5px solid var(--verde-azulado)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--turquesa)', fontWeight: 700, letterSpacing: '0.5px' }}>
                HISTORIA CLÍNICA {paciente.codigo_historia}
              </span>
              <h2 className="titulo" style={{ fontSize: '1.6rem', marginTop: '0.2rem' }}>
                <b>{paciente.apellidos}</b>, <span>{paciente.nombres}</span>
              </h2>
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--texto-sec)' }}>
                <span><strong>CI:</strong> {paciente.ci || '—'}</span>
                <span><strong>Nacimiento:</strong> {paciente.fecha_nacimiento || '—'}</span>
                <span><strong>Sexo:</strong> {paciente.sexo === 'M' ? 'Masculino' : 'Femenino'}</span>
                <span><strong>Grupo Sanguíneo:</strong> <span style={{ color: 'var(--naranja-oscuro)', fontWeight: 700 }}>{paciente.grupo_sanguineo || 'No registrado'}</span></span>
                <span><strong>Teléfono:</strong> {paciente.telefono || '—'}</span>
              </div>
            </div>

            <Link to="/pacientes" className="boton-terciario" style={{ minHeight: '36px' }}>
              ← Volver al Listado
            </Link>
          </div>
        </div>

        {/* Alerta médica de alergias y antecedentes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="tarjeta" style={{ background: '#FFFDF5', border: '1px solid #FFE4A3' }}>
            <h4 style={{ color: '#9C6E00', marginBottom: '0.5rem' }}>⚠️ Alergias y Contraindicaciones</h4>
            <p style={{ fontSize: '0.925rem', color: 'var(--texto)' }}>
              {informacion_medica?.alergias || 'Sin alergias conocidas registradas.'}
            </p>
          </div>

          <div className="tarjeta" style={{ background: '#F5FBFC', border: '1px solid #CFE9EF' }}>
            <h4 style={{ color: 'var(--verde-azulado)', marginBottom: '0.5rem' }}>🩺 Enfermedades Crónicas / Medicamentos</h4>
            <p style={{ fontSize: '0.925rem', color: 'var(--texto)' }}>
              {informacion_medica?.enfermedades_cronicas || 'Ninguna enfermedad crónica reportada.'}
              {informacion_medica?.medicamentos_actuales && (
                <span style={{ display: 'block', marginTop: '0.35rem' }}>
                  <strong>Uso habitual:</strong> {informacion_medica.medicamentos_actuales}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Contacto de emergencia */}
        {contactos_emergencia && contactos_emergencia.length > 0 && (
          <div className="tarjeta" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
            <h4 style={{ color: 'var(--texto-sec)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Contacto de Emergencia Principal
            </h4>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
              <span><strong>Nombre:</strong> {contactos_emergencia[0].nombre_completo} ({contactos_emergencia[0].relacion})</span>
              <span><strong>Teléfono:</strong> {contactos_emergencia[0].telefono}</span>
            </div>
          </div>
        )}

        {/* Registro cronológico de atenciones médicas */}
        <h3 className="titulo" style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>
          <b>Consultas</b> <span>y Atenciones Previas ({atenciones?.length || 0})</span>
        </h3>

        {(!atenciones || atenciones.length === 0) ? (
          <div className="tarjeta" style={{ textAlign: 'center', padding: '2rem', color: 'var(--texto-sec)' }}>
            El paciente aún no cuenta con consultas médicas concluidas en el sistema.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {atenciones.map((a) => (
              <div key={a.id_atencion} className="tarjeta" style={{ borderLeft: '4px solid var(--turquesa)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div>
                    <strong style={{ fontSize: '1rem', color: 'var(--verde-azulado)' }}>{a.especialidad_nombre}</strong>
                    <span style={{ color: 'var(--texto-sec)', fontSize: '0.875rem', marginLeft: '0.5rem' }}>
                      — Dr. {a.medico_apellidos}, {a.medico_nombres}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--texto-sec)', fontWeight: 600 }}>
                    {new Date(a.fecha_atencion).toLocaleDateString()} ({a.codigo_cita})
                  </span>
                </div>

                <div style={{ marginBottom: '0.5rem', fontSize: '0.925rem' }}>
                  <strong>Motivo:</strong> {a.motivo_atencion}
                </div>

                <div style={{ marginBottom: '0.5rem', fontSize: '0.925rem' }}>
                  <strong>Diagnóstico:</strong> {a.diagnostico}
                </div>

                <div style={{ marginBottom: '0.5rem', fontSize: '0.925rem' }}>
                  <strong>Tratamiento / Indicaciones:</strong> {a.tratamiento_indicaciones}
                </div>

                {a.receta_medica && (
                  <div style={{ background: '#F8FCFD', border: '1px dashed #B8DDE5', padding: '0.75rem', borderRadius: '8px', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                    <strong>Prescripción / Receta:</strong> {a.receta_medica}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Resultados de laboratorio */}
        <h3 className="titulo" style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>
          <b>Estudios</b> <span>y Resultados de Laboratorio ({resultados_laboratorio?.length || 0})</span>
        </h3>

        {(!resultados_laboratorio || resultados_laboratorio.length === 0) ? (
          <div className="tarjeta" style={{ textAlign: 'center', padding: '2rem', color: 'var(--texto-sec)', marginBottom: '2rem' }}>
            No hay estudios de laboratorio adjuntos para este paciente.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {resultados_laboratorio.map((r) => (
              <div key={r.id_resultado} className="tarjeta" style={{ padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <strong>{r.tipo_estudio}</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--texto-sec)' }}>Fecha: {r.fecha_estudio}</span>
                </div>
                <p style={{ fontSize: '0.9rem' }}>{r.descripcion}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </LayoutPrincipal>
  );
}
