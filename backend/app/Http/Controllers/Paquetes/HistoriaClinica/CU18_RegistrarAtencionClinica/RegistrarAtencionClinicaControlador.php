<?php

namespace App\Http\Controllers\Paquetes\HistoriaClinica\CU18_RegistrarAtencionClinica;

use App\Paquetes\HistoriaClinica\CU18_RegistrarAtencionClinica\RegistrarAtencionClinicaServicio;
use App\Http\Requests\Paquetes\HistoriaClinica\CU18_RegistrarAtencionClinica\RegistrarAtencionRequest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Nucleo\Errores\RespuestaApi;

class RegistrarAtencionClinicaControlador extends Controller
{
    public function __construct(
        protected RegistrarAtencionClinicaServicio $servicio
    ) {}

    public function store(RegistrarAtencionRequest $request): JsonResponse
    {
        try {
            $usuario = $request->attributes->get('usuario_autenticado');
            $id = $this->servicio->registrar($request->validated(), $usuario?->id_usuario);
            return RespuestaApi::exito(['id_atencion' => $id], 'Atención clínica guardada satisfactoriamente', 201);
        } catch (\Exception $e) {
            return RespuestaApi::error('Error al registrar atención: ' . $e->getMessage(), 400);
        }
    }
}
