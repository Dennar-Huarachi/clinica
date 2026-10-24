<?php

namespace App\Http\Controllers\Paquetes\HistoriaClinica\CU20_ConsultarHistorialClinico;

use App\Paquetes\HistoriaClinica\CU20_ConsultarHistorialClinico\ConsultarHistorialClinicoServicio;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Nucleo\Errores\RespuestaApi;

class ConsultarHistorialClinicoControlador extends Controller
{
    public function __construct(
        protected ConsultarHistorialClinicoServicio $servicio
    ) {}

    public function show(Request $request, int $idPaciente): JsonResponse
    {
        $usuario = $request->attributes->get('usuario_autenticado');

        // Blindaje IDOR (RN19): Si es rol paciente, forzar incondicionalmente su propio id_paciente
        if (strtolower($usuario?->rol ?? '') === 'paciente') {
            $idPacienteAutenticado = (int)($usuario->id_paciente ?? 0);
            if (!$idPacienteAutenticado) {
                $paciente = DB::table('pacientes')->where('id_usuario', $usuario->id_usuario)->first();
                $idPacienteAutenticado = (int)($paciente?->id_paciente ?? 0);
            }
            if (!$idPacienteAutenticado) {
                return RespuestaApi::error('Perfil de paciente no vinculado al usuario en sesión.', 403);
            }
            // Ignorar el parámetro de URL y asignar el ID del paciente autenticado
            $idPaciente = $idPacienteAutenticado;
        }

        $historial = $this->servicio->obtenerHistorialCompleto($idPaciente);
        if (!$historial) {
            return RespuestaApi::error('Historial clínico del paciente no encontrado.', 404);
        }

        return RespuestaApi::exito($historial);
    }
}
