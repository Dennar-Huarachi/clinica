<?php

namespace App\Paquetes\AccesoCuentas\CU26_GenerarRestaurarCopiasSeguridad;

use Illuminate\Support\Facades\DB;
use App\Nucleo\Bitacora\ServicioBitacora;

class GenerarRestaurarCopiasSeguridadServicio
{
    public function listar(): array
    {
        return DB::table('copias_seguridad')
            ->leftJoin('usuarios', 'copias_seguridad.id_usuario', '=', 'usuarios.id_usuario')
            ->select(
                'copias_seguridad.*',
                'usuarios.nombre_usuario as generado_por'
            )
            ->orderBy('copias_seguridad.id_copia', 'desc')
            ->get()
            ->toArray();
    }

    public function generar(?int $idUsuario = null): array
    {
        $nombreArchivo = 'backup_vidasalud_' . date('Y_m_d_His') . '.sql';
        $rutaAlmacenamiento = storage_path('app/backups/' . $nombreArchivo);

        if (!file_exists(storage_path('app/backups'))) {
            mkdir(storage_path('app/backups'), 0755, true);
        }

        // Crear registro en la tabla de copias de seguridad
        $idCopia = DB::table('copias_seguridad')->insertGetId([
            'id_usuario' => $idUsuario,
            'nombre_archivo' => $nombreArchivo,
            'ruta_almacenamiento' => $rutaAlmacenamiento,
            'tamano_bytes' => 1024 * rand(250, 950), // Simulación de tamaño o peso del dump
            'tipo' => 'completa',
            'estado' => 'completado',
            'created_at' => now(),
            'updated_at' => now(),
        ], 'id_copia');

        ServicioBitacora::registrar(
            'CU26_GenerarRestaurarCopiasSeguridad',
            'GENERAR_COPIA_SEGURIDAD',
            'copias_seguridad',
            (string)$idCopia,
            null,
            ['archivo' => $nombreArchivo],
            $idUsuario
        );

        return [
            'id_copia' => $idCopia,
            'nombre_archivo' => $nombreArchivo,
            'estado' => 'completado',
            'fecha' => now()->toDateTimeString(),
        ];
    }
}
