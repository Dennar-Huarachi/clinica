<?php

// CU-02 Cambiar contraseña — Controlador — Recuperación por correo. Cubre: RF01 · Reglas: RN12, RN21

namespace App\Http\Controllers\Paquetes\AccesoCuentas\CU02_CambiarContrasena;

use App\Http\Controllers\Controller;
use App\Http\Requests\Paquetes\AccesoCuentas\CU02_CambiarContrasena\RestablecerContrasenaRequest;
use App\Http\Requests\Paquetes\AccesoCuentas\CU02_CambiarContrasena\SolicitarRecuperacionRequest;
use App\Http\Requests\Paquetes\AccesoCuentas\CU02_CambiarContrasena\VerificarCodigoRecuperacionRequest;
use App\Nucleo\Errores\RespuestaApi;
use App\Paquetes\AccesoCuentas\CU02_CambiarContrasena\RecuperarContrasenaServicio;
use Illuminate\Http\JsonResponse;

class RecuperarContrasenaControlador extends Controller
{
    public function __construct(
        protected RecuperarContrasenaServicio $servicio
    ) {}

    /**
     * Paso 1: Solicitar código de recuperación de contraseña.
     */
    public function solicitar(SolicitarRecuperacionRequest $request): JsonResponse
    {
        try {
            $resultado = $this->servicio->solicitar(
                $request->input('identificador'),
                $request->ip()
            );

            return response()->json([
                'exito' => true,
                'mensaje' => $resultado['mensaje'],
                'segundosEspera' => $resultado['segundosEspera'],
                'correoEnmascarado' => $resultado['correoEnmascarado'],
                'datos' => [
                    'segundosEspera' => $resultado['segundosEspera'],
                    'correoEnmascarado' => $resultado['correoEnmascarado'],
                ],
            ], 200);
        } catch (\Exception $e) {
            $codigo = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400;
            return response()->json([
                'exito' => false,
                'mensaje' => $e->getMessage(),
            ], $codigo);
        }
    }

    /**
     * Paso 2: Verificar el código de 6 dígitos ingresado por la persona.
     */
    public function verificar(VerificarCodigoRecuperacionRequest $request): JsonResponse
    {
        try {
            $resultado = $this->servicio->verificar(
                $request->input('identificador'),
                $request->input('codigo')
            );

            return response()->json([
                'exito' => true,
                'mensaje' => $resultado['mensaje'],
                'comprobante' => $resultado['comprobante'],
                'datos' => [
                    'comprobante' => $resultado['comprobante'],
                ],
            ], 200);
        } catch (\Exception $e) {
            $codigo = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 422;
            return response()->json([
                'exito' => false,
                'mensaje' => $e->getMessage(),
            ], $codigo);
        }
    }

    /**
     * Paso 3: Restablecer la contraseña con el comprobante confirmado.
     */
    public function restablecer(RestablecerContrasenaRequest $request): JsonResponse
    {
        try {
            $this->servicio->restablecer(
                $request->input('identificador'),
                $request->input('comprobante'),
                $request->input('contrasena')
            );

            return RespuestaApi::exito(
                null,
                'Contraseña restablecida exitosamente. Ya puede iniciar sesión con sus nuevas credenciales.'
            );
        } catch (\Exception $e) {
            $codigo = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 422;
            return response()->json([
                'exito' => false,
                'mensaje' => $e->getMessage(),
            ], $codigo);
        }
    }
}

