<?php

namespace App\Http\Controllers\Paquetes\Reportes\CU22_ConsultarReporteAsistenciaPacientes;

use App\Paquetes\Reportes\CU22_ConsultarReporteAsistenciaPacientes\ReporteAsistenciaServicio;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Nucleo\Errores\RespuestaApi;

class ReporteAsistenciaControlador extends Controller
{
    public function __construct(
        protected ReporteAsistenciaServicio $servicio
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
