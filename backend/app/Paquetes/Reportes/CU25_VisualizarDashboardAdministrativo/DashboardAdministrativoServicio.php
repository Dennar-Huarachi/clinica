<?php

namespace App\Paquetes\Reportes\CU25_VisualizarDashboardAdministrativo;

use Illuminate\Support\Facades\DB;

class DashboardAdministrativoServicio
{
    public function obtenerMetricas(): array
    {
        $hoy = date('Y-m-d');

        // Total pacientes
        $totalPacientes = DB::table('pacientes')->where('estado', 'activo')->count();

        // Médicos activos
        $totalMedicos = DB::table('medicos')->where('estado', 'activo')->count();

        // Especialidades activas
        $totalEspecialidades = DB::table('especialidades')->where('estado', 'activo')->count();

        // Citas de hoy
        $citasHoy = DB::table('citas')->where('fecha_cita', $hoy)->count();
        $citasAtendidasHoy = DB::table('citas')
            ->join('estados_cita', 'citas.id_estado_cita', '=', 'estados_cita.id_estado_cita')
            ->where('citas.fecha_cita', $hoy)
            ->where('estados_cita.codigo', 'atendida')
            ->count();

        $citasPendientesHoy = DB::table('citas')
            ->join('estados_cita', 'citas.id_estado_cita', '=', 'estados_cita.id_estado_cita')
            ->where('citas.fecha_cita', $hoy)
            ->whereIn('estados_cita.codigo', ['pendiente', 'confirmada', 'en_espera'])
            ->count();

        // Citas de la semana
        $inicioSemana = date('Y-m-d', strtotime('monday this week'));
        $finSemana = date('Y-m-d', strtotime('sunday this week'));
        $citasSemana = DB::table('citas')
            ->whereBetween('fecha_cita', [$inicioSemana, $finSemana])
            ->where('estado', '!=', 'cancelada')
            ->count();

        // Últimas citas registradas
        $ultimasCitas = DB::table('citas')
            ->join('pacientes', 'citas.id_paciente', '=', 'pacientes.id_paciente')
            ->join('personas as p_pac', 'pacientes.id_persona', '=', 'p_pac.id_persona')
            ->join('medicos', 'citas.id_medico', '=', 'medicos.id_medico')
            ->join('personas as p_med', 'medicos.id_persona', '=', 'p_med.id_persona')
            ->join('especialidades', 'citas.id_especialidad', '=', 'especialidades.id_especialidad')
            ->join('estados_cita', 'citas.id_estado_cita', '=', 'estados_cita.id_estado_cita')
            ->select(
                'citas.id_cita',
                'citas.codigo_cita',
                'citas.fecha_cita',
                'citas.hora_inicio',
                DB::raw("p_pac.nombres || ' ' || p_pac.apellidos as paciente"),
                DB::raw("p_med.nombres || ' ' || p_med.apellidos as medico"),
                'especialidades.nombre as especialidad',
                'estados_cita.codigo as estado_codigo',
                'estados_cita.nombre as estado_nombre'
            )
            ->orderBy('citas.id_cita', 'desc')
            ->limit(7)
            ->get();

        return [
            'fecha_actual' => $hoy,
            'kpis' => [
                'total_pacientes' => $totalPacientes,
                'total_medicos' => $totalMedicos,
                'total_especialidades' => $totalEspecialidades,
                'citas_hoy' => $citasHoy,
                'citas_atendidas_hoy' => $citasAtendidasHoy,
                'citas_pendientes_hoy' => $citasPendientesHoy,
                'citas_semana' => $citasSemana,
            ],
            'ultimas_citas' => $ultimasCitas->toArray(),
        ];
    }
}
