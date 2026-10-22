<?php

namespace App\Paquetes\CatalogosHorarios\CU09_GestionarHorariosAtencion;

use Illuminate\Support\Facades\DB;
use App\Nucleo\Bitacora\ServicioBitacora;

class GestionarHorariosAtencionServicio
{
    public function listar(?int $idMedico = null, ?int $idEspecialidad = null): array
    {
        $query = DB::table('horarios_atencion')
            ->join('medicos', 'horarios_atencion.id_medico', '=', 'medicos.id_medico')
            ->join('personas', 'medicos.id_persona', '=', 'personas.id_persona')
            ->join('especialidades', 'horarios_atencion.id_especialidad', '=', 'especialidades.id_especialidad')
            ->select(
                'horarios_atencion.*',
                'personas.nombres as medico_nombres',
                'personas.apellidos as medico_apellidos',
                'especialidades.nombre as especialidad_nombre'
            )
            ->orderBy('horarios_atencion.dia_semana')
            ->orderBy('horarios_atencion.hora_inicio');

        if ($idMedico) {
            $query->where('horarios_atencion.id_medico', $idMedico);
        }

        if ($idEspecialidad) {
            $query->where('horarios_atencion.id_especialidad', $idEspecialidad);
        }

        return $query->get()->toArray();
    }

    public function crear(array $datos): int
    {
        $id = DB::table('horarios_atencion')->insertGetId([
            'id_medico' => $datos['id_medico'],
            'id_especialidad' => $datos['id_especialidad'],
            'dia_semana' => $datos['dia_semana'],
            'hora_inicio' => $datos['hora_inicio'],
            'hora_fin' => $datos['hora_fin'],
            'duracion_intervalo_minutos' => $datos['duracion_intervalo_minutos'] ?? 15,
            'estado' => $datos['estado'] ?? 'activo',
            'created_at' => now(),
            'updated_at' => now(),
        ], 'id_horario');

        ServicioBitacora::registrar(
            'CU09_GestionarHorariosAtencion',
            'CREAR_HORARIO_ATENCION',
            'horarios_atencion',
            (string)$id,
            null,
            $datos
        );

        return $id;
    }

    public function alternarEstado(int $id): string
    {
        $horario = DB::table('horarios_atencion')->where('id_horario', $id)->first();
        if (!$horario) {
            throw new \Exception('Horario no encontrado', 404);
        }

        $nuevoEstado = $horario->estado === 'activo' ? 'inactivo' : 'activo';

        DB::table('horarios_atencion')->where('id_horario', $id)->update([
            'estado' => $nuevoEstado,
            'updated_at' => now(),
        ]);

        return $nuevoEstado;
    }
}
