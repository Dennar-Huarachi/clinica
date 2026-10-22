<?php

namespace App\Http\Controllers\Paquetes\CitasNotificaciones\CU15_ConsultarHistorialSeguimientoCitas;

use App\Paquetes\CitasNotificaciones\CU15_ConsultarHistorialSeguimientoCitas\HistorialSeguimientoCitasServicio;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Nucleo\Errores\RespuestaApi;

class HistorialSeguimientoCitasControlador extends Controller
{
    public function __construct(
        protected HistorialSeguimientoCitasServicio $servicio
    ) {}

    public function index(Request $request): JsonResponse
    {
        $usuario = $request->attributes->get('usuario_autenticado');
        $idPaciente = $request->query('id_paciente') ? (int)$request->query('id_paciente') : null;

        if (strtolower($usuario?->rol ?? '') === 'paciente') {
            $idPaciente = $usuario->id_paciente;
        }

        $historial = $this->servicio->consultarHistorial(
            $idPaciente,
            $request->query('codigo_cita')
        );

        return RespuestaApi::exito($historial);
    }
}
