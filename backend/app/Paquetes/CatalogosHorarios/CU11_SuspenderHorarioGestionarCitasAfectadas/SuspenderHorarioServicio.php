<?php

namespace App\Paquetes\CatalogosHorarios\CU11_SuspenderHorarioGestionarCitasAfectadas;

use Illuminate\Support\Facades\DB;
use App\Nucleo\Bitacora\ServicioBitacora;

class SuspenderHorarioServicio
{
    public function suspender(array $datos, ?int $idUsuarioOperador = null): array
    {
        return DB::transaction(function () use ($datos, $idUsuarioOperador) {
            // 1. Registrar la suspensión
            $idSuspension = DB::table('suspensiones_horario')->insertGetId([
                'id_medico' => $datos['id_medico'],
                'fecha_inicio' => $datos['fecha_inicio'],
                'fecha_fin' => $datos['fecha_fin'],
                'motivo' => $datos['motivo'],
                'estado_citas_accion' => $datos['accion_citas'] ?? 'reprogramacion_pendiente',
                'created_at' => now(),
                'updated_at' => now(),
            ], 'id_suspension');

            // 2. Buscar estado 'postergada' (o 'cancelada')
            $estadoPostergada = DB::table('estados_cita')->where('codigo', 'postergada')->first();
            $idEstadoPostergada = $estadoPostergada ? $estadoPostergada->id_estado_cita : 8;

            // 3. Obtener citas activas del médico en ese rango de fechas
            $citasAfectadas = DB::table('citas')
                ->where('id_medico', $datos['id_medico'])
                ->whereBetween('fecha_cita', [
                    date('Y-m-d', strtotime($datos['fecha_inicio'])),
                    date('Y-m-d', strtotime($datos['fecha_fin']))
                ])
                ->where('estado', '!=', 'cancelada')
                ->get();

            $cantidadAfectadas = 0;

            foreach ($citasAfectadas as $cita) {
                // Marcar cita como postergada para reubicación prioritaria
                DB::table('citas')->where('id_cita', $cita->id_cita)->update([
                    'id_estado_cita' => $idEstadoPostergada,
                    'es_postergada' => true,
                    'observaciones' => trim(($cita->observaciones ?? '') . " [Afectada por suspensión: {$datos['motivo']}]"),
                    'updated_at' => now(),
                ]);

                // Notificar al paciente asociado (buscar usuario del paciente)
                $usuarioPaciente = DB::table('pacientes')
                    ->join('usuarios', 'pacientes.id_persona', '=', 'usuarios.id_persona')
                    ->where('pacientes.id_paciente', $cita->id_paciente)
                    ->select('usuarios.id_usuario')
                    ->first();

                if ($usuarioPaciente) {
                    DB::table('notificaciones')->insert([
                        'id_usuario' => $usuarioPaciente->id_usuario,
                        'tipo' => 'suspension_horario',
                        'titulo' => 'Aviso: Suspensión de turno médico',
                        'mensaje' => "Su cita con código {$cita->codigo_cita} programada para el {$cita->fecha_cita} a las {$cita->hora_inicio} ha sido postergada debido a: {$datos['motivo']}. Dispone de prioridad de reubicación.",
                        'metadata' => json_encode(['id_cita' => $cita->id_cita, 'id_suspension' => $idSuspension]),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                $cantidadAfectadas++;
            }

            ServicioBitacora::registrar(
                'CU11_SuspenderHorarioGestionarCitasAfectadas',
                'SUSPENDER_HORARIO_MEDICO',
                'suspensiones_horario',
                (string)$idSuspension,
                null,
                ['citas_afectadas' => $cantidadAfectadas, 'motivo' => $datos['motivo']],
                $idUsuarioOperador
            );

            return [
                'id_suspension' => $idSuspension,
                'citas_afectadas' => $cantidadAfectadas,
                'mensaje' => "Suspensión registrada. {$cantidadAfectadas} citas fueron marcadas para reprogramación prioritaria y los pacientes han sido notificados."
            ];
        });
    }

    public function listarSuspensiones(?int $idMedico = null): array
    {
        $query = DB::table('suspensiones_horario')
            ->join('medicos', 'suspensiones_horario.id_medico', '=', 'medicos.id_medico')
            ->join('personas', 'medicos.id_persona', '=', 'personas.id_persona')
            ->select(
                'suspensiones_horario.*',
                'personas.nombres as medico_nombres',
                'personas.apellidos as medico_apellidos'
            )
            ->orderBy('suspensiones_horario.id_suspension', 'desc');

        if ($idMedico) {
            $query->where('suspensiones_horario.id_medico', $idMedico);
        }

        return $query->get()->toArray();
    }
}
