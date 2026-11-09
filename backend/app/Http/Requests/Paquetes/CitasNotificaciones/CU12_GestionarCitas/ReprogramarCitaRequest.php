<?php

namespace App\Http\Requests\Paquetes\CitasNotificaciones\CU12_GestionarCitas;

use App\Nucleo\Validaciones\FormRequestPersonalizado;

class ReprogramarCitaRequest extends FormRequestPersonalizado
{
    public function rules(): array
    {
        return [
            'id_cita' => 'nullable|integer',
            'id' => 'nullable|integer',
            'fecha_cita' => 'required|date|after_or_equal:today',
            'hora_inicio' => ['required', 'regex:/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/'],
            'motivo_reprogramacion' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'fecha_cita.required' => 'La fecha de la cita es obligatoria.',
            'fecha_cita.date' => 'La fecha de la cita no tiene un formato válido.',
            'fecha_cita.after_or_equal' => 'No se puede reprogramar una cita a una fecha pasada.',
            'hora_inicio.required' => 'La hora de inicio es obligatoria.',
            'hora_inicio.regex' => 'El formato de hora debe ser HH:mm.',
            'motivo_reprogramacion.max' => 'El motivo u observación no debe exceder los 255 caracteres.',
        ];
    }
}
