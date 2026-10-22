<?php

namespace App\Http\Requests\Paquetes\PacientesPerfil\CU06_GestionarMiPerfil;

use App\Nucleo\Validaciones\FormRequestPersonalizado;

class ActualizarPerfilRequest extends FormRequestPersonalizado
{
    public function rules(): array
    {
        return [
            'telefono' => 'nullable|string|max:20',
            'correo' => 'required|email|max:100',
            'direccion' => 'nullable|string|max:200',
            'contacto_nombre' => 'nullable|string|max:120',
            'contacto_relacion' => 'nullable|string|max:50',
            'contacto_telefono' => 'nullable|string|max:20',
        ];
    }
}
