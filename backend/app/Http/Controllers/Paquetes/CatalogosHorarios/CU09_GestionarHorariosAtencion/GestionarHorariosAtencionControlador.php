<?php

namespace App\Http\Controllers\Paquetes\CatalogosHorarios\CU09_GestionarHorariosAtencion;

use App\Paquetes\CatalogosHorarios\CU09_GestionarHorariosAtencion\GestionarHorariosAtencionServicio;
use App\Http\Requests\Paquetes\CatalogosHorarios\CU09_GestionarHorariosAtencion\GuardarHorarioRequest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Nucleo\Errores\RespuestaApi;

class GestionarHorariosAtencionControlador extends Controller
{
    public function __construct(
        protected GestionarHorariosAtencionServicio $servicio
    ) {}

    public function index(Request $request): JsonResponse
    {
        $idMedico = $request->query('id_medico') ? (int)$request->query('id_medico') : null;
        $idEspecialidad = $request->query('id_especialidad') ? (int)$request->query('id_especialidad') : null;

        return RespuestaApi::exito($this->servicio->listar($idMedico, $idEspecialidad));
    }

    public function store(GuardarHorarioRequest $request): JsonResponse
    {
        try {
            $id = $this->servicio->crear($request->validated());
            return RespuestaApi::exito(['id_horario' => $id], 'Horario de atención registrado con éxito', 201);
        } catch (\Exception $e) {
            return RespuestaApi::error('Error al registrar horario: ' . $e->getMessage(), 400);
        }
    }

    public function alternarEstado(int $id): JsonResponse
    {
        try {
            $nuevoEstado = $this->servicio->alternarEstado($id);
            return RespuestaApi::exito(['estado' => $nuevoEstado], "Estado del horario actualizado a {$nuevoEstado}");
        } catch (\Exception $e) {
            return RespuestaApi::error('Error al cambiar estado del horario: ' . $e->getMessage(), 400);
        }
    }
}
