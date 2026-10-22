<?php

namespace App\Paquetes\CitasNotificaciones\CU16_EnviarNotificacionesRecordatorios;

use Illuminate\Support\Facades\DB;
use App\Nucleo\Bitacora\ServicioBitacora;

class EnviarNotificacionesServicio
{
    public function listarPorUsuario(int $idUsuario, bool $soloNoLeidas = false): array
    {
        $query = DB::table('notificaciones')
            ->where('id_usuario', $idUsuario)
            ->orderBy('id_notificacion', 'desc');

        if ($soloNoLeidas) {
            $query->where('leido', false);
        }

        return $query->get()->toArray();
    }

    public function marcarLeida(int $idNotificacion, int $idUsuario): void
    {
        DB::table('notificaciones')
            ->where('id_notificacion', $idNotificacion)
            ->where('id_usuario', $idUsuario)
            ->update([
                'leido' => true,
                'fecha_leido' => now(),
                'updated_at' => now(),
            ]);
    }

    public function enviarRecordatoriosProximos(): int
    {
        // Genera recordatorios para citas del día de mañana
        $manana = date('Y-m-d', strtotime('+1 day'));

        $citasManana = DB::table('citas')
            ->join('pacientes', 'citas.id_paciente', '=', 'pacientes.id_paciente')
            ->join('usuarios', 'pacientes.id_persona', '=', 'usuarios.id_persona')
            ->where('citas.fecha_cita', $manana)
            ->where('citas.estado', '!=', 'cancelada')
            ->select('citas.*', 'usuarios.id_usuario')
            ->get();

        $enviados = 0;
        foreach ($citasManana as $cita) {
            // Verificar si ya se envió recordatorio
            $existe = DB::table('notificaciones')
                ->where('id_usuario', $cita->id_usuario)
                ->where('tipo', 'recordatorio_cita')
                ->where('metadata->id_cita', $cita->id_cita)
                ->exists();

            if (!$existe) {
                DB::table('notificaciones')->insert([
                    'id_usuario' => $cita->id_usuario,
                    'tipo' => 'recordatorio_cita',
                    'titulo' => 'Recordatorio de cita médica para mañana',
                    'mensaje' => "Le recordamos que tiene una cita médica programada para mañana {$cita->fecha_cita} a las {$cita->hora_inicio}. Código: {$cita->codigo_cita}.",
                    'metadata' => json_encode(['id_cita' => $cita->id_cita]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $enviados++;
            }
        }

        ServicioBitacora::registrar(
            'CU16_EnviarNotificacionesRecordatorios',
            'ENVIAR_RECORDATORIOS_CITAS',
            'notificaciones',
            null,
            null,
            ['enviados' => $enviados, 'fecha_objetivo' => $manana]
        );

        return $enviados;
    }
}
