<?php

namespace App\Http\Controllers\Paquetes\Reportes\CU23_ExportarReportes;

use App\Paquetes\Reportes\CU23_ExportarReportes\ExportarReportesServicio;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Nucleo\Errores\RespuestaApi;

class ExportarReportesControlador extends Controller
{
    public function __construct(
        protected ExportarReportesServicio $servicio
    ) {}

    public function exportarCitas(Request $request): JsonResponse
    {
        $usuario = $request->attributes->get('usuario_autenticado');
        $resultado = $this->servicio->exportarCitasCSV(
            $request->query('fecha_inicio'),
            $request->query('fecha_fin'),
            $usuario?->id_usuario
        );

        return RespuestaApi::exito($resultado, 'Reporte exportado exitosamente');
    }
}
