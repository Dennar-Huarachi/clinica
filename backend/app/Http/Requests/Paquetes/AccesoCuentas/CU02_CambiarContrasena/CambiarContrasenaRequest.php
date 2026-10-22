<?php

namespace App\Http\Requests\Paquetes\AccesoCuentas\CU02_CambiarContrasena;

use App\Nucleo\Validaciones\FormRequestPersonalizado;

class CambiarContrasenaRequest extends FormRequestPersonalizado
{
    public function rules(): array
    {
        return [
            'contrasena_actual' => 'required|string',
            'contrasena_nueva' => 'required|string|min:6|different:contrasena_actual',
            'confirmacion_contrasena' => 'required|string|same:contrasena_nueva',
        ];
    }

    public function messages(): array
    {
        return [
            'contrasena_actual.required' => 'La contraseña actual es obligatoria.',
            'contrasena_nueva.required' => 'La nueva contraseña es obligatoria.',
            'contrasena_nueva.min' => 'La nueva contraseña debe tener al menos 6 caracteres.',
            'contrasena_nueva.different' => 'La nueva contraseña debe ser distinta a la contraseña actual.',
            'confirmacion_contrasena.same' => 'La confirmación no coincide con la nueva contraseña.',
        ];
    }
}
