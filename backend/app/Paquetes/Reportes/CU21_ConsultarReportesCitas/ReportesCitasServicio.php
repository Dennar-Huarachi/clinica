<?php

namespace App\Paquetes\Reportes\CU21_ConsultarReportesCitas;

use Illuminate\Support\Facades\DB;

class ReportesCitasServicio
{
    public function generarReporte(?string $fechaInicio = null, ?string $fechaFin = null): array
    {
        $inicio = $fechaInicio ?: date('Y-m-01');
        $fin = $fechaFin ?: date('Y-m-t');

        // Citas por estado
        $porEstado = DB::table('citas')
            ->join('estados_cita', 'citas.id_estado_cita', '=', 'estados_cita.id_estado_cita')
            ->whereBetween('citas.fecha_cita', [$inicio, $fin])
            ->select('estados_cita.nombre as estado', DB::raw('count(citas.id_cita) as total'))
            ->groupBy('estados_cita.nombre')
            ->get();

        // Citas por especialidad
        $porEspecialidad = DB::table('citas')
            ->join('especialidades', 'citas.id_especialidad', '=', 'especialidades.id_especialidad')
            ->whereBetween('citas.fecha_cita', [$inicio, $fin])
            ->where('citas.estado', '!=', 'cancelada')
            ->select('especialidades.nombre as especialidad', DB::raw('count(citas.id_cita) as total'))
            ->groupBy('especialidades.nombre')
            ->get();

        // Citas por médico
        $porMedico = DB::table('citas')
            ->join('medicos', 'citas.id_medico', '=', 'medicos.id_medico')
            ->join('personas', 'medicos.id_persona', '=', 'personas.id_persona')
            ->whereBetween('citas.fecha_cita', [$inicio, $fin])
            ->where('citas.estado', '!=', 'cancelada')
            ->select(
                DB::raw("personas.nombres || ' ' || personas.apellidos as medico"),
                DB::raw('count(citas.id_cita) as total')
            )
            ->groupBy('personas.nombres', 'personas.apellidos')
            ->get();

        $totalGeneral = DB::table('citas')->whereBetween('fecha_cita', [$inicio, $fin])->count();

        return [
            'periodo' => ['inicio' => $inicio, 'fin' => $fin],
            'total_citas' => $totalGeneral,
            'por_estado' => $porEstado,
            'por_especialidad' => $porEspecialidad,
            'por_medico' => $porMedico,
        ];
    }
}
