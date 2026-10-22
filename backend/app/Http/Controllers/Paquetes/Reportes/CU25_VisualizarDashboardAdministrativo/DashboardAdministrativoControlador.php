<?php

namespace App\Http\Controllers\Paquetes\Reportes\CU25_VisualizarDashboardAdministrativo;

use App\Paquetes\Reportes\CU25_VisualizarDashboardAdministrativo\DashboardAdministrativoServicio;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Nucleo\Errores\RespuestaApi;

class DashboardAdministrativoControlador extends Controller
{
    public function __construct(
        protected DashboardAdministrativoServicio $servicio
    ) {}

    public function index(): JsonResponse
    {
        return RespuestaApi::exito($this->servicio->obtenerMetricas());
    }
}
