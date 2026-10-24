<?php

namespace App\Paquetes\CitasNotificaciones\CU13_RegistrarAsistenciaInasistenciaAtencion;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Nucleo\Bitacora\ServicioBitacora;

class RegistrarAsistenciaServicio
{
    /**
     * Registra presencia, atención o corrección administrativa RN16 de citas médicas.
     */
    public function registrar(array $datos, mixed $usuarioOperador = null): array
    {
        return DB::transaction(function () use ($datos, $usuarioOperador) {
            $idCita = (int)$datos['id_cita'];
            $nuevoCodigoEstado = $datos['estado'] ?? ($datos['estado_asistencia'] ?? null);

            $idUsuarioOperador = is_object($usuarioOperador) ? ($usuarioOperador->id_usuario ?? null) : $usuarioOperador;
            $rolUsuario = strtolower(is_object($usuarioOperador) ? ($usuarioOperador->rol ?? '') : '');

            // 1. Recuperar cita con bloqueo pesimista
            $cita = DB::table('citas')->where('id_cita', $idCita)->lockForUpdate()->first();
            if (!$cita) {
                throw new \Exception('Cita médica no encontrada.', 404);
            }

            // 2. Regla Anti-Reactivación:
            if ($cita->estado === 'cancelada' || (int)$cita->id_estado_cita === 5) {
                throw new \Exception('Una cita cancelada no puede reactivarse ni registrarse como asistida. Por favor programe una nueva cita.', 422);
            }

            // 3. Validar estado de destino
            $nuevoEstadoCita = DB::table('estados_cita')->where('codigo', $nuevoCodigoEstado)->first();
            if (!$nuevoEstadoCita) {
                throw new \Exception("Estado de cita '{$nuevoCodigoEstado}' no reconocido.", 422);
            }

            // 4. Determinar estado actual
            $estadoActual = DB::table('estados_cita')->where('id_estado_cita', $cita->id_estado_cita)->first();
            $codigoActual = $estadoActual?->codigo ?? '';

            $esCerrada = in_array($codigoActual, ['atendida', 'inasistencia'], true) ||
                         in_array((int)$cita->id_estado_cita, [4, 6], true);

            // 5. Corrección Autorizada de Citas Cerradas (atendida ⇄ inasistencia)
            if ($esCerrada) {
                // 5.1. Verificar rol exclusivo de Administrador
                if ($rolUsuario !== 'administrador') {
                    throw new \Exception('Solo el Administrador cuenta con autorización para corregir el estado de una cita cerrada.', 403);
                }

                // 5.2. Motivo obligatorio
                $motivo = trim($datos['motivo_correccion'] ?? '');
                if ($motivo === '') {
                    throw new \Exception('Debe proporcionar un motivo obligatorio para justificar la corrección administrativa de la cita.', 422);
                }

                // 5.3. Transición estrictamente conmutativa (atendida ➔ inasistencia o inasistencia ➔ atendida)
                $esConmutativo = ($codigoActual === 'atendida' && $nuevoCodigoEstado === 'inasistencia') ||
                                 ($codigoActual === 'inasistencia' && $nuevoCodigoEstado === 'atendida');

                if (!$esConmutativo) {
                    throw new \Exception("La corrección administrativa solo permite conmutar estrictamente entre 'atendida' e 'inasistencia'.", 422);
                }

                $obs = trim(($cita->observaciones ? $cita->observaciones . ' | ' : '') . "[Corrección Admin: {$motivo}]");

                DB::table('citas')->where('id_cita', $idCita)->update([
                    'id_estado_cita' => $nuevoEstadoCita->id_estado_cita,
                    'observaciones' => $obs,
                    'updated_at' => now(),
                ]);

                // 5.4. Registro de auditoría
                ServicioBitacora::registrar(
                    'CU13_RegistrarAsistenciaInasistenciaAtencion',
                    'CORRECCION_AUTORIZADA_CITA_RN16',
                    'citas',
                    (string)$idCita,
                    [
                        'id_estado_cita' => $cita->id_estado_cita,
                        'estado' => $codigoActual
                    ],
                    [
                        'usuario' => is_object($usuarioOperador) ? ($usuarioOperador->nombre_usuario ?? $usuarioOperador->email ?? ('ID:' . $usuarioOperador->id_usuario)) : ('ID:' . $idUsuarioOperador),
                        'fecha' => now()->toIso8601String(),
                        'id_cita' => $idCita,
                        'estado_anterior' => $codigoActual,
                        'estado_nuevo' => $nuevoCodigoEstado,
                        'motivo_correccion' => $motivo,
                    ],
                    $idUsuarioOperador
                );

                return [
                    'id_cita' => $idCita,
                    'codigo_cita' => $cita->codigo_cita,
                    'id_estado_cita' => $nuevoEstadoCita->id_estado_cita,
                    'estado_anterior' => $codigoActual,
                    'estado_nuevo' => $nuevoCodigoEstado,
                    'motivo_correccion' => $motivo,
                    'mensaje' => 'Corrección administrativa aplicada exitosamente.'
                ];
            }

            // 6. Flujo Regular: Validación Temporal (RN10) si la cita está en estado inicial (pendiente/programada o confirmada)
            if (in_array($codigoActual, ['pendiente', 'confirmada'], true) || in_array((int)$cita->id_estado_cita, [1, 2], true)) {
                $hoy = Carbon::today()->toDateString();
                if ($cita->fecha_cita > $hoy) {
                    throw new \Exception('No se puede registrar asistencia o atención para citas en fechas futuras.', 422);
                }

                // Verificar hora de inicio (permitiendo hasta 15 minutos de anticipación si se marca presencia en sala 'en_espera')
                $fechaHoraInicio = Carbon::parse($cita->fecha_cita . ' ' . $cita->hora_inicio);
                $minutosAnticipacion = ($nuevoCodigoEstado === 'en_espera') ? 15 : 0;
                $horaMinima = $fechaHoraInicio->copy()->subMinutes($minutosAnticipacion);

                if (now()->lessThan($horaMinima)) {
                    throw new \Exception('Aún no inicia el turno de la cita médica. Solo se permite registrar presencia hasta 15 minutos antes del inicio.', 422);
                }
            }

            // 7. Actualización regular
            $obs = $cita->observaciones;
            if (!empty($datos['observaciones'])) {
                $obs = trim(($obs ? $obs . ' | ' : '') . $datos['observaciones']);
            }

            DB::table('citas')->where('id_cita', $idCita)->update([
                'id_estado_cita' => $nuevoEstadoCita->id_estado_cita,
                'observaciones' => $obs,
                'updated_at' => now(),
            ]);

            ServicioBitacora::registrar(
                'CU13_RegistrarAsistenciaInasistenciaAtencion',
                'REGISTRAR_ASISTENCIA',
                'citas',
                (string)$idCita,
                [
                    'id_estado_cita' => $cita->id_estado_cita,
                    'estado' => $codigoActual
                ],
                [
                    'id_estado_cita' => $nuevoEstadoCita->id_estado_cita,
                    'estado' => $nuevoCodigoEstado
                ],
                $idUsuarioOperador
            );

            return [
                'id_cita' => $idCita,
                'codigo_cita' => $cita->codigo_cita,
                'id_estado_cita' => $nuevoEstadoCita->id_estado_cita,
                'estado' => $nuevoCodigoEstado,
                'mensaje' => 'Estado de asistencia registrado satisfactoriamente.'
            ];
        });
    }
}
