<?php

namespace App\Http\Controllers\Paquetes\CitasNotificaciones\CU16_EnviarNotificacionesRecordatorios;

use App\Paquetes\CitasNotificaciones\CU16_EnviarNotificacionesRecordatorios\EnviarNotificacionesServicio;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Nucleo\Errores\RespuestaApi;

class EnviarNotificacionesControlador extends Controller
{
    public function __construct(
        protected EnviarNotificacionesServicio $servicio
    ) {}

    public function index(Request $request): JsonResponse
    {
        $usuario = $request->attributes->get('usuario_autenticado');
        $soloNoLeidas = $request->query('no_leidas') === 'true';

        $notificaciones = $this->servicio->listarPorUsuario($usuario->id_usuario, $soloNoLeidas);
        return RespuestaApi::exito($notificaciones);
    }

    public function marcarLeida(Request $request, int $id): JsonResponse
    {
        $usuario = $request->attributes->get('usuario_autenticado');
        $this->servicio->marcarLeida($id, $usuario->id_usuario);
        return RespuestaApi::exito(null, 'Notificación marcada como leída');
    }

    public function dispararRecordatorios(): JsonResponse
    {
        $cantidad = $this->servicio->enviarRecordatoriosProximos();
        return RespuestaApi::exito(['recordatorios_enviados' => $cantidad], "Se enviaron {$cantidad} recordatorios de citas.");
    }
}
