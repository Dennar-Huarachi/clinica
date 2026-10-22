<?php

namespace App\Nucleo\Validaciones;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Nucleo\Errores\RespuestaApi;

abstract class FormRequestPersonalizado extends FormRequest
{
    /**
     * Determina si el usuario está autorizado a realizar esta solicitud.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Manejo unificado de errores de validación devolviendo JSON amigable para el frontend.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            RespuestaApi::validacion($validator->errors()->toArray())
        );
    }
}
