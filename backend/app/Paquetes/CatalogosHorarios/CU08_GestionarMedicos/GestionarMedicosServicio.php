<?php

namespace App\Paquetes\CatalogosHorarios\CU08_GestionarMedicos;

use Illuminate\Support\Facades\DB;
use App\Nucleo\Bitacora\ServicioBitacora;

class GestionarMedicosServicio
{
    public function listar(?string $termino = null, ?int $idEspecialidad = null, ?string $estado = null): array
    {
        $query = DB::table('medicos')
            ->join('personas', 'medicos.id_persona', '=', 'personas.id_persona')
            ->select(
                'medicos.id_medico',
                'medicos.nro_matricula',
                'medicos.biografia',
                'medicos.estado',
                'personas.id_persona',
                'personas.ci',
                'personas.nombres',
                'personas.apellidos',
                'personas.correo',
                'personas.telefono'
            )
            ->orderBy('personas.apellidos');

        if ($termino) {
            $query->where(function ($q) use ($termino) {
                $q->where('personas.nombres', 'ilike', "%{$termino}%")
                  ->orWhere('personas.apellidos', 'ilike', "%{$termino}%")
                  ->orWhere('personas.ci', 'ilike', "%{$termino}%")
                  ->orWhere('medicos.nro_matricula', 'ilike', "%{$termino}%");
            });
        }

        if ($estado) {
            $query->where('medicos.estado', $estado);
        }

        if ($idEspecialidad) {
            $query->whereExists(function ($sub) use ($idEspecialidad) {
                $sub->select(DB::raw(1))
                    ->from('medico_especialidad')
                    ->whereColumn('medico_especialidad.id_medico', 'medicos.id_medico')
                    ->where('medico_especialidad.id_especialidad', $idEspecialidad);
            });
        }

        $medicos = $query->get();

        // Cargar especialidades de cada médico
        foreach ($medicos as $medico) {
            $medico->especialidades = DB::table('medico_especialidad')
                ->join('especialidades', 'medico_especialidad.id_especialidad', '=', 'especialidades.id_especialidad')
                ->where('medico_especialidad.id_medico', $medico->id_medico)
                ->select('especialidades.id_especialidad', 'especialidades.nombre')
                ->get()
                ->toArray();
        }

        return $medicos->toArray();
    }

    public function crear(array $datos): int
    {
        return DB::transaction(function () use ($datos) {
            $idPersona = DB::table('personas')->insertGetId([
                'ci' => $datos['ci'],
                'nombres' => $datos['nombres'],
                'apellidos' => $datos['apellidos'],
                'fecha_nacimiento' => $datos['fecha_nacimiento'] ?? null,
                'sexo' => $datos['sexo'] ?? null,
                'telefono' => $datos['telefono'] ?? null,
                'correo' => $datos['correo'],
                'direccion' => $datos['direccion'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ], 'id_persona');

            $idMedico = DB::table('medicos')->insertGetId([
                'id_persona' => $idPersona,
                'nro_matricula' => $datos['nro_matricula'],
                'biografia' => $datos['biografia'] ?? null,
                'estado' => $datos['estado'] ?? 'activo',
                'created_at' => now(),
                'updated_at' => now(),
            ], 'id_medico');

            foreach ($datos['especialidades'] as $idEspecialidad) {
                DB::table('medico_especialidad')->insert([
                    'id_medico' => $idMedico,
                    'id_especialidad' => $idEspecialidad,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            ServicioBitacora::registrar(
                'CU08_GestionarMedicos',
                'CREAR_MEDICO',
                'medicos',
                (string)$idMedico,
                null,
                ['nro_matricula' => $datos['nro_matricula']]
            );

            return $idMedico;
        });
    }

    public function actualizar(int $idMedico, array $datos): void
    {
        DB::transaction(function () use ($idMedico, $datos) {
            $medico = DB::table('medicos')->where('id_medico', $idMedico)->first();
            if (!$medico) {
                throw new \Exception('Médico no encontrado', 404);
            }

            DB::table('personas')->where('id_persona', $medico->id_persona)->update([
                'ci' => $datos['ci'],
                'nombres' => $datos['nombres'],
                'apellidos' => $datos['apellidos'],
                'fecha_nacimiento' => $datos['fecha_nacimiento'] ?? null,
                'sexo' => $datos['sexo'] ?? null,
                'telefono' => $datos['telefono'] ?? null,
                'correo' => $datos['correo'],
                'direccion' => $datos['direccion'] ?? null,
                'updated_at' => now(),
            ]);

            DB::table('medicos')->where('id_medico', $idMedico)->update([
                'nro_matricula' => $datos['nro_matricula'],
                'biografia' => $datos['biografia'] ?? null,
                'estado' => $datos['estado'] ?? $medico->estado,
                'updated_at' => now(),
            ]);

            // Sincronizar especialidades
            DB::table('medico_especialidad')->where('id_medico', $idMedico)->delete();
            foreach ($datos['especialidades'] as $idEspecialidad) {
                DB::table('medico_especialidad')->insert([
                    'id_medico' => $idMedico,
                    'id_especialidad' => $idEspecialidad,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            ServicioBitacora::registrar(
                'CU08_GestionarMedicos',
                'ACTUALIZAR_MEDICO',
                'medicos',
                (string)$idMedico,
                ['estado' => $medico->estado],
                ['estado' => $datos['estado'] ?? $medico->estado]
            );
        });
    }

    /**
     * PROHIBIDO BORRADO FÍSICO. Desactivación o activación lógica.
     */
    public function alternarEstado(int $idMedico): string
    {
        $medico = DB::table('medicos')->where('id_medico', $idMedico)->first();
        if (!$medico) {
            throw new \Exception('Médico no encontrado', 404);
        }

        $nuevoEstado = $medico->estado === 'activo' ? 'inactivo' : 'activo';

        DB::table('medicos')->where('id_medico', $idMedico)->update([
            'estado' => $nuevoEstado,
            'updated_at' => now(),
        ]);

        ServicioBitacora::registrar(
            'CU08_GestionarMedicos',
            'CAMBIAR_ESTADO_LOGICO_MEDICO',
            'medicos',
            (string)$idMedico,
            ['estado' => $medico->estado],
            ['estado' => $nuevoEstado]
        );

        return $nuevoEstado;
    }
}
