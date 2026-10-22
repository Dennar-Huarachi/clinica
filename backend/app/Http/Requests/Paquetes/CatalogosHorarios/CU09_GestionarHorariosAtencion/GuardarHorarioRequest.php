<?php

namespace App\Http\Requests\Paquetes\CatalogosHorarios\CU09_GestionarHorariosAtencion;

use App\Nucleo\Validaciones\FormRequestPersonalizado;

class GuardarHorarioRequest extends FormRequestPersonalizado
{
    public function rules(): array
    {
        return [
            'id_medico' => 'required|integer|exists:medicos,id_medico',
            'id_especialidad' => 'required|integer|exists:especialidades,id_especialidad',
            'dia_semana' => 'required|integer|between:1,7', // 1=Lunes .. 7=Domingo
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
            'duracion_intervalo_minutos' => 'required|integer|min:5|max:120',
            'estado' => 'nullable|string|in:activo,inactivo',
        ];
    }
}
