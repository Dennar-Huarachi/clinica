<?php

namespace App\Paquetes\CitasNotificaciones\CU12_GestionarCitas;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Nucleo\Bitacora\ServicioBitacora;

class GestionarCitasServicio
{
    /**
     * Reserva atómica de cita médica con control de concurrencia y prevención de solapamientos.
     */
    public function crear(array $datos, ?int $idUsuarioOperador = null): array
    {
        return DB::transaction(function () use ($datos, $idUsuarioOperador) {
            $fecha = $datos['fecha_cita'];
            $horaInicioStr = $datos['hora_inicio'];
            $idMedico = $datos['id_medico'];
            $idEspecialidad = $datos['id_especialidad'];
            $idPaciente = $datos['id_paciente'];

            // 1. Obtener duración del turno para calcular hora_fin
            $especialidad = DB::table('especialidades')->where('id_especialidad', $idEspecialidad)->first();
            $duracion = $especialidad?->duracion_turno_minutos ?: 15;

            $horaInicio = Carbon::parse($fecha . ' ' . $horaInicioStr);
            $horaFin = $horaInicio->copy()->addMinutes($duracion);
            $horaFinStr = $horaFin->format('H:i');

            // 2. Control de concurrencia: Bloquear consultas activas del médico para esta fecha
            // Previene condición de carrera (race conditions) entre dos usuarios intentando el mismo turno al mismo segundo
            $solapamiento = DB::table('citas')
                ->where('id_medico', $idMedico)
                ->where('fecha_cita', $fecha)
                ->where('estado', '!=', 'cancelada')
                ->where(function ($q) use ($horaInicioStr, $horaFinStr) {
                    $q->where(function ($inner) use ($horaInicioStr, $horaFinStr) {
                        $inner->where('hora_inicio', '<', $horaFinStr)
                              ->where('hora_fin', '>', $horaInicioStr);
                    });
                })
                ->lockForUpdate()
                ->first();

            if ($solapamiento) {
                throw new \Exception("El turno médico seleccionado ({$horaInicioStr} - {$horaFinStr}) ya ha sido reservado por otro paciente. Por favor elija otro turno disponible.", 409);
            }

            // 3. Verificar bloqueos de clínica o médico
            $bloqueo = DB::table('bloqueos_clinica')
                ->where('estado', 'activo')
                ->where(function ($q) use ($idMedico) {
                    $q->where('aplica_a_todos', true)->orWhere('id_medico', $idMedico);
                })
                ->where('fecha_inicio', '<=', $horaFin)
                ->where('fecha_fin', '>=', $horaInicio)
                ->first();

            if ($bloqueo) {
                throw new \Exception("No es posible agendar: La clínica o el médico presentan un bloqueo programado ({$bloqueo->titulo}).", 422);
            }

            // 4. Verificar suspensiones
            $suspension = DB::table('suspensiones_horario')
                ->where('id_medico', $idMedico)
                ->where('fecha_inicio', '<=', $horaFin)
                ->where('fecha_fin', '>=', $horaInicio)
                ->first();

            if ($suspension) {
                throw new \Exception("No es posible agendar: El médico tiene una suspensión de actividades programada ({$suspension->motivo}).", 422);
            }

            // 5. Estado inicial: 'pendiente' (id=1)
            $estadoPendiente = DB::table('estados_cita')->where('codigo', 'pendiente')->first();
            $idEstado = $estadoPendiente ? $estadoPendiente->id_estado_cita : 1;

            $codigoCita = 'CIT-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

            $idCita = DB::table('citas')->insertGetId([
                'codigo_cita' => $codigoCita,
                'id_paciente' => $idPaciente,
                'id_medico' => $idMedico,
                'id_especialidad' => $idEspecialidad,
                'id_estado_cita' => $idEstado,
                'fecha_cita' => $fecha,
                'hora_inicio' => $horaInicioStr,
                'hora_fin' => $horaFinStr,
                'motivo_consulta' => $datos['motivo_consulta'] ?? null,
                'observaciones' => $datos['observaciones'] ?? null,
                'es_postergada' => false,
                'creado_por_usuario' => $idUsuarioOperador,
                'estado' => 'activo',
                'created_at' => now(),
                'updated_at' => now(),
            ], 'id_cita');

            // Registrar notificación para el paciente
            $usuarioPaciente = DB::table('pacientes')
                ->join('usuarios', 'pacientes.id_persona', '=', 'usuarios.id_persona')
                ->where('pacientes.id_paciente', $idPaciente)
                ->select('usuarios.id_usuario')
                ->first();

            if ($usuarioPaciente) {
                DB::table('notificaciones')->insert([
                    'id_usuario' => $usuarioPaciente->id_usuario,
                    'tipo' => 'confirmacion_cita',
                    'titulo' => 'Cita reservada con éxito',
                    'mensaje' => "Su cita con código {$codigoCita} ha sido reservada para el {$fecha} a las {$horaInicioStr}.",
                    'metadata' => json_encode(['id_cita' => $idCita, 'codigo_cita' => $codigoCita]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            ServicioBitacora::registrar(
                'CU12_GestionarCitas',
                'CREAR_CITA',
                'citas',
                (string)$idCita,
                null,
                ['codigo_cita' => $codigoCita, 'fecha' => $fecha, 'hora' => $horaInicioStr],
                $idUsuarioOperador
            );

            return [
                'id_cita' => $idCita,
                'codigo_cita' => $codigoCita,
                'fecha_cita' => $fecha,
                'hora_inicio' => $horaInicioStr,
                'hora_fin' => $horaFinStr,
            ];
        });
    }

    /**
     * Reprogramación atómica de cita médica con validación de no colisión.
     */
    public function reprogramar(int $idCita, array $datos, ?int $idUsuarioOperador = null): array
    {
        return DB::transaction(function () use ($idCita, $datos, $idUsuarioOperador) {
            $cita = DB::table('citas')->where('id_cita', $idCita)->lockForUpdate()->first();
            if (!$cita || $cita->estado === 'cancelada') {
                throw new \Exception('La cita indicada no existe o ya está cancelada.', 404);
            }

            $fecha = $datos['fecha_cita'];
            $horaInicioStr = $datos['hora_inicio'];

            $especialidad = DB::table('especialidades')->where('id_especialidad', $cita->id_especialidad)->first();
            $duracion = $especialidad?->duracion_turno_minutos ?: 15;

            $horaInicio = Carbon::parse($fecha . ' ' . $horaInicioStr);
            $horaFin = $horaInicio->copy()->addMinutes($duracion);
            $horaFinStr = $horaFin->format('H:i');

            // Verificar solapamiento
            $solapamiento = DB::table('citas')
                ->where('id_medico', $cita->id_medico)
                ->where('fecha_cita', $fecha)
                ->where('id_cita', '!=', $idCita)
                ->where('estado', '!=', 'cancelada')
                ->where(function ($q) use ($horaInicioStr, $horaFinStr) {
                    $q->where('hora_inicio', '<', $horaFinStr)
                      ->where('hora_fin', '>', $horaInicioStr);
                })
                ->lockForUpdate()
                ->first();

            if ($solapamiento) {
                throw new \Exception("El nuevo turno seleccionado ({$horaInicioStr} - {$horaFinStr}) ya está ocupado.", 409);
            }

            // Estado reprogramada (id=7)
            $estadoReprogramada = DB::table('estados_cita')->where('codigo', 'reprogramada')->first();
            $idEstado = $estadoReprogramada ? $estadoReprogramada->id_estado_cita : 7;

            $obs = trim(($cita->observaciones ?? '') . " [Reprogramada del {$cita->fecha_cita} {$cita->hora_inicio} a {$fecha} {$horaInicioStr}: " . ($datos['motivo_reprogramacion'] ?? 'Solicitud') . "]");

            DB::table('citas')->where('id_cita', $idCita)->update([
                'fecha_cita' => $fecha,
                'hora_inicio' => $horaInicioStr,
                'hora_fin' => $horaFinStr,
                'id_estado_cita' => $idEstado,
                'es_postergada' => false,
                'observaciones' => $obs,
                'updated_at' => now(),
            ]);

            ServicioBitacora::registrar(
                'CU12_GestionarCitas',
                'REPROGRAMAR_CITA',
                'citas',
                (string)$idCita,
                ['fecha' => $cita->fecha_cita, 'hora' => $cita->hora_inicio],
                ['fecha' => $fecha, 'hora' => $horaInicioStr],
                $idUsuarioOperador
            );

            return [
                'id_cita' => $idCita,
                'codigo_cita' => $cita->codigo_cita,
                'nueva_fecha' => $fecha,
                'nueva_hora' => $horaInicioStr,
            ];
        });
    }

    /**
     * Cancelación lógica de cita (PROHIBIDO BORRADO FÍSICO).
     * Aplica la regla de HORAS_ANTICIPACION_CANCELAR cuando es cancelada por el paciente.
     */
    public function cancelar(int $idCita, ?string $motivo = null, ?object $usuarioOperador = null): void
    {
        DB::transaction(function () use ($idCita, $motivo, $usuarioOperador) {
            $cita = DB::table('citas')->where('id_cita', $idCita)->lockForUpdate()->first();
            if (!$cita) {
                throw new \Exception('Cita no encontrada', 404);
            }

            if ($cita->estado === 'cancelada') {
                throw new \Exception('La cita ya se encuentra cancelada', 400);
            }

            // Validar anticipación si es el paciente quien cancela
            $rol = strtolower($usuarioOperador->rol ?? '');
            if ($rol === 'paciente') {
                $paramHoras = DB::table('parametros_sistema')->where('clave', 'HORAS_ANTICIPACION_CANCELAR')->value('valor') ?: 2;
                $horasMinimas = (int)$paramHoras;

                $fechaHoraCita = Carbon::parse($cita->fecha_cita . ' ' . $cita->hora_inicio);
                if (now()->diffInHours($fechaHoraCita, false) < $horasMinimas) {
                    throw new \Exception("Las citas deben cancelarse con al menos {$horasMinimas} horas de anticipación. Por favor comuníquese telefónicamente con recepción.", 422);
                }
            }

            $estadoCancelada = DB::table('estados_cita')->where('codigo', 'cancelada')->first();
            $idEstado = $estadoCancelada ? $estadoCancelada->id_estado_cita : 5;

            $obs = trim(($cita->observaciones ?? '') . " [Cancelada: " . ($motivo ?? 'Sin motivo especificado') . "]");

            DB::table('citas')->where('id_cita', $idCita)->update([
                'id_estado_cita' => $idEstado,
                'estado' => 'cancelada', // Cambio de estado lógico, no delete físico
                'observaciones' => $obs,
                'updated_at' => now(),
            ]);

            ServicioBitacora::registrar(
                'CU12_GestionarCitas',
                'CANCELAR_CITA',
                'citas',
                (string)$idCita,
                ['estado' => $cita->estado],
                ['estado' => 'cancelada', 'motivo' => $motivo],
                $usuarioOperador?->id_usuario
            );
        });
    }

    public function listar(?string $fecha = null, ?int $idMedico = null, ?int $idPaciente = null, ?string $estado = null): array
    {
        $query = DB::table('citas')
            ->join('pacientes', 'citas.id_paciente', '=', 'pacientes.id_paciente')
            ->join('personas as per_paciente', 'pacientes.id_persona', '=', 'per_paciente.id_persona')
            ->join('medicos', 'citas.id_medico', '=', 'medicos.id_medico')
            ->join('personas as per_medico', 'medicos.id_persona', '=', 'per_medico.id_persona')
            ->join('especialidades', 'citas.id_especialidad', '=', 'especialidades.id_especialidad')
            ->join('estados_cita', 'citas.id_estado_cita', '=', 'estados_cita.id_estado_cita')
            ->select(
                'citas.*',
                'per_paciente.nombres as paciente_nombres',
                'per_paciente.apellidos as paciente_apellidos',
                'per_paciente.ci as paciente_ci',
                'per_paciente.telefono as paciente_telefono',
                'pacientes.codigo_historia',
                'per_medico.nombres as medico_nombres',
                'per_medico.apellidos as medico_apellidos',
                'medicos.nro_matricula',
                'especialidades.nombre as especialidad_nombre',
                'estados_cita.codigo as estado_cita_codigo',
                'estados_cita.nombre as estado_cita_nombre'
            )
            ->orderBy('citas.fecha_cita', 'desc')
            ->orderBy('citas.hora_inicio', 'asc');

        if ($fecha) {
            $query->where('citas.fecha_cita', $fecha);
        }
        if ($idMedico) {
            $query->where('citas.id_medico', $idMedico);
        }
        if ($idPaciente) {
            $query->where('citas.id_paciente', $idPaciente);
        }
        if ($estado) {
            $query->where('estados_cita.codigo', $estado);
        }

        return $query->get()->toArray();
    }
}
