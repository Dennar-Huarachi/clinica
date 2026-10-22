<?php

namespace App\Http\Controllers\Paquetes\CatalogosHorarios\CU08_GestionarMedicos;

use App\Paquetes\CatalogosHorarios\CU08_GestionarMedicos\GestionarMedicosServicio;
use App\Http\Requests\Paquetes\CatalogosHorarios\CU08_GestionarMedicos\GuardarMedicoRequest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Nucleo\Errores\RespuestaApi;

class GestionarMedicosControlador extends Controller
{
    public function __construct(
        protected GestionarMedicosServicio $servicio
    ) {}

    public function index(Request $request): JsonResponse
    {
        $idEspecialidad = $request->query('id_especialidad') ? (int)$request->query('id_especialidad') : null;

        $medicos = $this->servicio->listar(
            $request->query('termino'),
            $idEspecialidad,
            $request->query('estado')
        );

        return RespuestaApi::exito($medicos);
    }

    public function store(GuardarMedicoRequest $request): JsonResponse
    {
        try {
            $id = $this->servicio->crear($request->validated());
            return RespuestaApi::exito(['id_medico' => $id], 'Médico registrado exitosamente', 201);
        } catch (\Exception $e) {
            return RespuestaApi::error('Error al registrar médico: ' . $e->getMessage(), 400);
        }
    }

    public function update(GuardarMedicoRequest $request, int $id): JsonResponse
    {
        try {
            $this->servicio->actualizar($id, $request->validated());
            return RespuestaApi::exito(null, 'Médico actualizado exitosamente');
        } catch (\Exception $e) {
            return RespuestaApi::error('Error al actualizar médico: ' . $e->getMessage(), 400);
        }
    }

    public function alternarEstado(int $id): JsonResponse
    {
        try {
            $nuevoEstado = $this->servicio->alternarEstado($id);
            return RespuestaApi::exito(['estado' => $nuevoEstado], "Estado del médico actualizado a {$nuevoEstado}");
        } catch (\Exception $e) {
            return RespuestaApi::error('Error al cambiar estado lógico del médico: ' . $e->getMessage(), 400);
        }
    }
}
