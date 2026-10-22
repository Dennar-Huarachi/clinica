<?php

namespace App\Paquetes\HistoriaClinica\CU17_ConsultarMisPacientes;

use Illuminate\Support\Facades\DB;

class ConsultarMisPacientesServicio
{
    public function consultar(?int $idMedico = null, ?string $termino = null): array
    {
        $query = DB::table('pacientes')
            ->join('personas', 'pacientes.id_persona', '=', 'personas.id_persona')
            ->join('citas', 'pacientes.id_paciente', '=', 'citas.id_paciente')
            ->leftJoin('informacion_medica_paciente', 'pacientes.id_paciente', '=', 'informacion_medica_paciente.id_paciente')
            ->select(
                'pacientes.id_paciente',
                'pacientes.codigo_historia',
                'pacientes.grupo_sanguineo',
                'personas.ci',
                'personas.nombres',
                'personas.apellidos',
                'personas.fecha_nacimiento',
                'personas.sexo',
                'personas.telefono',
                'personas.correo',
                'informacion_medica_paciente.alergias',
                'informacion_medica_paciente.enfermedades_cronicas',
                DB::raw('count(citas.id_cita) as total_citas'),
                DB::raw('max(citas.fecha_cita) as ultima_cita')
            )
            ->groupBy(
                'pacientes.id_paciente',
                'pacientes.codigo_historia',
                'pacientes.grupo_sanguineo',
                'personas.ci',
                'personas.nombres',
                'personas.apellidos',
                'personas.fecha_nacimiento',
                'personas.sexo',
                'personas.telefono',
                'personas.correo',
                'informacion_medica_paciente.alergias',
                'informacion_medica_paciente.enfermedades_cronicas'
            )
            ->orderBy('personas.apellidos');

        if ($idMedico) {
            $query->where('citas.id_medico', $idMedico);
        }

        if ($termino) {
            $query->where(function ($q) use ($termino) {
                $q->where('personas.nombres', 'ilike', "%{$termino}%")
                  ->orWhere('personas.apellidos', 'ilike', "%{$termino}%")
                  ->orWhere('personas.ci', 'ilike', "%{$termino}%")
                  ->orWhere('pacientes.codigo_historia', 'ilike', "%{$termino}%");
            });
        }

        return $query->get()->toArray();
    }
}
