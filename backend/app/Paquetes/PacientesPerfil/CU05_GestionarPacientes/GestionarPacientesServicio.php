<?php

namespace App\Paquetes\PacientesPerfil\CU05_GestionarPacientes;

use Illuminate\Support\Facades\DB;
use App\Nucleo\Bitacora\ServicioBitacora;

class GestionarPacientesServicio
{
    public function listar(?string $termino = null, ?string $estado = null): array
    {
        $query = DB::table('pacientes')
            ->join('personas', 'pacientes.id_persona', '=', 'personas.id_persona')
            ->leftJoin('informacion_medica_paciente', 'pacientes.id_paciente', '=', 'informacion_medica_paciente.id_paciente')
            ->leftJoin('contactos_emergencia', function ($join) {
                $join->on('pacientes.id_paciente', '=', 'contactos_emergencia.id_paciente')
                     ->where('contactos_emergencia.es_principal', true);
            })
            ->select(
                'pacientes.id_paciente',
                'pacientes.codigo_historia',
                'pacientes.grupo_sanguineo',
                'pacientes.estado',
                'personas.id_persona',
                'personas.ci',
                'personas.nombres',
                'personas.apellidos',
                'personas.fecha_nacimiento',
                'personas.sexo',
                'personas.telefono',
                'personas.correo',
                'personas.direccion',
                'informacion_medica_paciente.alergias',
                'informacion_medica_paciente.enfermedades_cronicas',
                'contactos_emergencia.nombre_completo as contacto_nombre',
                'contactos_emergencia.relacion as contacto_relacion',
                'contactos_emergencia.telefono as contacto_telefono'
            )
            ->orderBy('pacientes.id_paciente', 'desc');

        if ($termino) {
            $query->where(function ($q) use ($termino) {
                $q->where('personas.nombres', 'ilike', "%{$termino}%")
                  ->orWhere('personas.apellidos', 'ilike', "%{$termino}%")
                  ->orWhere('personas.ci', 'ilike', "%{$termino}%")
                  ->orWhere('pacientes.codigo_historia', 'ilike', "%{$termino}%");
            });
        }

        if ($estado) {
            $query->where('pacientes.estado', $estado);
        }

        return $query->get()->toArray();
    }

    public function obtenerPorId(int $idPaciente): ?object
    {
        return DB::table('pacientes')
            ->join('personas', 'pacientes.id_persona', '=', 'personas.id_persona')
            ->leftJoin('informacion_medica_paciente', 'pacientes.id_paciente', '=', 'informacion_medica_paciente.id_paciente')
            ->where('pacientes.id_paciente', $idPaciente)
            ->select(
                'pacientes.*',
                'personas.ci',
                'personas.nombres',
                'personas.apellidos',
                'personas.fecha_nacimiento',
                'personas.sexo',
                'personas.telefono',
                'personas.correo',
                'personas.direccion',
                'informacion_medica_paciente.alergias',
                'informacion_medica_paciente.enfermedades_cronicas',
                'informacion_medica_paciente.medicamentos_actuales',
                'informacion_medica_paciente.antecedentes_familiares',
                'informacion_medica_paciente.observaciones as observaciones_medicas'
            )
            ->first();
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
                'correo' => $datos['correo'] ?? null,
                'direccion' => $datos['direccion'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ], 'id_persona');

            $codigoHistoria = 'HC-' . date('Y') . '-' . str_pad($idPersona, 5, '0', STR_PAD_LEFT);

            $idPaciente = DB::table('pacientes')->insertGetId([
                'id_persona' => $idPersona,
                'codigo_historia' => $codigoHistoria,
                'grupo_sanguineo' => $datos['grupo_sanguineo'] ?? null,
                'estado' => $datos['estado'] ?? 'activo',
                'created_at' => now(),
                'updated_at' => now(),
            ], 'id_paciente');

            DB::table('informacion_medica_paciente')->insert([
                'id_paciente' => $idPaciente,
                'alergias' => $datos['alergias'] ?? null,
                'enfermedades_cronicas' => $datos['enfermedades_cronicas'] ?? null,
                'medicamentos_actuales' => $datos['medicamentos_actuales'] ?? null,
                'antecedentes_familiares' => $datos['antecedentes_familiares'] ?? null,
                'observaciones' => $datos['observaciones'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            ServicioBitacora::registrar(
                'CU05_GestionarPacientes',
                'CREAR_PACIENTE',
                'pacientes',
                (string)$idPaciente,
                null,
                ['codigo_historia' => $codigoHistoria]
            );

            return $idPaciente;
        });
    }

    public function actualizar(int $idPaciente, array $datos): void
    {
        DB::transaction(function () use ($idPaciente, $datos) {
            $paciente = DB::table('pacientes')->where('id_paciente', $idPaciente)->first();
            if (!$paciente) {
                throw new \Exception('Paciente no encontrado', 404);
            }

            DB::table('personas')->where('id_persona', $paciente->id_persona)->update([
                'ci' => $datos['ci'],
                'nombres' => $datos['nombres'],
                'apellidos' => $datos['apellidos'],
                'fecha_nacimiento' => $datos['fecha_nacimiento'] ?? null,
                'sexo' => $datos['sexo'] ?? null,
                'telefono' => $datos['telefono'] ?? null,
                'correo' => $datos['correo'] ?? null,
                'direccion' => $datos['direccion'] ?? null,
                'updated_at' => now(),
            ]);

            DB::table('pacientes')->where('id_paciente', $idPaciente)->update([
                'grupo_sanguineo' => $datos['grupo_sanguineo'] ?? $paciente->grupo_sanguineo,
                'estado' => $datos['estado'] ?? $paciente->estado,
                'updated_at' => now(),
            ]);

            DB::table('informacion_medica_paciente')
                ->updateOrInsert(
                    ['id_paciente' => $idPaciente],
                    [
                        'alergias' => $datos['alergias'] ?? null,
                        'enfermedades_cronicas' => $datos['enfermedades_cronicas'] ?? null,
                        'medicamentos_actuales' => $datos['medicamentos_actuales'] ?? null,
                        'antecedentes_familiares' => $datos['antecedentes_familiares'] ?? null,
                        'observaciones' => $datos['observaciones'] ?? null,
                        'updated_at' => now(),
                    ]
                );

            ServicioBitacora::registrar(
                'CU05_GestionarPacientes',
                'ACTUALIZAR_PACIENTE',
                'pacientes',
                (string)$idPaciente,
                ['estado' => $paciente->estado],
                ['estado' => $datos['estado'] ?? $paciente->estado]
            );
        });
    }

    /**
     * Desactivación lógica obligatoria. PROHIBIDO BORRADO FÍSICO.
     */
    public function alternarEstado(int $idPaciente): string
    {
        $paciente = DB::table('pacientes')->where('id_paciente', $idPaciente)->first();
        if (!$paciente) {
            throw new \Exception('Paciente no encontrado', 404);
        }

        $nuevoEstado = $paciente->estado === 'activo' ? 'inactivo' : 'activo';

        DB::table('pacientes')->where('id_paciente', $idPaciente)->update([
            'estado' => $nuevoEstado,
            'updated_at' => now(),
        ]);

        ServicioBitacora::registrar(
            'CU05_GestionarPacientes',
            'CAMBIAR_ESTADO_LOGICO_PACIENTE',
            'pacientes',
            (string)$idPaciente,
            ['estado' => $paciente->estado],
            ['estado' => $nuevoEstado]
        );

        return $nuevoEstado;
    }
}
