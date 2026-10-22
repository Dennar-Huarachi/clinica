<?php

namespace App\Http\Controllers\Paquetes\Reportes\CU24_ConsultarBitacoraAuditoria;

use App\Paquetes\Reportes\CU24_ConsultarBitacoraAuditoria\ConsultarBitacoraServicio;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Nucleo\Errores\RespuestaApi;

class ConsultarBitacoraControlador extends Controller
{
    public function __construct(
        protected ConsultarBitacoraServicio $servicio
    ) {}

    public function index(Request $request): JsonResponse
    {
        $bitacora = $this->servicio->consultar(
            $request->query('caso_uso'),
            $request->query('accion'),
            $request->query('fecha'),
            (int)($request->query('limite', 100))
        );

        return RespuestaApi::exito($bitacora);
    }
}
