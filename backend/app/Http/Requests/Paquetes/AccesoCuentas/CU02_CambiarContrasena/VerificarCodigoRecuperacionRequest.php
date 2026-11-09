<?php

// CU-02 Cambiar contraseña — Validaciones — Recuperación por correo. Cubre: RF01 · Reglas: RN12, RN21

namespace App\Http\Requests\Paquetes\AccesoCuentas\CU02_CambiarContrasena;

use App\Nucleo\Validaciones\FormRequestPersonalizado;

class VerificarCodigoRecuperacionRequest extends FormRequestPersonalizado
{
    /**
     * Reglas de validación para verificar el código de recuperación.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'identificador' => 'required|string|max:150',
            'codigo' => 'required|string|size:6|regex:/^[0-9]{6}$/',
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
            'identificador.required' => 'El identificador de usuario es obligatorio.',
            'identificador.string' => 'El identificador debe ser una cadena de texto válida.',
            'identificador.max' => 'El identificador no puede superar los 150 caracteres.',
            'codigo.required' => 'El código de verificación es obligatorio.',
            'codigo.string' => 'El código de verificación debe ser una cadena de texto.',
            'codigo.size' => 'El código de verificación debe tener exactamente 6 dígitos.',
            'codigo.regex' => 'El código de verificación debe estar compuesto únicamente por 6 números.',
        ];
    }
}

