<?php

namespace App\Http\Controllers\Paquetes\CatalogosHorarios\CU11_SuspenderHorarioGestionarCitasAfectadas;

use App\Paquetes\CatalogosHorarios\CU11_SuspenderHorarioGestionarCitasAfectadas\SuspenderHorarioServicio;
use App\Http\Requests\Paquetes\CatalogosHorarios\CU11_SuspenderHorarioGestionarCitasAfectadas\SuspenderHorarioRequest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Nucleo\Errores\RespuestaApi;

class SuspenderHorarioControlador extends Controller
{
    public function __construct(
        protected SuspenderHorarioServicio $servicio
    ) {}

    public function index(Request $request): JsonResponse
    {
        $idMedico = $request->query('id_medico') ? (int)$request->query('id_medico') : null;
        return RespuestaApi::exito($this->servicio->listarSuspensiones($idMedico));
    }

    public function store(SuspenderHorarioRequest $request): JsonResponse
    {
        try {
            $usuario = $request->attributes->get('usuario_autenticado');
            $resultado = $this->servicio->suspender($request->validated(), $usuario?->id_usuario);
            return RespuestaApi::exito($resultado, $resultado['mensaje'], 201);
        } catch (\Exception $e) {
            return RespuestaApi::error('Error al suspender horario médico: ' . $e->getMessage(), 400);
        }
    }
}
