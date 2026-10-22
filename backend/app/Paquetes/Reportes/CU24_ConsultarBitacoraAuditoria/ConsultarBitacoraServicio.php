<?php

namespace App\Paquetes\Reportes\CU24_ConsultarBitacoraAuditoria;

use Illuminate\Support\Facades\DB;

class ConsultarBitacoraServicio
{
    public function consultar(?string $casoUso = null, ?string $accion = null, ?string $fecha = null, int $limite = 100): array
    {
        $query = DB::table('bitacora_auditoria')
            ->leftJoin('usuarios', 'bitacora_auditoria.id_usuario', '=', 'usuarios.id_usuario')
            ->select(
                'bitacora_auditoria.*',
                'usuarios.nombre_usuario'
            )
            ->orderBy('bitacora_auditoria.id_bitacora', 'desc')
            ->limit($limite);

        if ($casoUso) {
            $query->where('bitacora_auditoria.caso_uso', 'ilike', "%{$casoUso}%");
        }

        if ($accion) {
            $query->where('bitacora_auditoria.accion', 'ilike', "%{$accion}%");
        }

        if ($fecha) {
            $query->whereDate('bitacora_auditoria.fecha_hora', $fecha);
        }

        return $query->get()->toArray();
    }
}
