<?php

namespace App\Paquetes\HistoriaClinica\CU18_RegistrarAtencionClinica;

use Illuminate\Support\Facades\DB;
use App\Nucleo\Bitacora\ServicioBitacora;

class RegistrarAtencionClinicaServicio
{
    public function registrar(array $datos, ?int $idUsuarioOperador = null): int
    {
        return DB::transaction(function () use ($datos, $idUsuarioOperador) {
            $idCita = $datos['id_cita'];

            $cita = DB::table('citas')->where('id_cita', $idCita)->first();
            if (!$cita) {
                throw new \Exception('Cita no encontrada', 404);
            }

            // Verificar si ya tiene atención clínica registrada
            $atencionExistente = DB::table('atenciones_clinicas')->where('id_cita', $idCita)->first();
            if ($atencionExistente) {
                throw new \Exception('Esta cita ya cuenta con una atención médica registrada.', 400);
            }

            // 1. Insertar atención clínica
            $idAtencion = DB::table('atenciones_clinicas')->insertGetId([
                'id_cita' => $idCita,
                'id_paciente' => $cita->id_paciente,
                'id_medico' => $cita->id_medico,
                'motivo_atencion' => $datos['motivo_atencion'],
                'examen_fisico' => $datos['examen_fisico'] ?? null,
                'diagnostico' => $datos['diagnostico'],
                'tratamiento_indicaciones' => $datos['tratamiento_indicaciones'],
                'receta_medica' => $datos['receta_medica'] ?? null,
                'fecha_atencion' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ], 'id_atencion');

            // 2. Actualizar estado de la cita a 'atendida' (id=4)
            $estadoAtendida = DB::table('estados_cita')->where('codigo', 'atendida')->first();
            $idEstado = $estadoAtendida ? $estadoAtendida->id_estado_cita : 4;

            DB::table('citas')->where('id_cita', $idCita)->update([
                'id_estado_cita' => $idEstado,
                'updated_at' => now(),
            ]);

            ServicioBitacora::registrar(
                'CU18_RegistrarAtencionClinica',
                'REGISTRAR_ATENCION_CLINICA',
                'atenciones_clinicas',
                (string)$idAtencion,
                null,
                ['id_cita' => $idCita, 'id_paciente' => $cita->id_paciente],
                $idUsuarioOperador
            );

            return $idAtencion;
        });
    }
}
