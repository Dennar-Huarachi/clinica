<?php

namespace App\Paquetes\Reportes\CU24_ConsultarBitacoraAuditoria;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ConsultarBitacoraServicio
{
    /**
     * Consulta el registro histórico inmutable de auditoría forense del sistema (CU-24 / RN21).
     * Exclusivo de solo lectura para el rol Administrador.
     */
    public function consultar(
        ?string $casoUso = null,
        ?string $accion = null,
        ?string $usuario = null,
        ?string $tablaAfectada = null,
        ?string $fechaInicio = null,
        ?string $fechaFin = null,
        ?string $fecha = null,
        int $limite = 150
    ): array {
        $query = DB::table('bitacora_auditoria')
            ->leftJoin('usuarios', 'bitacora_auditoria.id_usuario', '=', 'usuarios.id_usuario')
            ->leftJoin('personas', 'usuarios.id_persona', '=', 'personas.id_persona')
            ->select(
                'bitacora_auditoria.id_bitacora',
                'bitacora_auditoria.id_usuario',
                'bitacora_auditoria.caso_uso',
                'bitacora_auditoria.accion',
                'bitacora_auditoria.tabla_afectada',
                'bitacora_auditoria.registro_id',
                'bitacora_auditoria.datos_anteriores',
                'bitacora_auditoria.datos_nuevos',
                'bitacora_auditoria.ip_origen',
                'bitacora_auditoria.user_agent',
                'bitacora_auditoria.fecha_hora',
                'usuarios.nombre_usuario',
                'usuarios.rol as usuario_rol',
                DB::raw("trim(personas.nombres || ' ' || personas.apellidos) as usuario_nombre_completo")
            )
            ->orderBy('bitacora_auditoria.fecha_hora', 'desc')
            ->orderBy('bitacora_auditoria.id_bitacora', 'desc')
            ->limit(min(max($limite, 10), 500));

        if ($casoUso && trim($casoUso) !== '') {
            $query->where('bitacora_auditoria.caso_uso', 'ilike', '%' . trim($casoUso) . '%');
        }

        if ($accion && trim($accion) !== '') {
            $query->where('bitacora_auditoria.accion', 'ilike', '%' . trim($accion) . '%');
        }

        if ($tablaAfectada && trim($tablaAfectada) !== '') {
            $query->where('bitacora_auditoria.tabla_afectada', 'ilike', '%' . trim($tablaAfectada) . '%');
        }

        if ($usuario && trim($usuario) !== '') {
            $u = trim($usuario);
            $query->where(function ($sub) use ($u) {
                $sub->where('usuarios.nombre_usuario', 'ilike', "%{$u}%")
                    ->orWhere('personas.nombres', 'ilike', "%{$u}%")
                    ->orWhere('personas.apellidos', 'ilike', "%{$u}%");
            });
        }

        if ($fecha) {
            $query->whereDate('bitacora_auditoria.fecha_hora', $fecha);
        } else {
            if ($fechaInicio) {
                $query->whereDate('bitacora_auditoria.fecha_hora', '>=', $fechaInicio);
            }
            if ($fechaFin) {
                $query->whereDate('bitacora_auditoria.fecha_hora', '<=', $fechaFin);
            }
        }

        return $query->get()->map(function ($row) {
            // Decodificar JSON si viene como string
            if (is_string($row->datos_anteriores)) {
                $row->datos_anteriores = json_decode($row->datos_anteriores, true);
            }
            if (is_string($row->datos_nuevos)) {
                $row->datos_nuevos = json_decode($row->datos_nuevos, true);
            }
            return $row;
        })->toArray();
    }
}
