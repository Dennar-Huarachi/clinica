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

    /**
     * Registra la atención clínica y marca atómicamente la cita como atendida.
     * RN19: Asegura que el médico solo registre atenciones para sus propias citas agendadas.
     */
    public function store(RegistrarAtencionRequest $request): JsonResponse
    {
        try {
            $usuario = $request->attributes->get('usuario_autenticado');
            $idMedico = strtolower($usuario?->rol ?? '') === 'medico' ? (int)$usuario->id_medico : null;

            $id = $this->servicio->registrar($request->validated(), $usuario?->id_usuario, $idMedico);

            return RespuestaApi::exito(
                ['id_atencion' => $id],
                'Atención médica registrada exitosamente y estado de cita actualizado a atendida.',
                201
            );
        } catch (\Exception $e) {
            $codigo = $e->getCode() >= 400 && $e->getCode() <= 500 ? $e->getCode() : 400;
            return RespuestaApi::error('Error al registrar atención médica: ' . $e->getMessage(), $codigo);
        }
    }

    /**
     * Consulta el detalle de la atención médica vinculada a una cita.
     */
    public function showPorCita(Request $request, int $idCita): JsonResponse
    {
        try {
            $atencion = $this->servicio->consultarPorCita($idCita);
            if (!$atencion) {
                return RespuestaApi::error('No se encontró atención médica registrada para esta cita.', 404);
            }
            return RespuestaApi::exito($atencion);
        } catch (\Exception $e) {
            return RespuestaApi::error('Error al consultar atención clínica: ' . $e->getMessage(), 500);
        }
    }
}
