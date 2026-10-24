<?php

namespace App\Http\Controllers\Paquetes\CitasNotificaciones\CU14_ConsultarAgendaCitas;

use App\Paquetes\CitasNotificaciones\CU14_ConsultarAgendaCitas\ConsultarAgendaCitasServicio;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Nucleo\Errores\RespuestaApi;

class ConsultarAgendaCitasControlador extends Controller
{
    public function __construct(
        protected ConsultarAgendaCitasServicio $servicio
    ) {}

    public function index(Request $request): JsonResponse
    {
        $usuario = $request->attributes->get('usuario_autenticado');
        $idMedico = $request->query('id_medico') ? (int)$request->query('id_medico') : null;

        // Si es médico, fijar su propio id
        if (strtolower($usuario?->rol ?? '') === 'medico') {
            $idMedico = $usuario->id_medico;
        }

        $idEspecialidad = $request->query('id_especialidad') ? (int)$request->query('id_especialidad') : null;
        $estado = $request->query('estado') ? trim($request->query('estado')) : null;

        $agenda = $this->servicio->obtenerAgenda($idMedico, $request->query('fecha'), $idEspecialidad, $estado);
        return RespuestaApi::exito($agenda);
    }
}
