<?php

namespace App\Http\Controllers\Paquetes\HistoriaClinica\CU17_ConsultarMisPacientes;

use App\Paquetes\HistoriaClinica\CU17_ConsultarMisPacientes\ConsultarMisPacientesServicio;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Nucleo\Errores\RespuestaApi;

class ConsultarMisPacientesControlador extends Controller
{
    public function __construct(
        protected ConsultarMisPacientesServicio $servicio
    ) {}

    public function index(Request $request): JsonResponse
    {
        $usuario = $request->attributes->get('usuario_autenticado');
        $idMedico = $request->query('id_medico') ? (int)$request->query('id_medico') : null;

        if (strtolower($usuario?->rol ?? '') === 'medico') {
            $idMedico = $usuario->id_medico;
        }

        $pacientes = $this->servicio->consultar($idMedico, $request->query('termino'));
        return RespuestaApi::exito($pacientes);
    }
}
