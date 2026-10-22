<?php

namespace App\Http\Controllers\Paquetes\PacientesPerfil\CU06_GestionarMiPerfil;

use App\Paquetes\PacientesPerfil\CU06_GestionarMiPerfil\GestionarMiPerfilServicio;
use App\Http\Requests\Paquetes\PacientesPerfil\CU06_GestionarMiPerfil\ActualizarPerfilRequest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Nucleo\Errores\RespuestaApi;

class GestionarMiPerfilControlador extends Controller
{
    public function __construct(
        protected GestionarMiPerfilServicio $servicio
    ) {}

    public function show(Request $request): JsonResponse
    {
        $usuario = $request->attributes->get('usuario_autenticado');
        return RespuestaApi::exito($this->servicio->obtenerPerfil($usuario));
    }

    public function update(ActualizarPerfilRequest $request): JsonResponse
    {
        try {
            $usuario = $request->attributes->get('usuario_autenticado');
            $this->servicio->actualizar($usuario, $request->validated());
            return RespuestaApi::exito(null, 'Perfil actualizado correctamente');
        } catch (\Exception $e) {
            return RespuestaApi::error('Error al actualizar perfil: ' . $e->getMessage(), 400);
        }
    }
}
