<?php

namespace App\Http\Controllers\Paquetes\HistoriaClinica\CU19_RegistrarResultadosLaboratorio;

use App\Paquetes\HistoriaClinica\CU19_RegistrarResultadosLaboratorio\ResultadosLaboratorioServicio;
use App\Http\Requests\Paquetes\HistoriaClinica\CU19_RegistrarResultadosLaboratorio\RegistrarLaboratorioRequest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Nucleo\Errores\RespuestaApi;

class ResultadosLaboratorioControlador extends Controller
{
    public function __construct(
        protected ResultadosLaboratorioServicio $servicio
    ) {}

    public function index(Request $request): JsonResponse
    {
        $idPaciente = (int)$request->query('id_paciente');
        if (!$idPaciente) {
            return RespuestaApi::error('Debe proporcionar el id_paciente', 422);
        }

        return RespuestaApi::exito($this->servicio->listarPorPaciente($idPaciente));
    }

    public function store(RegistrarLaboratorioRequest $request): JsonResponse
    {
        try {
            $usuario = $request->attributes->get('usuario_autenticado');
            $id = $this->servicio->registrar($request->validated(), $usuario?->id_usuario);
            return RespuestaApi::exito(['id_resultado' => $id], 'Resultado de laboratorio registrado exitosamente', 201);
        } catch (\Exception $e) {
            return RespuestaApi::error('Error al registrar resultado: ' . $e->getMessage(), 400);
        }
    }
}
