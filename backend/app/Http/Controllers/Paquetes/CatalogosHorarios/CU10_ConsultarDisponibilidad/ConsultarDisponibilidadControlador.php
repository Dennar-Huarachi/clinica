<?php

namespace App\Http\Controllers\Paquetes\CatalogosHorarios\CU10_ConsultarDisponibilidad;

use App\Paquetes\CatalogosHorarios\CU10_ConsultarDisponibilidad\ConsultarDisponibilidadServicio;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Nucleo\Errores\RespuestaApi;

class ConsultarDisponibilidadControlador extends Controller
{
    public function __construct(
        protected ConsultarDisponibilidadServicio $servicio
    ) {}

    public function consultar(Request $request): JsonResponse
    {
        $idMedico = (int)$request->query('id_medico');
        $idEspecialidad = (int)$request->query('id_especialidad');
        $fecha = (string)$request->query('fecha');

        if (!$idMedico || !$idEspecialidad || !$fecha) {
            return RespuestaApi::error('Debe especificar id_medico, id_especialidad y fecha válida', 422);
        }

        $resultado = $this->servicio->consultar($idMedico, $idEspecialidad, $fecha);
        return RespuestaApi::exito($resultado);
    }
}
