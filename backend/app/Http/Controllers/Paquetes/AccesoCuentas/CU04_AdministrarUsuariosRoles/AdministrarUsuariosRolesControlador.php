<?php

namespace App\Http\Controllers\Paquetes\AccesoCuentas\CU04_AdministrarUsuariosRoles;

use App\Paquetes\AccesoCuentas\CU04_AdministrarUsuariosRoles\AdministrarUsuariosRolesServicio;
use App\Http\Requests\Paquetes\AccesoCuentas\CU04_AdministrarUsuariosRoles\GuardarUsuarioRequest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Nucleo\Errores\RespuestaApi;

class AdministrarUsuariosRolesControlador extends Controller
{
    public function __construct(
        protected AdministrarUsuariosRolesServicio $servicio
    ) {}

    public function index(Request $request): JsonResponse
    {
        $usuarios = $this->servicio->listar(
            $request->query('termino'),
            $request->query('rol')
        );

        return RespuestaApi::exito($usuarios);
    }

    public function roles(): JsonResponse
    {
        return RespuestaApi::exito($this->servicio->obtenerRoles());
    }

    public function store(GuardarUsuarioRequest $request): JsonResponse
    {
        try {
            $id = $this->servicio->crear($request->validated());
            return RespuestaApi::exito(['id_usuario' => $id], 'Usuario creado satisfactoriamente', 201);
        } catch (\Exception $e) {
            return RespuestaApi::error('Error al crear usuario: ' . $e->getMessage(), 400);
        }
    }

    public function update(GuardarUsuarioRequest $request, int $id): JsonResponse
    {
        try {
            $this->servicio->actualizar($id, $request->validated());
            return RespuestaApi::exito(null, 'Usuario actualizado satisfactoriamente');
        } catch (\Exception $e) {
            return RespuestaApi::error('Error al actualizar usuario: ' . $e->getMessage(), 400);
        }
    }

    public function alternarEstado(int $id): JsonResponse
    {
        try {
            $nuevoEstado = $this->servicio->alternarEstado($id);
            return RespuestaApi::exito(['estado' => $nuevoEstado], "Estado cambiado a {$nuevoEstado}");
        } catch (\Exception $e) {
            return RespuestaApi::error('Error al cambiar estado: ' . $e->getMessage(), 400);
        }
    }
}
