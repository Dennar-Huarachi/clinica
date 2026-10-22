<?php

namespace App\Http\Controllers\Paquetes\CitasNotificaciones\CU13_RegistrarAsistenciaInasistenciaAtencion;

use App\Paquetes\CitasNotificaciones\CU13_RegistrarAsistenciaInasistenciaAtencion\RegistrarAsistenciaServicio;
use App\Http\Requests\Paquetes\CitasNotificaciones\CU13_RegistrarAsistenciaInasistenciaAtencion\RegistrarAsistenciaRequest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Nucleo\Errores\RespuestaApi;

class RegistrarAsistenciaControlador extends Controller
{
    public function __construct(
        protected RegistrarAsistenciaServicio $servicio
    ) {}

    public function registrar(RegistrarAsistenciaRequest $request): JsonResponse
    {
        try {
            $usuario = $request->attributes->get('usuario_autenticado');
            $this->servicio->registrar($request->validated(), $usuario?->id_usuario);
            return RespuestaApi::exito(null, 'Estado de asistencia registrado satisfactoriamente');
        } catch (\Exception $e) {
            return RespuestaApi::error('Error al registrar asistencia: ' . $e->getMessage(), 400);
        }
    }
}
