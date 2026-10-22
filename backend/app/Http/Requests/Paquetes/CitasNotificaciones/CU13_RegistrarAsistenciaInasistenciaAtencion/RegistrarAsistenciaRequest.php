<?php

namespace App\Http\Requests\Paquetes\CitasNotificaciones\CU13_RegistrarAsistenciaInasistenciaAtencion;

use App\Nucleo\Validaciones\FormRequestPersonalizado;

class RegistrarAsistenciaRequest extends FormRequestPersonalizado
{
    public function rules(): array
    {
        return [
            'id_cita' => 'required|integer|exists:citas,id_cita',
            'estado_asistencia' => 'required|string|in:en_espera,inasistencia,confirmada',
            'observaciones' => 'nullable|string|max:255',
        ];
    }
}
