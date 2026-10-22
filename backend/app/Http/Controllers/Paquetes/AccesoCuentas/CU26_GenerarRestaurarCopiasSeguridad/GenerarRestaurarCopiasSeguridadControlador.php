<?php

namespace App\Http\Controllers\Paquetes\AccesoCuentas\CU26_GenerarRestaurarCopiasSeguridad;

use App\Paquetes\AccesoCuentas\CU26_GenerarRestaurarCopiasSeguridad\GenerarRestaurarCopiasSeguridadServicio;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Nucleo\Errores\RespuestaApi;

class GenerarRestaurarCopiasSeguridadControlador extends Controller
{
    public function __construct(
        protected GenerarRestaurarCopiasSeguridadServicio $servicio
    ) {}

    public function index(): JsonResponse
    {
        return RespuestaApi::exito($this->servicio->listar());
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $usuario = $request->attributes->get('usuario_autenticado');
            $resultado = $this->servicio->generar($usuario?->id_usuario);
            return RespuestaApi::exito($resultado, 'Copia de seguridad generada satisfactoriamente', 201);
        } catch (\Exception $e) {
            return RespuestaApi::error('Error al generar copia de seguridad: ' . $e->getMessage(), 500);
        }
    }
}
