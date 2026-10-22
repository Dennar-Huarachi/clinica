import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../compartido/utilidades/api';
import CampoTexto from '../../../compartido/componentes/CampoTexto';
import Alerta from '../../../compartido/componentes/Alerta';
import LayoutPrincipal from '../../../compartido/layouts/LayoutPrincipal';

export default function FormularioAtencionClinica() {
  const { idCita } = useParams();
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    id_cita: Number(idCita),
    motivo_atencion: '',
    examen_fisico: '',
    diagnostico: '',
    tratamiento_indicaciones: '',
    receta_medica: '',
  });

  const [errores, setErrores] = useState({});
  const [alerta, setAlerta] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setAlerta(null);
    setErrores({});
    setEnviando(true);

    try {
      await api.post('/historia-clinica/atenciones', formulario);
      setAlerta({ tipo: 'exito', mensaje: 'Atención clínica registrada y cita concluida exitosamente.' });
      setTimeout(() => navigate('/citas/agenda'), 1200);
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errores) {
        setErrores(err.response.data.errores);
      } else {
        setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al guardar la atención médica.' });
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <LayoutPrincipal>
      <div style={{ maxWidth: '750px', margin: '1rem auto' }}>
        <div className="tarjeta">
          <h2 className="titulo" style={{ marginBottom: '0.25rem' }}>
            <b>Registro</b> <span>de Consulta Médica (Cita #{idCita})</span>
          </h2>
          <p style={{ color: 'var(--texto-sec)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Ingresa la evaluación clínica, diagnóstico del paciente y plan terapéutico.
          </p>

          <Alerta tipo={alerta?.tipo} mensaje={alerta?.mensaje} />

          <form onSubmit={manejarEnvio}>
            <CampoTexto
              etiqueta="Motivo de la Atención y Anamnesis"
              nombre="motivo_atencion"
              valor={formulario.motivo_atencion}
              alCambiar={(e) => setFormulario({ ...formulario, motivo_atencion: e.target.value })}
              error={errores.motivo_atencion?.[0] || errores.motivo_atencion}
              marcador="Describa el cuadro clínico presentado por el paciente…"
              filas={3}
              requerido
            />

            <CampoTexto
              etiqueta="Examen Físico y Signos Vitales"
              nombre="examen_fisico"
              valor={formulario.examen_fisico}
              alCambiar={(e) => setFormulario({ ...formulario, examen_fisico: e.target.value })}
              error={errores.examen_fisico?.[0] || errores.examen_fisico}
              marcador="Tensión arterial, FC, FR, temperatura, peso, auscultación…"
              filas={3}
            />

            <CampoTexto
              etiqueta="Diagnóstico Clínico"
              nombre="diagnostico"
              valor={formulario.diagnostico}
              alCambiar={(e) => setFormulario({ ...formulario, diagnostico: e.target.value })}
              error={errores.diagnostico?.[0] || errores.diagnostico}
              marcador="Diagnóstico presuntivo o definitivo (CIE-10 / clínico)…"
              filas={2}
              requerido
            />

            <CampoTexto
              etiqueta="Tratamiento e Indicaciones Médicas"
              nombre="tratamiento_indicaciones"
              valor={formulario.tratamiento_indicaciones}
              alCambiar={(e) => setFormulario({ ...formulario, tratamiento_indicaciones: e.target.value })}
              error={errores.tratamiento_indicaciones?.[0] || errores.tratamiento_indicaciones}
              marcador="Recomendaciones, cuidados generales y pautas de seguimiento…"
              filas={3}
              requerido
            />

            <CampoTexto
              etiqueta="Receta / Prescripción Farmacológica"
              nombre="receta_medica"
              valor={formulario.receta_medica}
              alCambiar={(e) => setFormulario({ ...formulario, receta_medica: e.target.value })}
              error={errores.receta_medica?.[0] || errores.receta_medica}
              marcador="Medicamento, dosis, vía de administración y duración del tratamiento…"
              filas={3}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => navigate('/citas/agenda')}
                className="boton-terciario"
              >
                Volver a la Agenda
              </button>

              <button
                type="submit"
                className="boton-primario"
                disabled={enviando}
              >
                {enviando ? 'Guardando consulta…' : 'Finalizar y Concluir Atención'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </LayoutPrincipal>
  );
}
