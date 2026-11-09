<?php

// CU-02 Cambiar contraseña — Validaciones — Recuperación por correo. Cubre: RF01 · Reglas: RN12, RN21

namespace App\Http\Requests\Paquetes\AccesoCuentas\CU02_CambiarContrasena;

use App\Nucleo\Validaciones\FormRequestPersonalizado;

class RestablecerContrasenaRequest extends FormRequestPersonalizado
{
    /**
     * Normaliza los campos de entrada antes de validar.
     */
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        // Soporte de compatibilidad para snake_case
        if (!$this->has('contrasenaConfirmacion') && $this->has('contrasena_confirmacion')) {
            $this->merge([
                'contrasenaConfirmacion' => $this->input('contrasena_confirmacion'),
            ]);
        }
    }

    /**
     * Reglas de validación para el restablecimiento definitivo de contraseña.
     * Reutiliza exactamente la misma política de robustez de contraseña de CU-02.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'identificador' => 'required|string|max:150',
            'comprobante' => 'required|string|min:32|max:128',
            'contrasena' => [
                'required',
                'string',
                'min:8',
                'regex:/[A-Z]/',
                'regex:/[a-z]/',
                'regex:/[0-9]/',
                'regex:/[!@#$%^&*(),.?":{}|<>]/',
            ],
            'contrasenaConfirmacion' => 'required|string|same:contrasena',
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
            'comprobante.required' => 'El comprobante de verificación es obligatorio.',
            'comprobante.string' => 'El comprobante debe ser una cadena de texto válida.',
            'comprobante.min' => 'El comprobante no tiene una longitud válida.',
            'contrasena.required' => 'La nueva contraseña es obligatoria.',
            'contrasena.string' => 'La nueva contraseña debe ser una cadena de texto.',
            'contrasena.min' => 'La nueva contraseña debe tener al menos 8 caracteres.',
            'contrasena.regex' => 'La nueva contraseña debe contener al menos una mayúscula, una minúscula, un número y un símbolo especial (!@#$%^&*(),.?":{}|<>).',
            'contrasenaConfirmacion.required' => 'Debe confirmar la nueva contraseña.',
            'contrasenaConfirmacion.same' => 'La confirmación no coincide con la nueva contraseña.',
        ];
    }
}

