<?php

namespace App\Nucleo\Bitacora;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class ServicioBitacora
{
    /**
     * Registra una acción de auditoría en la tabla bitacora_auditoria.
     */
    public static function registrar(
        string $casoUso,
        string $accion,
        ?string $tablaAfectada = null,
        ?string $registroId = null,
        mixed $datosAnteriores = null,
        mixed $datosNuevos = null,
        ?int $idUsuario = null
    ): void {
        try {
            $request = request();
            $ip = $request ? $request->ip() : '127.0.0.1';
            $userAgent = $request ? substr((string)$request->userAgent(), 0, 500) : 'Sistema/CLI';

            if ($idUsuario === null && $request && $request->attributes->has('usuario_autenticado')) {
                $usuario = $request->attributes->get('usuario_autenticado');
                $idUsuario = $usuario->id_usuario ?? null;
            }

            DB::table('bitacora_auditoria')->insert([
                'id_usuario' => $idUsuario,
                'caso_uso' => $casoUso,
                'accion' => $accion,
                'tabla_afectada' => $tablaAfectada,
                'registro_id' => $registroId ? (string)$registroId : null,
                'datos_anteriores' => $datosAnteriores ? json_encode($datosAnteriores, JSON_UNESCAPED_UNICODE) : null,
                'datos_nuevos' => $datosNuevos ? json_encode($datosNuevos, JSON_UNESCAPED_UNICODE) : null,
                'ip_origen' => $ip,
                'user_agent' => $userAgent,
                'fecha_hora' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Throwable $e) {
            report($e);
        }
    }
}
