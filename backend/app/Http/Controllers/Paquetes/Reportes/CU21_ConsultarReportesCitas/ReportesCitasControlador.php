<?php

namespace App\Http\Controllers\Paquetes\Reportes\CU21_ConsultarReportesCitas;

use App\Paquetes\Reportes\CU21_ConsultarReportesCitas\ReportesCitasServicio;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Nucleo\Errores\RespuestaApi;

class ReportesCitasControlador extends Controller
{
    public function __construct(
        protected ReportesCitasServicio $servicio
    ) {}

    public function index(Request $request): JsonResponse
    {
        $reporte = $this->servicio->generarReporte(
            $request->query('fecha_inicio'),
            $request->query('fecha_fin')
        );

        return RespuestaApi::exito($reporte);
    }
}
