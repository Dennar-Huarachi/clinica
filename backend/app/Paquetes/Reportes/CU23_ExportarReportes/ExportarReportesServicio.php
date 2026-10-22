<?php

namespace App\Paquetes\Reportes\CU23_ExportarReportes;

use Illuminate\Support\Facades\DB;
use App\Nucleo\Bitacora\ServicioBitacora;

class ExportarReportesServicio
{
    public function exportarCitasCSV(?string $fechaInicio = null, ?string $fechaFin = null, ?int $idUsuarioOperador = null): array
    {
        $inicio = $fechaInicio ?: date('Y-m-01');
        $fin = $fechaFin ?: date('Y-m-t');

        $citas = DB::table('citas')
            ->join('pacientes', 'citas.id_paciente', '=', 'pacientes.id_paciente')
            ->join('personas as p_pac', 'pacientes.id_persona', '=', 'p_pac.id_persona')
            ->join('medicos', 'citas.id_medico', '=', 'medicos.id_medico')
            ->join('personas as p_med', 'medicos.id_persona', '=', 'p_med.id_persona')
            ->join('especialidades', 'citas.id_especialidad', '=', 'especialidades.id_especialidad')
            ->join('estados_cita', 'citas.id_estado_cita', '=', 'estados_cita.id_estado_cita')
            ->whereBetween('citas.fecha_cita', [$inicio, $fin])
            ->select(
                'citas.codigo_cita',
                'citas.fecha_cita',
                'citas.hora_inicio',
                'citas.hora_fin',
                DB::raw("p_pac.nombres || ' ' || p_pac.apellidos as paciente"),
                'pacientes.codigo_historia',
                DB::raw("p_med.nombres || ' ' || p_med.apellidos as medico"),
                'especialidades.nombre as especialidad',
                'estados_cita.nombre as estado'
            )
            ->orderBy('citas.fecha_cita')
            ->get();

        ServicioBitacora::registrar(
            'CU23_ExportarReportes',
            'EXPORTAR_REPORTE_CITAS',
            'citas',
            null,
            null,
            ['registros' => count($citas), 'periodo' => "{$inicio} a {$fin}"],
            $idUsuarioOperador
        );

        return [
            'nombre_archivo' => "reporte_citas_{$inicio}_{$fin}.csv",
            'total_registros' => count($citas),
            'columnas' => ['codigo_cita', 'fecha_cita', 'hora_inicio', 'hora_fin', 'paciente', 'codigo_historia', 'medico', 'especialidad', 'estado'],
            'filas' => $citas->toArray(),
        ];
    }
}
