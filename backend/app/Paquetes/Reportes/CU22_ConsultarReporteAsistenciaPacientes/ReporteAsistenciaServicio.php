<?php

namespace App\Paquetes\Reportes\CU22_ConsultarReporteAsistenciaPacientes;

use Illuminate\Support\Facades\DB;

class ReporteAsistenciaServicio
{
    public function generarReporte(?string $fechaInicio = null, ?string $fechaFin = null): array
    {
        $inicio = $fechaInicio ?: date('Y-m-01');
        $fin = $fechaFin ?: date('Y-m-t');

        $citas = DB::table('citas')
            ->join('estados_cita', 'citas.id_estado_cita', '=', 'estados_cita.id_estado_cita')
            ->whereBetween('citas.fecha_cita', [$inicio, $fin])
            ->select('estados_cita.codigo')
            ->get();

        $total = $citas->count();
        $atendidas = $citas->where('codigo', 'atendida')->count();
        $inasistencias = $citas->where('codigo', 'inasistencia')->count();
        $canceladas = $citas->where('codigo', 'cancelada')->count();
        $otras = $total - ($atendidas + $inasistencias + $canceladas);

        $tasaAsistencia = $total > 0 ? round(($atendidas / $total) * 100, 2) : 0;
        $tasaInasistencia = $total > 0 ? round(($inasistencias / $total) * 100, 2) : 0;
        $tasaCancelacion = $total > 0 ? round(($canceladas / $total) * 100, 2) : 0;

        return [
            'periodo' => ['inicio' => $inicio, 'fin' => $fin],
            'total_citas' => $total,
            'atendidas' => $atendidas,
            'inasistencias' => $inasistencias,
            'canceladas' => $canceladas,
            'en_proceso_u_otras' => $otras,
            'porcentajes' => [
                'tasa_asistencia' => $tasaAsistencia,
                'tasa_inasistencia' => $tasaInasistencia,
                'tasa_cancelacion' => $tasaCancelacion,
            ]
        ];
    }
}
