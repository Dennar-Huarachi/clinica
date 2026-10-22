<?php

namespace App\Paquetes\CatalogosHorarios\CU07_GestionarEspecialidades;

use Illuminate\Support\Facades\DB;
use App\Nucleo\Bitacora\ServicioBitacora;

class GestionarEspecialidadesServicio
{
    public function listar(?string $termino = null, ?string $estado = null): array
    {
        $query = DB::table('especialidades')->orderBy('nombre');

        if ($termino) {
            $query->where('nombre', 'ilike', "%{$termino}%");
        }

        if ($estado) {
            $query->where('estado', $estado);
        }

        return $query->get()->toArray();
    }

    public function crear(array $datos): int
    {
        $id = DB::table('especialidades')->insertGetId([
            'nombre' => $datos['nombre'],
            'descripcion' => $datos['descripcion'] ?? null,
            'duracion_turno_minutos' => $datos['duracion_turno_minutos'] ?? 15,
            'estado' => $datos['estado'] ?? 'activo',
            'created_at' => now(),
            'updated_at' => now(),
        ], 'id_especialidad');

        ServicioBitacora::registrar(
            'CU07_GestionarEspecialidades',
            'CREAR_ESPECIALIDAD',
            'especialidades',
            (string)$id,
            null,
            ['nombre' => $datos['nombre']]
        );

        return $id;
    }

    public function actualizar(int $id, array $datos): void
    {
        $especialidad = DB::table('especialidades')->where('id_especialidad', $id)->first();
        if (!$especialidad) {
            throw new \Exception('Especialidad no encontrada', 404);
        }

        DB::table('especialidades')->where('id_especialidad', $id)->update([
            'nombre' => $datos['nombre'],
            'descripcion' => $datos['descripcion'] ?? null,
            'duracion_turno_minutos' => $datos['duracion_turno_minutos'] ?? $especialidad->duracion_turno_minutos,
            'estado' => $datos['estado'] ?? $especialidad->estado,
            'updated_at' => now(),
        ]);

        ServicioBitacora::registrar(
            'CU07_GestionarEspecialidades',
            'ACTUALIZAR_ESPECIALIDAD',
            'especialidades',
            (string)$id,
            (array)$especialidad,
            $datos
        );
    }

    public function alternarEstado(int $id): string
    {
        $especialidad = DB::table('especialidades')->where('id_especialidad', $id)->first();
        if (!$especialidad) {
            throw new \Exception('Especialidad no encontrada', 404);
        }

        $nuevoEstado = $especialidad->estado === 'activo' ? 'inactivo' : 'activo';

        DB::table('especialidades')->where('id_especialidad', $id)->update([
            'estado' => $nuevoEstado,
            'updated_at' => now(),
        ]);

        ServicioBitacora::registrar(
            'CU07_GestionarEspecialidades',
            'CAMBIAR_ESTADO_ESPECIALIDAD',
            'especialidades',
            (string)$id,
            ['estado' => $especialidad->estado],
            ['estado' => $nuevoEstado]
        );

        return $nuevoEstado;
    }
}
