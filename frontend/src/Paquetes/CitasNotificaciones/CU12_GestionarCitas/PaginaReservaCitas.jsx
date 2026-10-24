import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../compartido/utilidades/api';
import CampoTexto from '../../../compartido/componentes/CampoTexto';
import CampoSelect from '../../../compartido/componentes/CampoSelect';
import Alerta from '../../../compartido/componentes/Alerta';
import LayoutPrincipal from '../../../compartido/layouts/LayoutPrincipal';
import SelectorDisponibilidadTurnos from '../../CatalogosHorarios/CU10_ConsultarDisponibilidad/SelectorDisponibilidadTurnos';
import ModalPasarelaPagoSimulada from '../CU27_GestionarPagosReembolsos/ModalPasarelaPagoSimulada';
import ComprobanteDigitalTransaccion from '../CU27_GestionarPagosReembolsos/ComprobanteDigitalTransaccion';

export default function PaginaReservaCitas() {
  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);

  const [idEspecialidad, setIdEspecialidad] = useState('');
  const [idMedico, setIdMedico] = useState('');
  const [idPaciente, setIdPaciente] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [motivoConsulta, setMotivoConsulta] = useState('');

  const [errores, setErrores] = useState({});
  const [alerta, setAlerta] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Estados para Modal de Pago Autónomo (CU-27 / D17)
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [comprobanteExito, setComprobanteExito] = useState(null);

  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario_clinica') || '{}');
  const esPersonal = ['administrador', 'recepcionista'].includes((usuario?.rol || '').toLowerCase());

  // Cargar especialidades y pacientes
  useEffect(() => {
    api.get('/catalogos/especialidades-publicas')
      .then((res) => setEspecialidades(res.data.datos || []))
      .catch(() => {});

    if (esPersonal) {
      api.get('/pacientes')
        .then((res) => setPacientes(res.data.datos || []))
        .catch(() => {});
    }
  }, [esPersonal]);

  // Filtrar médicos al cambiar especialidad
  useEffect(() => {
    if (idEspecialidad) {
      api.get(`/catalogos/medicos-publicos?id_especialidad=${idEspecialidad}`)
        .then((res) => {
          setMedicos(res.data.datos || []);
          setIdMedico('');
          setTurnoSeleccionado(null);
        })
        .catch(() => {});
    } else {
      setMedicos([]);
      setIdMedico('');
      setTurnoSeleccionado(null);
    }
  }, [idEspecialidad]);

  // Paso 1: Abrir Modal de Pago Simulado
  const iniciarProcesoReserva = (e) => {
    e.preventDefault();
    setAlerta(null);
    setErrores({});

    if (!turnoSeleccionado) {
      setAlerta({ tipo: 'error', mensaje: 'Debe seleccionar un turno disponible en la lista inferior.' });
      return;
    }

    if (esPersonal && !idPaciente) {
      setAlerta({ tipo: 'error', mensaje: 'Debe seleccionar el paciente destinatario de la cita.' });
      return;
    }

    setMostrarModalPago(true);
  };

  // Paso 2: Procesar Pago Simulado y Crear Cita Atómica (CU-12 + CU-27)
  const procesarPagoYConfirmar = async (datosPago) => {
    setEnviando(true);
    setAlerta(null);

    const payload = {
      id_especialidad: Number(idEspecialidad),
      id_medico: Number(idMedico),
      fecha_cita: fecha,
      hora_inicio: turnoSeleccionado.hora_inicio,
      motivo_consulta: motivoConsulta,
      metodo_pago: datosPago.metodo_pago,
      referencia_simulada: datosPago.referencia_simulada,
      detalles_pasarela: datosPago.detalles_pasarela,
    };

    if (esPersonal) {
      payload.id_paciente = Number(idPaciente);
    } else {
      payload.id_paciente = usuario.id_paciente;
    }

    try {
      const res = await api.post('/citas', payload);
      const datosCita = res.data.datos;

      setComprobanteExito({
        codigo_cita: datosCita.codigo_cita,
        nro_transaccion: datosCita.nro_transaccion,
        monto: datosCita.monto_reserva || 50.00,
        fecha: fecha,
        hora: turnoSeleccionado.hora_inicio,
        especialidad: especialidades.find((e) => Number(e.id_especialidad) === Number(idEspecialidad))?.nombre,
        medico: medicos.find((m) => Number(m.id_medico) === Number(idMedico))?.apellidos,
        metodo_pago: datosPago.metodo_pago === 'qr_transferencia' ? 'Simple QR Interoperable' : 'Tarjeta de Débito/Crédito',
      });

      setMostrarModalPago(false);
      setTurnoSeleccionado(null);
      setMotivoConsulta('');
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errores) {
        setErrores(err.response.data.errores);
      } else {
        setAlerta({
          tipo: 'error',
          mensaje: err.response?.data?.mensaje || 'No se pudo reservar el turno médico ni procesar el pago.',
        });
      }
      setMostrarModalPago(false);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <LayoutPrincipal>
      <div style={{ maxWidth: '800px', margin: '0.5rem auto', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
        <div className="tarjeta" style={{ overflowX: 'hidden', width: '100%', boxSizing: 'border-box' }}>
          <h2 className="titulo" style={{ marginBottom: '0.25rem' }}>
            <b>Reserva</b> <span>de Citas Médicas</span>
          </h2>
          <p style={{ color: 'var(--texto-sec)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Selecciona la especialidad, el médico y el horario de tu preferencia con garantía de reserva (D17, RN15).
          </p>

          <Alerta tipo={alerta?.tipo} mensaje={alerta?.mensaje} />

          <form onSubmit={iniciarProcesoReserva}>
            {esPersonal && (
              <CampoSelect
                etiqueta="Paciente Destinatario"
                nombre="id_paciente"
                valor={idPaciente}
                alCambiar={(e) => setIdPaciente(e.target.value)}
                error={errores.id_paciente?.[0] || errores.id_paciente}
                opciones={pacientes.map((p) => ({
                  valor: p.id_paciente,
                  etiqueta: `${p.apellidos}, ${p.nombres} (CI: ${p.ci || 'S/N'} - Hist: ${p.codigo_historia})`,
                }))}
                requerido
              />
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0 1rem' }}>
              <CampoSelect
                etiqueta="Especialidad Médica"
                nombre="id_especialidad"
                valor={idEspecialidad}
                alCambiar={(e) => {
                  setIdEspecialidad(e.target.value);
                  setTurnoSeleccionado(null);
                }}
                error={errores.id_especialidad?.[0] || errores.id_especialidad}
                opciones={especialidades.map((esp) => ({
                  valor: esp.id_especialidad,
                  etiqueta: `${esp.nombre} (${esp.duracion_turno_minutos} min)`,
                }))}
                requerido
              />

              <CampoSelect
                etiqueta="Médico Especialista"
                nombre="id_medico"
                valor={idMedico}
                alCambiar={(e) => {
                  setIdMedico(e.target.value);
                  setTurnoSeleccionado(null);
                }}
                error={errores.id_medico?.[0] || errores.id_medico}
                opciones={medicos.map((med) => ({
                  valor: med.id_medico,
                  etiqueta: `Dr. ${med.apellidos}, ${med.nombres} (Matrícula: ${med.nro_matricula})`,
                }))}
                deshabilitado={!idEspecialidad}
                requerido
              />
            </div>

            <CampoTexto
              etiqueta="Fecha de la Consulta"
              nombre="fecha_cita"
              tipo="date"
              valor={fecha}
              alCambiar={(e) => {
                setFecha(e.target.value);
                setTurnoSeleccionado(null);
              }}
              error={errores.fecha_cita?.[0] || errores.fecha_cita}
              requerido
            />

            {/* Selector Modular de Turnos / Disponibilidad (CU-10) */}
            <SelectorDisponibilidadTurnos
              idEspecialidad={idEspecialidad}
              idMedico={idMedico}
              fecha={fecha}
              onSeleccionarTurno={(turno) => setTurnoSeleccionado(turno)}
              turnoSeleccionado={turnoSeleccionado}
            />

            <CampoTexto
              etiqueta="Motivo de la Consulta (Opcional)"
              nombre="motivo_consulta"
              valor={motivoConsulta}
              alCambiar={(e) => setMotivoConsulta(e.target.value)}
              error={errores.motivo_consulta?.[0] || errores.motivo_consulta}
              marcador="Describa brevemente sus síntomas o motivo de atención"
              filas={3}
            />

            <button
              type="submit"
              className="boton-primario"
              style={{ width: '100%', minHeight: '48px', fontSize: '1rem', marginTop: '0.5rem' }}
              disabled={enviando || !turnoSeleccionado}
            >
              Continuar con la Garantía de Reserva (50.00 Bs) ➔
            </button>
          </form>
        </div>

        {/* Modal Autónomo de Pasarela de Pago Simulado (CU-27 / D17) */}
        <ModalPasarelaPagoSimulada
          abierto={mostrarModalPago}
          alCerrar={() => setMostrarModalPago(false)}
          alConfirmarPago={procesarPagoYConfirmar}
          procesando={enviando}
          monto={50.00}
          detalleTurno={{
            fecha,
            hora: turnoSeleccionado?.hora_inicio,
            especialidad: especialidades.find((e) => Number(e.id_especialidad) === Number(idEspecialidad))?.nombre,
            medico: medicos.find((m) => Number(m.id_medico) === Number(idMedico))?.apellidos,
          }}
        />

        {/* Comprobante Digital Oficial Autónomo (CU-27 / D17) */}
        <ComprobanteDigitalTransaccion
          comprobante={comprobanteExito}
          alCerrar={() => setComprobanteExito(null)}
          alIrAHistorial={() => navigate('/citas/historial')}
        />
      </div>
    </LayoutPrincipal>
  );
}
