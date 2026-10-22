<?php

namespace App\Paquetes\CitasNotificaciones\CU13_RegistrarAsistenciaInasistenciaAtencion;

use Illuminate\Support\Facades\DB;
use App\Nucleo\Bitacora\ServicioBitacora;

class RegistrarAsistenciaServicio
{
    public function registrar(array $datos, ?int $idUsuarioOperador = null): void
    {
        $idCita = $datos['id_cita'];
        $codigoEstado = $datos['estado_asistencia'];

        $estadoCita = DB::table('estados_cita')->where('codigo', $codigoEstado)->first();
        if (!$estadoCita) {
            throw new \Exception("Estado de cita {$codigoEstado} no reconocido.", 422);
        }

        $cita = DB::table('citas')->where('id_cita', $idCita)->first();
        if (!$cita) {
            throw new \Exception('Cita no encontrada', 404);
        }

        $obs = $cita->observaciones;
        if (!empty($datos['observaciones'])) {
            $obs = trim(($obs ? $obs . ' | ' : '') . $datos['observaciones']);
        }

        DB::table('citas')->where('id_cita', $idCita)->update([
            'id_estado_cita' => $estadoCita->id_estado_cita,
            'observaciones' => $obs,
            'updated_at' => now(),
        ]);

        ServicioBitacora::registrar(
            'CU13_RegistrarAsistenciaInasistenciaAtencion',
            'REGISTRAR_ASISTENCIA',
            'citas',
            (string)$idCita,
            ['id_estado_cita' => $cita->id_estado_cita],
            ['id_estado_cita' => $estadoCita->id_estado_cita, 'estado' => $codigoEstado],
            $idUsuarioOperador
        );
    }
}
