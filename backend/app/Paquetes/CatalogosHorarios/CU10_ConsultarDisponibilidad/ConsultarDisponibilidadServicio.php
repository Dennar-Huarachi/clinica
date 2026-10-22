<?php

namespace App\Paquetes\CatalogosHorarios\CU10_ConsultarDisponibilidad;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ConsultarDisponibilidadServicio
{
    /**
     * Consulta y calcula los turnos disponibles para un médico en una fecha y especialidad.
     */
    public function consultar(int $idMedico, int $idEspecialidad, string $fecha): array
    {
        $carbonFecha = Carbon::parse($fecha);
        // Carbon isoFormat('E') returns 1 for Monday to 7 for Sunday
        $diaSemana = (int)$carbonFecha->dayOfWeekIso;

        // 1. Verificar bloqueos de clínica en esa fecha
        $bloqueoClinica = DB::table('bloqueos_clinica')
            ->where('estado', 'activo')
            ->where(function ($q) use ($idMedico) {
                $q->where('aplica_a_todos', true)
                  ->orWhere('id_medico', $idMedico);
            })
            ->where('fecha_inicio', '<=', $carbonFecha->endOfDay())
            ->where('fecha_fin', '>=', $carbonFecha->startOfDay())
            ->first();

        if ($bloqueoClinica) {
            return [
                'disponible' => false,
                'motivo_bloqueo' => 'La clínica o el profesional presenta un bloqueo programado: ' . $bloqueoClinica->titulo,
                'turnos' => []
            ];
        }

        // 2. Verificar suspensiones del médico
        $suspension = DB::table('suspensiones_horario')
            ->where('id_medico', $idMedico)
            ->where('fecha_inicio', '<=', $carbonFecha->endOfDay())
            ->where('fecha_fin', '>=', $carbonFecha->startOfDay())
            ->first();

        if ($suspension) {
            return [
                'disponible' => false,
                'motivo_bloqueo' => 'El médico cuenta con una suspensión de actividades: ' . $suspension->motivo,
                'turnos' => []
            ];
        }

        // 3. Obtener horarios de atención configurados para ese día de la semana
        $horarios = DB::table('horarios_atencion')
            ->where('id_medico', $idMedico)
            ->where('id_especialidad', $idEspecialidad)
            ->where('dia_semana', $diaSemana)
            ->where('estado', 'activo')
            ->get();

        if ($horarios->isEmpty()) {
            return [
                'disponible' => false,
                'motivo_bloqueo' => 'El médico no tiene horario de consulta configurado para este día.',
                'turnos' => []
            ];
        }

        // 4. Obtener citas ya agendadas (no canceladas)
        $citasAgendadas = DB::table('citas')
            ->where('id_medico', $idMedico)
            ->where('fecha_cita', $fecha)
            ->where('estado', '!=', 'cancelada')
            ->select('hora_inicio', 'hora_fin', 'codigo_cita', 'es_postergada')
            ->get()
            ->keyBy(fn ($item) => substr($item->hora_inicio, 0, 5));

        $turnos = [];

        foreach ($horarios as $horario) {
            $inicio = Carbon::parse($fecha . ' ' . $horario->hora_inicio);
            $fin = Carbon::parse($fecha . ' ' . $horario->hora_fin);
            $intervalo = $horario->duracion_intervalo_minutos ?: 15;

            while ($inicio->copy()->addMinutes($intervalo)->lte($fin)) {
                $horaSlot = $inicio->format('H:i');
                $horaFinSlot = $inicio->copy()->addMinutes($intervalo)->format('H:i');

                $ocupado = $citasAgendadas->has($horaSlot);

                $turnos[] = [
                    'hora_inicio' => $horaSlot,
                    'hora_fin' => $horaFinSlot,
                    'disponible' => !$ocupado,
                    'estado_turno' => $ocupado ? 'ocupado' : 'libre',
                ];

                $inicio->addMinutes($intervalo);
            }
        }

        return [
            'disponible' => true,
            'motivo_bloqueo' => null,
            'turnos' => $turnos,
        ];
    }
}
