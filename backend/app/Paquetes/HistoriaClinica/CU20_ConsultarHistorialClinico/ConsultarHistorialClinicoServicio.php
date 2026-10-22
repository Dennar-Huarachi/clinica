<?php

namespace App\Paquetes\HistoriaClinica\CU20_ConsultarHistorialClinico;

use Illuminate\Support\Facades\DB;

class ConsultarHistorialClinicoServicio
{
    public function obtenerHistorialCompleto(int $idPaciente): ?array
    {
        // 1. Datos del paciente y persona
        $paciente = DB::table('pacientes')
            ->join('personas', 'pacientes.id_persona', '=', 'personas.id_persona')
            ->where('pacientes.id_paciente', $idPaciente)
            ->select('pacientes.*', 'personas.*')
            ->first();

        if (!$paciente) {
            return null;
        }

        // 2. Información médica base
        $infoMedica = DB::table('informacion_medica_paciente')
            ->where('id_paciente', $idPaciente)
            ->first();

        // 3. Contactos de emergencia
        $contactos = DB::table('contactos_emergencia')
            ->where('id_paciente', $idPaciente)
            ->get()
            ->toArray();

        // 4. Atenciones clínicas históricas
        $atenciones = DB::table('atenciones_clinicas')
            ->join('citas', 'atenciones_clinicas.id_cita', '=', 'citas.id_cita')
            ->join('medicos', 'atenciones_clinicas.id_medico', '=', 'medicos.id_medico')
            ->join('personas as per_medico', 'medicos.id_persona', '=', 'per_medico.id_persona')
            ->join('especialidades', 'citas.id_especialidad', '=', 'especialidades.id_especialidad')
            ->where('atenciones_clinicas.id_paciente', $idPaciente)
            ->select(
                'atenciones_clinicas.*',
                'citas.codigo_cita',
                'citas.fecha_cita',
                'per_medico.nombres as medico_nombres',
                'per_medico.apellidos as medico_apellidos',
                'especialidades.nombre as especialidad_nombre'
            )
            ->orderBy('atenciones_clinicas.fecha_atencion', 'desc')
            ->get()
            ->toArray();

        // 5. Resultados de laboratorio
        $laboratorios = DB::table('resultados_laboratorio')
            ->where('id_paciente', $idPaciente)
            ->orderBy('fecha_estudio', 'desc')
            ->get()
            ->toArray();

        return [
            'paciente' => $paciente,
            'informacion_medica' => $infoMedica,
            'contactos_emergencia' => $contactos,
            'atenciones' => $atenciones,
            'resultados_laboratorio' => $laboratorios,
        ];
    }
}
