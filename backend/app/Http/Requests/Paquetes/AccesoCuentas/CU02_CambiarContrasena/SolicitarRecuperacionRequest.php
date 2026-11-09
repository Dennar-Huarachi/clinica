<?php

// CU-02 Cambiar contraseña — Validaciones — Recuperación por correo. Cubre: RF01 · Reglas: RN12, RN21

namespace App\Http\Requests\Paquetes\AccesoCuentas\CU02_CambiarContrasena;

use App\Nucleo\Validaciones\FormRequestPersonalizado;

class SolicitarRecuperacionRequest extends FormRequestPersonalizado
{
    /**
     * Reglas de validación para solicitar el código de recuperación.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'identificador' => 'required|string|max:150',
        ];
    }

    /**
     * Mensajes descriptivos en español para errores de validación.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'identificador.required' => 'Debe ingresar su cédula de identidad o correo electrónico registrado.',
            'identificador.string' => 'El identificador debe ser una cadena de texto válida.',
            'identificador.max' => 'El identificador no puede superar los 150 caracteres.',
        ];
    }
}

