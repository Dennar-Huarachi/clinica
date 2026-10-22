<?php

namespace App\Http\Requests\Paquetes\PacientesPerfil\CU05_GestionarPacientes;

use App\Nucleo\Validaciones\FormRequestPersonalizado;

class GuardarPacienteRequest extends FormRequestPersonalizado
{
    public function rules(): array
    {
        $idPaciente = $this->route('id');
        $idPersona = null;

        if ($idPaciente) {
            $paciente = \Illuminate\Support\Facades\DB::table('pacientes')->where('id_paciente', $idPaciente)->first();
            $idPersona = $paciente?->id_persona;
        }

        return [
            'ci' => 'required|string|max:20|unique:personas,ci,' . ($idPersona ?? 'NULL') . ',id_persona',
            'nombres' => 'required|string|max:80',
            'apellidos' => 'required|string|max:80',
            'fecha_nacimiento' => 'nullable|date',
            'sexo' => 'nullable|string|in:M,F',
            'telefono' => 'nullable|string|max:20',
            'correo' => 'nullable|email|max:100',
            'direccion' => 'nullable|string|max:200',
            'grupo_sanguineo' => 'nullable|string|max:10',
            'estado' => 'nullable|string|in:activo,inactivo',
            'alergias' => 'nullable|string',
            'enfermedades_cronicas' => 'nullable|string',
            'medicamentos_actuales' => 'nullable|string',
            'antecedentes_familiares' => 'nullable|string',
            'observaciones' => 'nullable|string',
        ];
    }
}
