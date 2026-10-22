<?php

namespace App\Http\Controllers\Paquetes\HistoriaClinica\CU20_ConsultarHistorialClinico;

use App\Paquetes\HistoriaClinica\CU20_ConsultarHistorialClinico\ConsultarHistorialClinicoServicio;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Nucleo\Errores\RespuestaApi;

class ConsultarHistorialClinicoControlador extends Controller
{
    public function __construct(
        protected ConsultarHistorialClinicoServicio $servicio
    ) {}

    public function show(Request $request, int $idPaciente): JsonResponse
    {
        $usuario = $request->attributes->get('usuario_autenticado');

        // Si es rol paciente, solo puede ver su propio historial
        if (strtolower($usuario?->rol ?? '') === 'paciente' && (int)$usuario->id_paciente !== $idPaciente) {
            return RespuestaApi::error('Acceso denegado: solo puede consultar su propio historial clínico.', 403);
        }

        $historial = $this->servicio->obtenerHistorialCompleto($idPaciente);
        if (!$historial) {
            return RespuestaApi::error('Historial clínico del paciente no encontrado.', 404);
        }

        return RespuestaApi::exito($historial);
    }
}
