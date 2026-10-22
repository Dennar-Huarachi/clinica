<?php

namespace App\Http\Requests\Paquetes\CatalogosHorarios\CU07_GestionarEspecialidades;

use App\Nucleo\Validaciones\FormRequestPersonalizado;

class GuardarEspecialidadRequest extends FormRequestPersonalizado
{
    public function rules(): array
    {
        $idEspecialidad = $this->route('id');

        return [
            'nombre' => 'required|string|max:80|unique:especialidades,nombre,' . ($idEspecialidad ?? 'NULL') . ',id_especialidad',
            'descripcion' => 'nullable|string|max:255',
            'duracion_turno_minutos' => 'required|integer|min:5|max:120',
            'estado' => 'nullable|string|in:activo,inactivo',
        ];
    }
}
