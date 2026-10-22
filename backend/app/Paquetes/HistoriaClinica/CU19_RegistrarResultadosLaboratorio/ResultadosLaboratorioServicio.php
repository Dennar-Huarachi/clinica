<?php

namespace App\Paquetes\HistoriaClinica\CU19_RegistrarResultadosLaboratorio;

use Illuminate\Support\Facades\DB;
use App\Nucleo\Bitacora\ServicioBitacora;

class ResultadosLaboratorioServicio
{
    public function registrar(array $datos, ?int $idUsuarioOperador = null): int
    {
        $id = DB::table('resultados_laboratorio')->insertGetId([
            'id_paciente' => $datos['id_paciente'],
            'id_atencion' => $datos['id_atencion'] ?? null,
            'tipo_estudio' => $datos['tipo_estudio'],
            'descripcion' => $datos['descripcion'],
            'archivo_adjunto' => $datos['archivo_adjunto'] ?? null,
            'fecha_estudio' => $datos['fecha_estudio'],
            'created_at' => now(),
            'updated_at' => now(),
        ], 'id_resultado');

        ServicioBitacora::registrar(
            'CU19_RegistrarResultadosLaboratorio',
            'REGISTRAR_LABORATORIO',
            'resultados_laboratorio',
            (string)$id,
            null,
            ['id_paciente' => $datos['id_paciente'], 'tipo_estudio' => $datos['tipo_estudio']],
            $idUsuarioOperador
        );

        return $id;
    }

    public function listarPorPaciente(int $idPaciente): array
    {
        return DB::table('resultados_laboratorio')
            ->where('id_paciente', $idPaciente)
            ->orderBy('fecha_estudio', 'desc')
            ->get()
            ->toArray();
    }
}
