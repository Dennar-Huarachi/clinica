<?php

namespace App\Paquetes\AccesoCuentas\CU03_RegistrarsePaciente;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Nucleo\Bitacora\ServicioBitacora;

class RegistrarsePacienteServicio
{
    /**
     * Registra un nuevo paciente en una transacción atómica (personas + usuarios + pacientes).
     */
    public function registrar(array $datos): array
    {
        return DB::transaction(function () use ($datos) {
            // 1. Crear persona
            $idPersona = DB::table('personas')->insertGetId([
                'ci' => $datos['ci'],
                'nombres' => $datos['nombres'],
                'apellidos' => $datos['apellidos'],
                'fecha_nacimiento' => $datos['fecha_nacimiento'],
                'sexo' => $datos['sexo'],
                'telefono' => $datos['telefono'],
                'correo' => $datos['correo'],
                'direccion' => $datos['direccion'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ], 'id_persona');

            // 2. Obtener rol de paciente (id_rol = 4)
            $rolPaciente = DB::table('roles')->where('nombre', 'paciente')->first();
            $idRol = $rolPaciente ? $rolPaciente->id_rol : 4;

            // 3. Crear usuario
            $token = Str::random(60);
            $idUsuario = DB::table('usuarios')->insertGetId([
                'id_persona' => $idPersona,
                'id_rol' => $idRol,
                'nombre_usuario' => $datos['nombre_usuario'],
                'correo' => $datos['correo'],
                'contrasena_hash' => Hash::make($datos['contrasena']),
                'debe_cambiar_contrasena' => false,
                'estado' => 'activo',
                'token_sesion' => $token,
                'ultimo_acceso' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ], 'id_usuario');

            // 4. Crear registro en pacientes con código de historia único
            $codigoHistoria = 'HC-' . date('Y') . '-' . str_pad($idPersona, 5, '0', STR_PAD_LEFT);
            $idPaciente = DB::table('pacientes')->insertGetId([
                'id_persona' => $idPersona,
                'codigo_historia' => $codigoHistoria,
                'grupo_sanguineo' => $datos['grupo_sanguineo'] ?? null,
                'estado' => 'activo',
                'created_at' => now(),
                'updated_at' => now(),
            ], 'id_paciente');

            // 5. Inicializar ficha médica vacía
            DB::table('informacion_medica_paciente')->insert([
                'id_paciente' => $idPaciente,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            ServicioBitacora::registrar(
                'CU03_RegistrarsePaciente',
                'AUTORREGISTRO_PACIENTE',
                'pacientes',
                (string)$idPaciente,
                null,
                ['codigo_historia' => $codigoHistoria, 'id_usuario' => $idUsuario],
                $idUsuario
            );

            return [
                'token' => $token,
                'usuario' => [
                    'id_usuario' => $idUsuario,
                    'nombre_usuario' => $datos['nombre_usuario'],
                    'correo' => $datos['correo'],
                    'rol' => 'paciente',
                    'nombres' => $datos['nombres'],
                    'apellidos' => $datos['apellidos'],
                    'id_paciente' => $idPaciente,
                    'codigo_historia' => $codigoHistoria,
                ]
            ];
        });
    }
}
