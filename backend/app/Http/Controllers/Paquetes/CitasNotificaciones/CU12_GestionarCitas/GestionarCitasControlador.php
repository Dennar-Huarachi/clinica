<?php

namespace App\Http\Controllers\Paquetes\CitasNotificaciones\CU12_GestionarCitas;

use App\Paquetes\CitasNotificaciones\CU12_GestionarCitas\GestionarCitasServicio;
use App\Http\Requests\Paquetes\CitasNotificaciones\CU12_GestionarCitas\CrearCitaRequest;
use App\Http\Requests\Paquetes\CitasNotificaciones\CU12_GestionarCitas\ReprogramarCitaRequest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Nucleo\Errores\RespuestaApi;

class GestionarCitasControlador extends Controller
{
    public function __construct(
        protected GestionarCitasServicio $servicio
    ) {}

    public function index(Request $request): JsonResponse
    {
        $usuario = $request->attributes->get('usuario_autenticado');
        $idPaciente = $request->query('id_paciente') ? (int)$request->query('id_paciente') : null;
        $idMedico = $request->query('id_medico') ? (int)$request->query('id_medico') : null;

        // Blindaje IDOR (RN19): Si es rol paciente, forzar exclusivamente su propio id_paciente
        if (strtolower($usuario?->rol ?? '') === 'paciente') {
            $idPaciente = (int)($usuario->id_paciente ?? 0);
            if (!$idPaciente) {
                $paciente = DB::table('pacientes')->where('id_usuario', $usuario->id_usuario)->first();
                $idPaciente = (int)($paciente?->id_paciente ?? 0);
            }
            if (!$idPaciente) {
                return RespuestaApi::error('Perfil de paciente no vinculado al usuario en sesión.', 403);
            }
        }

        // Si es rol médico, forzar su propio id_medico si no es administrador
        if (strtolower($usuario?->rol ?? '') === 'medico') {
            $idMedico = $usuario->id_medico;
        }

        $citas = $this->servicio->listar(
            $request->query('fecha'),
            $idMedico,
            $idPaciente,
            $request->query('estado')
        );

        return RespuestaApi::exito($citas);
    }

    public function store(CrearCitaRequest $request): JsonResponse
    {
        try {
            $usuario = $request->attributes->get('usuario_autenticado');
            $datos = $request->validated();

            // Blindaje IDOR (RN19): Forzar incondicionalmente el id_paciente autenticado
            if (strtolower($usuario?->rol ?? '') === 'paciente') {
                $idPaciente = (int)($usuario->id_paciente ?? 0);
                if (!$idPaciente) {
                    $paciente = DB::table('pacientes')->where('id_usuario', $usuario->id_usuario)->first();
                    $idPaciente = (int)($paciente?->id_paciente ?? 0);
                }
                if (!$idPaciente) {
                    return RespuestaApi::error('Perfil de paciente no vinculado al usuario en sesión.', 403);
                }
                $datos['id_paciente'] = $idPaciente;
            }

            $resultado = $this->servicio->crear($datos, $usuario?->id_usuario);
            return RespuestaApi::exito($resultado, 'Cita reservada satisfactoriamente', 201);
        } catch (\Exception $e) {
            $codigo = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400;
            return RespuestaApi::error($e->getMessage(), $codigo);
        }
    }

    public function reprogramar(ReprogramarCitaRequest $request, int $id): JsonResponse
    {
        try {
            $usuario = $request->attributes->get('usuario_autenticado');
            // Pasar objeto de usuario para validación estricta de propiedad de cita (RN19)
            $resultado = $this->servicio->reprogramar($id, $request->validated(), $usuario);
            return RespuestaApi::exito($resultado, 'Cita reprogramada exitosamente');
        } catch (\Exception $e) {
            $codigo = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400;
            return RespuestaApi::error($e->getMessage(), $codigo);
        }
    }

    public function cancelar(Request $request, int $id): JsonResponse
    {
        try {
            $usuario = $request->attributes->get('usuario_autenticado');
            $motivo = $request->input('motivo', 'Cancelado a solicitud');
            $this->servicio->cancelar($id, $motivo, $usuario);
            return RespuestaApi::exito(null, 'Cita cancelada correctamente');
        } catch (\Exception $e) {
            $codigo = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400;
            return RespuestaApi::error($e->getMessage(), $codigo);
        }
    }

    public function confirmar(Request $request, int $id): JsonResponse
    {
        try {
            $usuario = $request->attributes->get('usuario_autenticado');
            $resultado = $this->servicio->confirmarCita($id, $usuario);
            return RespuestaApi::exito($resultado, 'Cita confirmada correctamente');
        } catch (\Exception $e) {
            $codigo = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400;
            return RespuestaApi::error($e->getMessage(), $codigo);
        }
    }
}
