<?php

namespace App\Http\Requests\Paquetes\CitasNotificaciones\CU12_GestionarCitas;

use App\Nucleo\Validaciones\FormRequestPersonalizado;

class CrearCitaRequest extends FormRequestPersonalizado
{
    public function rules(): array
    {
        return [
            'id_paciente' => 'required|integer|exists:pacientes,id_paciente',
            'id_medico' => 'required|integer|exists:medicos,id_medico',
            'id_especialidad' => 'required|integer|exists:especialidades,id_especialidad',
            'fecha_cita' => 'required|date|after_or_equal:today',
            'hora_inicio' => 'required|date_format:H:i',
            'motivo_consulta' => 'nullable|string|max:255',
            'observaciones' => 'nullable|string',
        ];
    }
}
