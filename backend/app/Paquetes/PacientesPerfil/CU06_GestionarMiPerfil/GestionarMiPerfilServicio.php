<?php

namespace App\Paquetes\PacientesPerfil\CU06_GestionarMiPerfil;

use Illuminate\Support\Facades\DB;
use App\Nucleo\Bitacora\ServicioBitacora;

class GestionarMiPerfilServicio
{
    public function obtenerPerfil(object $usuario): array
    {
        $persona = DB::table('personas')->where('id_persona', $usuario->id_persona)->first();

        $infoPaciente = null;
        $contactoEmergencia = null;
        if (!empty($usuario->id_paciente)) {
            $infoPaciente = DB::table('informacion_medica_paciente')
                ->where('id_paciente', $usuario->id_paciente)
                ->first();

            $contactoEmergencia = DB::table('contactos_emergencia')
                ->where('id_paciente', $usuario->id_paciente)
                ->where('es_principal', true)
                ->first();
        }

        $infoMedico = null;
        if (!empty($usuario->id_medico)) {
            $infoMedico = DB::table('medicos')
                ->where('id_medico', $usuario->id_medico)
                ->first();
        }

        return [
            'usuario' => $usuario,
            'persona' => $persona,
            'informacion_medica' => $infoPaciente,
            'contacto_emergencia' => $contactoEmergencia,
            'medico' => $infoMedico,
        ];
    }

    public function actualizar(object $usuario, array $datos): void
    {
        DB::transaction(function () use ($usuario, $datos) {
            DB::table('personas')->where('id_persona', $usuario->id_persona)->update([
                'telefono' => $datos['telefono'] ?? null,
                'correo' => $datos['correo'],
                'direccion' => $datos['direccion'] ?? null,
                'updated_at' => now(),
            ]);

            DB::table('usuarios')->where('id_usuario', $usuario->id_usuario)->update([
                'correo' => $datos['correo'],
                'updated_at' => now(),
            ]);

            if (!empty($usuario->id_paciente) && !empty($datos['contacto_nombre'])) {
                DB::table('contactos_emergencia')->updateOrInsert(
                    ['id_paciente' => $usuario->id_paciente, 'es_principal' => true],
                    [
                        'nombre_completo' => $datos['contacto_nombre'],
                        'relacion' => $datos['contacto_relacion'] ?? 'Familiar',
                        'telefono' => $datos['contacto_telefono'] ?? ($datos['telefono'] ?? '0'),
                        'updated_at' => now(),
                    ]
                );
            }

            ServicioBitacora::registrar(
                'CU06_GestionarMiPerfil',
                'ACTUALIZAR_MI_PERFIL',
                'personas',
                (string)$usuario->id_persona,
                null,
                ['correo' => $datos['correo']],
                $usuario->id_usuario
            );
        });
    }
}
