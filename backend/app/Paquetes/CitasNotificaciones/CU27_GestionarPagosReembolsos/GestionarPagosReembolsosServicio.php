<?php

namespace App\Paquetes\CitasNotificaciones\CU27_GestionarPagosReembolsos;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Nucleo\Bitacora\ServicioBitacora;

class GestionarPagosReembolsosServicio
{
    /**
     * Procesa y registra atómicamente el pago simulado del depósito de garantía (D17, RN15).
     */
    public function procesarDepositoGarantia(int $idCita, array $datosPago, $usuarioOperador = null): array
    {
        return DB::transaction(function () use ($idCita, $datosPago, $usuarioOperador) {
            $cita = DB::table('citas')->where('id_cita', $idCita)->lockForUpdate()->first();
            if (!$cita) {
                throw new \Exception("La cita médica referenciada no existe.", 404);
            }

            // Blindaje IDOR (RN19): Si es rol paciente, verificar propiedad de la cita
            if (is_object($usuarioOperador) && strtolower($usuarioOperador->rol ?? '') === 'paciente') {
                $idPacienteUsuario = (int)($usuarioOperador->id_paciente ?? 0);
                if (!$idPacienteUsuario && !empty($usuarioOperador->id_persona)) {
                    $paciente = DB::table('pacientes')->where('id_persona', $usuarioOperador->id_persona)->first();
                    $idPacienteUsuario = (int)($paciente?->id_paciente ?? 0);
                }
                if ((int)$cita->id_paciente !== $idPacienteUsuario) {
                    throw new \Exception('No tiene autorización para procesar pagos sobre citas de otro paciente.', 403);
                }
            }

            // Verificar si la cita ya cuenta con un pago completado
            $pagoExistente = DB::table('pagos_cita')
                ->where('id_cita', $idCita)
                ->where('estado_pago', 'completado')
                ->first();

            if ($pagoExistente) {
                return [
                    'id_pago' => $pagoExistente->id_pago,
                    'id_cita' => $idCita,
                    'codigo_cita' => $cita->codigo_cita,
                    'nro_transaccion' => $pagoExistente->nro_transaccion,
                    'monto' => (float)$pagoExistente->monto,
                    'metodo_pago' => $pagoExistente->metodo_pago,
                    'estado_pago' => $pagoExistente->estado_pago,
                    'fecha_pago' => $pagoExistente->fecha_pago,
                    'comprobante' => [
                        'titulo' => 'Comprobante Digital de Garantía de Reserva',
                        'institucion' => 'Clínica Médica Vida Salud',
                        'nro_transaccion' => $pagoExistente->nro_transaccion,
                        'codigo_cita' => $cita->codigo_cita,
                        'fecha_turno' => $cita->fecha_cita . ' ' . $cita->hora_inicio,
                        'monto_bs' => (float)$pagoExistente->monto,
                        'estado' => 'COMPLETADO',
                        'politica_rn15' => 'Reembolso del 100% disponible con al menos 12 horas de anticipación.',
                    ],
                ];
            }

            // Obtener monto configurado en el sistema
            $montoParam = DB::table('parametros_sistema')->where('clave', 'MONTO_FIJO_RESERVA_CITA')->value('valor') ?: '50.00';
            $montoReserva = isset($datosPago['monto']) && (float)$datosPago['monto'] > 0
                ? (float)$datosPago['monto']
                : (float)$montoParam;

            // Normalización de método de pago
            $metodo = $datosPago['metodo_pago'] ?? 'qr_transferencia';
            if ($metodo === 'qr') $metodo = 'qr_transferencia';
            if ($metodo === 'tarjeta') $metodo = 'tarjeta_debito_credito';

            $nroTransaccion = 'TX-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
            $ahora = now();

            $idUsuario = is_object($usuarioOperador) ? ($usuarioOperador->id_usuario ?? null) : $usuarioOperador;

            $detallesPasarela = $datosPago['detalles_pasarela'] ?? [
                'pasarela' => 'simulada_interoperable',
                'referencia' => $datosPago['referencia_simulada'] ?? ('SIM-' . rand(100000, 999999)),
                'banco' => $metodo === 'qr_transferencia' ? 'Simple QR Interoperable' : 'Pasarela Tarjeta Simulada',
                'monto_bs' => $montoReserva,
            ];

            $idPago = DB::table('pagos_cita')->insertGetId([
                'id_cita' => $idCita,
                'tipo_pago' => 'garantia',
                'monto' => $montoReserva,
                'monto_recibido' => null,
                'metodo_pago' => $metodo,
                'nro_transaccion' => $nroTransaccion,
                'estado_pago' => 'completado',
                'detalles_pasarela' => is_string($detallesPasarela) ? $detallesPasarela : json_encode($detallesPasarela),
                'fecha_pago' => $ahora,
                'id_usuario_registro' => $idUsuario,
                'created_at' => $ahora,
                'updated_at' => $ahora,
            ], 'id_pago');

            // Actualizar cita con id_pago y confirmación de pago
            DB::table('citas')->where('id_cita', $idCita)->update([
                'id_pago' => $idPago,
                'pago_confirmado' => true,
                'updated_at' => $ahora,
            ]);

            ServicioBitacora::registrar(
                'CU27_GestionarPagosReembolsos',
                'PAGO_GARANTIA_RESERVA_COMPLETADO',
                'pagos_cita',
                (string)$idPago,
                null,
                [
                    'id_cita' => $idCita,
                    'codigo_cita' => $cita->codigo_cita,
                    'nro_transaccion' => $nroTransaccion,
                    'monto' => $montoReserva,
                    'metodo_pago' => $metodo,
                ],
                $idUsuario
            );

            return [
                'id_pago' => $idPago,
                'id_cita' => $idCita,
                'codigo_cita' => $cita->codigo_cita,
                'nro_transaccion' => $nroTransaccion,
                'monto' => $montoReserva,
                'metodo_pago' => $metodo,
                'estado_pago' => 'completado',
                'fecha_pago' => $ahora->toIso8601String(),
                'comprobante' => [
                    'titulo' => 'Comprobante Digital de Garantía de Reserva',
                    'institucion' => 'Clínica Médica Vida Salud',
                    'nro_transaccion' => $nroTransaccion,
                    'codigo_cita' => $cita->codigo_cita,
                    'fecha_turno' => $cita->fecha_cita . ' ' . $cita->hora_inicio,
                    'monto_bs' => $montoReserva,
                    'estado' => 'COMPLETADO',
                    'politica_rn15' => 'Reembolso del 100% disponible con al menos 12 horas de anticipación.',
                ],
            ];
        });
    }

    /**
     * Procesa la evaluación de reembolso o penalización con retención (RN15, CU-12, CU-27).
     * - Citas postergadas: la garantía se reembolsa SIEMPRE al 100%, sin regla de 12 horas.
     * - Cobros de saldo: si la cita tenía un saldo pagado, se reembolsa SIEMPRE al 100%.
     * - Citas normales: garantía sujeta a 12 horas mínimas de anticipación (reembolso o retención).
     */
    public function procesarReembolsoORetencion(int $idCita, $usuarioOperador = null, string $motivo = ''): array
    {
        return DB::transaction(function () use ($idCita, $usuarioOperador, $motivo) {
            $cita = DB::table('citas')->where('id_cita', $idCita)->lockForUpdate()->first();
            if (!$cita) {
                throw new \Exception("La cita médica no existe.", 404);
            }

            // Blindaje IDOR (RN19): Si es rol paciente, verificar propiedad de la cita
            if (is_object($usuarioOperador) && strtolower($usuarioOperador->rol ?? '') === 'paciente') {
                $idPacienteUsuario = (int)($usuarioOperador->id_paciente ?? 0);
                if (!$idPacienteUsuario && !empty($usuarioOperador->id_persona)) {
                    $paciente = DB::table('pacientes')->where('id_persona', $usuarioOperador->id_persona)->first();
                    $idPacienteUsuario = (int)($paciente?->id_paciente ?? 0);
                }
                if ((int)$cita->id_paciente !== $idPacienteUsuario) {
                    throw new \Exception('No tiene autorización para solicitar o procesar reembolsos sobre citas de otro paciente.', 403);
                }
            }

            $pagos = DB::table('pagos_cita')->where('id_cita', $idCita)->lockForUpdate()->get();
            if ($pagos->isEmpty()) {
                return [
                    'id_cita' => $idCita,
                    'estado_pago' => 'sin_pago',
                    'mensaje' => 'La cita no registra pagos asociados.',
                ];
            }

            // Determinar si la cita cancelada está o estuvo en estado Postergada
            $estadoPostergadaId = DB::table('estados_cita')->where('codigo', 'postergada')->value('id_estado_cita') ?: 9;
            $esPostergada = ((int)$cita->id_estado_cita === (int)$estadoPostergadaId || !empty($cita->es_postergada));

            // Calcular diferencia de horas respecto al turno (zona horaria America/La_Paz)
            $fechaHoraCita = Carbon::parse($cita->fecha_cita . ' ' . $cita->hora_inicio, 'America/La_Paz');
            $horasDiferencia = Carbon::now('America/La_Paz')->diffInHours($fechaHoraCita, false);

            $paramHoras = DB::table('parametros_sistema')->where('clave', 'HORAS_ANTICIPACION_CANCELAR')->value('valor') ?: 12;
            $horasMinimas = (int)$paramHoras;

            $idUsuario = is_object($usuarioOperador) ? ($usuarioOperador->id_usuario ?? null) : $usuarioOperador;

            $pagosProcesados = [];

            foreach ($pagos as $pago) {
                // Si el pago ya fue reembolsado o retenido, no procesarlo de nuevo
                if (in_array($pago->estado_pago, ['reembolsado', 'retenido'], true)) {
                    continue;
                }

                $esSaldo = ($pago->tipo_pago === 'saldo');

                if ($esSaldo) {
                    // El saldo cobrado en recepción SIEMPRE se reembolsa completo en cualquier cancelación
                    DB::table('pagos_cita')->where('id_pago', $pago->id_pago)->update([
                        'estado_pago' => 'reembolsado',
                        'fecha_reembolso' => now(),
                        'updated_at' => now(),
                    ]);

                    ServicioBitacora::registrar(
                        'CU27_GestionarPagosReembolsos',
                        'REEMBOLSO_SALDO_CANCELACION',
                        'pagos_cita',
                        (string)$pago->id_pago,
                        ['estado_pago' => $pago->estado_pago],
                        [
                            'id_cita' => $idCita,
                            'codigo_cita' => $cita->codigo_cita,
                            'estado_pago' => 'reembolsado',
                            'monto' => (float)$pago->monto,
                            'nro_transaccion' => $pago->nro_transaccion,
                            'motivo' => $motivo ?: 'Cancelación de cita: reembolso completo del saldo cobrado',
                        ],
                        $idUsuario
                    );

                    $pagosProcesados[] = [
                        'id_pago' => $pago->id_pago,
                        'tipo_pago' => 'saldo',
                        'estado_pago' => 'reembolsado',
                        'monto' => (float)$pago->monto,
                    ];
                } else {
                    // Depósito de garantía:
                    // Si la cita es postergada, se reembolsa SIEMPRE completo sin penalidad de 12h
                    // Si no es postergada, aplica la regla de 12 horas
                    $aplicaReembolso = $esPostergada || ($horasDiferencia >= $horasMinimas);

                    if ($aplicaReembolso) {
                        DB::table('pagos_cita')->where('id_pago', $pago->id_pago)->update([
                            'estado_pago' => 'reembolsado',
                            'fecha_reembolso' => now(),
                            'updated_at' => now(),
                        ]);

                        ServicioBitacora::registrar(
                            'CU27_GestionarPagosReembolsos',
                            $esPostergada ? 'REEMBOLSO_GARANTIA_POSTERGADA' : 'REEMBOLSO_RESERVA_RN15',
                            'pagos_cita',
                            (string)$pago->id_pago,
                            ['estado_pago' => $pago->estado_pago],
                            [
                                'id_cita' => $idCita,
                                'codigo_cita' => $cita->codigo_cita,
                                'estado_pago' => 'reembolsado',
                                'monto' => (float)$pago->monto,
                                'nro_transaccion' => $pago->nro_transaccion,
                                'horas_anticipacion' => $horasDiferencia,
                                'es_postergada' => $esPostergada,
                                'motivo' => $motivo ?: ($esPostergada ? 'Cancelación de cita postergada: devolución del 100% sin penalidad' : 'Cancelación anticipada con derecho a reembolso (RN15)'),
                            ],
                            $idUsuario
                        );

                        $pagosProcesados[] = [
                            'id_pago' => $pago->id_pago,
                            'tipo_pago' => 'garantia',
                            'estado_pago' => 'reembolsado',
                            'monto' => (float)$pago->monto,
                        ];
                    } else {
                        // Retención de garantía por cancelación tardía (< 12h)
                        DB::table('pagos_cita')->where('id_pago', $pago->id_pago)->update([
                            'estado_pago' => 'retenido',
                            'updated_at' => now(),
                        ]);

                        ServicioBitacora::registrar(
                            'CU27_GestionarPagosReembolsos',
                            'PENALIZACION_RETENCION_PAGO_RN15',
                            'pagos_cita',
                            (string)$pago->id_pago,
                            ['estado_pago' => $pago->estado_pago],
                            [
                                'id_cita' => $idCita,
                                'codigo_cita' => $cita->codigo_cita,
                                'estado_pago' => 'retenido',
                                'monto_retenido' => (float)$pago->monto,
                                'nro_transaccion' => $pago->nro_transaccion,
                                'horas_restantes' => $horasDiferencia,
                                'motivo' => $motivo ?: 'Penalización por cancelación tardía (< 12h, RN15)',
                            ],
                            $idUsuario
                        );

                        $pagosProcesados[] = [
                            'id_pago' => $pago->id_pago,
                            'tipo_pago' => 'garantia',
                            'estado_pago' => 'retenido',
                            'monto' => (float)$pago->monto,
                        ];
                    }
                }
            }

            return [
                'id_cita' => $idCita,
                'pagos_procesados' => $pagosProcesados,
                'es_postergada' => $esPostergada,
                'horas_anticipacion' => $horasDiferencia,
                'mensaje' => 'Evaluación financiera de cancelación y reembolsos procesada correctamente.',
            ];
        });
    }

    /**
     * Consulta el pago y reconstruye el comprobante asociado a una cita médica.
     * Soporta reconstrucción completa tanto de la garantía como del saldo pagado en recepción.
     */
    public function consultarPagoPorCita(int $idCita): ?array
    {
        $pagos = DB::table('pagos_cita')
            ->join('citas', 'pagos_cita.id_cita', '=', 'citas.id_cita')
            ->join('pacientes', 'citas.id_paciente', '=', 'pacientes.id_paciente')
            ->join('personas as per_paciente', 'pacientes.id_persona', '=', 'per_paciente.id_persona')
            ->join('medicos', 'citas.id_medico', '=', 'medicos.id_medico')
            ->join('personas as per_medico', 'medicos.id_persona', '=', 'per_medico.id_persona')
            ->join('especialidades', 'citas.id_especialidad', '=', 'especialidades.id_especialidad')
            ->where('pagos_cita.id_cita', $idCita)
            ->select(
                'pagos_cita.*',
                'citas.codigo_cita',
                'citas.fecha_cita',
                'citas.hora_inicio',
                'citas.hora_fin',
                'citas.precio_consulta',
                'especialidades.nombre as especialidad_nombre',
                'per_paciente.nombres as paciente_nombres',
                'per_paciente.apellidos as paciente_apellidos',
                'per_paciente.ci as paciente_ci',
                'per_medico.nombres as medico_nombres',
                'per_medico.apellidos as medico_apellidos'
            )
            ->orderBy('pagos_cita.id_pago', 'desc')
            ->get();

        if ($pagos->isEmpty()) {
            return null;
        }

        $pagoUltimo = $pagos->first();
        $pagoSaldo = $pagos->firstWhere('tipo_pago', 'saldo');
        $pagoGarantia = $pagos->firstWhere('tipo_pago', 'garantia') ?: $pagos->first();

        $detalles = is_string($pagoUltimo->detalles_pasarela)
            ? json_decode($pagoUltimo->detalles_pasarela, true)
            : $pagoUltimo->detalles_pasarela;

        $precioConsulta = (float)($pagoUltimo->precio_consulta ?? 100.00);
        $montoGarantia = (float)($pagoGarantia->monto ?? 50.00);
        $saldoCobrado = $pagoSaldo ? (float)$pagoSaldo->monto : 0.00;
        $montoRecibido = $pagoSaldo && $pagoSaldo->monto_recibido !== null ? (float)$pagoSaldo->monto_recibido : ($detalles['monto_recibido'] ?? null);
        $cambio = $montoRecibido !== null ? round(max(0, $montoRecibido - $saldoCobrado), 2) : 0.00;

        return [
            'id_pago' => $pagoUltimo->id_pago,
            'id_cita' => $pagoUltimo->id_cita,
            'codigo_cita' => $pagoUltimo->codigo_cita,
            'monto' => (float)$pagoUltimo->monto,
            'metodo_pago' => $pagoUltimo->metodo_pago,
            'nro_transaccion' => $pagoUltimo->nro_transaccion,
            'estado_pago' => $pagoUltimo->estado_pago,
            'tipo_pago' => $pagoUltimo->tipo_pago,
            'fecha_pago' => $pagoUltimo->fecha_pago,
            'fecha_reembolso' => $pagoUltimo->fecha_reembolso,
            'detalles_pasarela' => $detalles,
            'paciente' => [
                'nombres' => $pagoUltimo->paciente_nombres,
                'apellidos' => $pagoUltimo->paciente_apellidos,
                'ci' => $pagoUltimo->paciente_ci,
            ],
            'comprobante' => [
                'titulo' => $pagoSaldo ? 'Comprobante de Pago Total de Consulta' : 'Comprobante Digital de Garantía de Reserva',
                'institucion' => 'Clínica Médica Vida Salud',
                'nro_transaccion' => $pagoUltimo->nro_transaccion,
                'codigo_cita' => $pagoUltimo->codigo_cita,
                'paciente' => $pagoUltimo->paciente_apellidos . ', ' . $pagoUltimo->paciente_nombres,
                'medico' => 'Dr(a). ' . $pagoUltimo->medico_apellidos,
                'especialidad' => $pagoUltimo->especialidad_nombre,
                'fecha_turno' => $pagoUltimo->fecha_cita . ' ' . $pagoUltimo->hora_inicio,
                'precio_consulta' => $precioConsulta,
                'garantia_pagada' => $montoGarantia,
                'saldo_cobrado' => $saldoCobrado,
                'monto_recibido' => $montoRecibido,
                'cambio' => $cambio,
                'metodo_pago' => $pagoUltimo->metodo_pago,
                'estado' => strtoupper($pagoSaldo ? 'PAGADA COMPLETA' : $pagoUltimo->estado_pago),
            ],
        ];
    }

    /**
     * Procesa y registra en recepción el cobro del saldo pendiente de una cita médica.
     * Restringido a Recepcionista y Administrador, solo para el día de la cita (America/La_Paz),
     * en estado Programada o Confirmada, con saldo pendiente > 0 e impidiendo cobros duplicados.
     */
    public function procesarCobroSaldo(int $idCita, array $datosPago, $usuarioOperador = null): array
    {
        return DB::transaction(function () use ($idCita, $datosPago, $usuarioOperador) {
            // Verificar rol operador si está disponible en el contexto
            if (is_object($usuarioOperador)) {
                $rolUsuario = strtolower(trim($usuarioOperador->rol ?? ''));
                if (!in_array($rolUsuario, ['recepcionista', 'administrador'], true)) {
                    throw new \Exception("Solo el personal de recepción o administración puede realizar el cobro del saldo.", 403);
                }
            }

            $cita = DB::table('citas')
                ->join('especialidades', 'citas.id_especialidad', '=', 'especialidades.id_especialidad')
                ->join('estados_cita', 'citas.id_estado_cita', '=', 'estados_cita.id_estado_cita')
                ->join('pacientes', 'citas.id_paciente', '=', 'pacientes.id_paciente')
                ->join('personas as per_paciente', 'pacientes.id_persona', '=', 'per_paciente.id_persona')
                ->join('medicos', 'citas.id_medico', '=', 'medicos.id_medico')
                ->join('personas as per_medico', 'medicos.id_persona', '=', 'per_medico.id_persona')
                ->where('citas.id_cita', $idCita)
                ->lockForUpdate()
                ->select(
                    'citas.*',
                    'estados_cita.codigo as estado_codigo',
                    'estados_cita.nombre as estado_nombre',
                    'especialidades.nombre as especialidad_nombre',
                    'per_paciente.nombres as paciente_nombres',
                    'per_paciente.apellidos as paciente_apellidos',
                    'per_medico.nombres as medico_nombres',
                    'per_medico.apellidos as medico_apellidos'
                )
                ->first();

            if (!$cita) {
                throw new \Exception("La cita médica referenciada no existe.", 404);
            }

            // 1. Validar estado de la cita: Solo Programada o Confirmada
            $codigoEstado = strtolower($cita->estado_codigo ?? '');
            $esValidaEstado = in_array($codigoEstado, ['pendiente', 'programada', 'confirmada'], true) && $cita->estado !== 'cancelada';
            if (!$esValidaEstado) {
                throw new \Exception("Solo se puede cobrar el saldo de citas en estado Programada o Confirmada.", 422);
            }

            // 2. Validar fecha de la cita: Únicamente el mismo día de la cita médica (America/La_Paz)
            $hoyBolivia = Carbon::today('America/La_Paz')->format('Y-m-d');
            if ($cita->fecha_cita !== $hoyBolivia) {
                throw new \Exception("El cobro del saldo solo puede realizarse el mismo día de la cita médica.", 422);
            }

            // 3. Validar si ya existe un pago de saldo en estado pagado/completado
            $pagoSaldoExistente = DB::table('pagos_cita')
                ->where('id_cita', $idCita)
                ->where('tipo_pago', 'saldo')
                ->whereIn('estado_pago', ['completado', 'pagado'])
                ->first();

            if ($pagoSaldoExistente) {
                throw new \Exception("Ya existe un pago de saldo registrado para esta cita médica.", 422);
            }

            // 4. Obtener precio congelado de la cita (NO de la especialidad actual)
            $precioConsulta = isset($cita->precio_consulta) && (float)$cita->precio_consulta > 0
                ? (float)$cita->precio_consulta
                : 100.00;

            // Obtener pagos completados de la cita
            $pagos = DB::table('pagos_cita')
                ->where('id_cita', $idCita)
                ->where('estado_pago', 'completado')
                ->get();

            $montoPagado = (float)$pagos->sum('monto');
            if ($montoPagado <= 0 && (!empty($cita->id_pago) || !empty($cita->pago_confirmado))) {
                $montoPagado = 50.00;
            }

            // 5. Validar saldo pendiente > 0
            $saldoPendiente = round(max(0, $precioConsulta - $montoPagado), 2);
            if ($saldoPendiente <= 0) {
                throw new \Exception("La cita médica no tiene saldo pendiente por cobrar.", 422);
            }

            // Normalización de método de pago
            $metodo = strtolower(trim($datosPago['metodo_pago'] ?? 'efectivo'));
            if ($metodo === 'qr') $metodo = 'qr_transferencia';
            if ($metodo === 'tarjeta') $metodo = 'tarjeta_debito_credito';
            if (!in_array($metodo, ['efectivo', 'tarjeta_debito_credito', 'qr_transferencia'], true)) {
                $metodo = 'efectivo';
            }

            $montoRecibido = isset($datosPago['monto_recibido']) ? (float)$datosPago['monto_recibido'] : $saldoPendiente;
            $cambio = 0.00;

            if ($metodo === 'efectivo') {
                if ($montoRecibido < $saldoPendiente) {
                    throw new \Exception("El monto recibido no puede ser menor al saldo pendiente ({$saldoPendiente} Bs).", 422);
                }
                $cambio = round($montoRecibido - $saldoPendiente, 2);
            } else {
                $montoRecibido = null;
            }

            $nroTransaccion = 'TX-SALDO-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
            $ahora = now();
            $idUsuario = is_object($usuarioOperador) ? ($usuarioOperador->id_usuario ?? null) : $usuarioOperador;

            $detalles = [
                'tipo' => 'cobro_saldo_recepcion',
                'metodo' => $metodo,
                'precio_consulta' => $precioConsulta,
                'garantia_pagada' => $montoPagado,
                'saldo_cobrado' => $saldoPendiente,
                'monto_recibido' => $montoRecibido,
                'cambio' => $cambio,
                'operador' => is_object($usuarioOperador) ? ($usuarioOperador->nombre_usuario ?? $usuarioOperador->email ?? 'recepcion') : 'recepcion',
            ];

            $idPago = DB::table('pagos_cita')->insertGetId([
                'id_cita' => $idCita,
                'tipo_pago' => 'saldo',
                'monto' => $saldoPendiente,
                'monto_recibido' => $montoRecibido,
                'metodo_pago' => $metodo,
                'nro_transaccion' => $nroTransaccion,
                'estado_pago' => 'completado',
                'detalles_pasarela' => json_encode($detalles),
                'fecha_pago' => $ahora,
                'id_usuario_registro' => $idUsuario,
                'created_at' => $ahora,
                'updated_at' => $ahora,
            ], 'id_pago');

            DB::table('citas')->where('id_cita', $idCita)->update([
                'pago_confirmado' => true,
                'updated_at' => $ahora,
            ]);

            ServicioBitacora::registrar(
                'CU27_GestionarPagosReembolsos',
                'COBRO_SALDO_RECEPCION',
                'pagos_cita',
                (string)$idPago,
                null,
                [
                    'id_cita' => $idCita,
                    'codigo_cita' => $cita->codigo_cita,
                    'saldo_cobrado' => $saldoPendiente,
                    'metodo_pago' => $metodo,
                    'monto_recibido' => $montoRecibido,
                    'cambio' => $cambio,
                ],
                $idUsuario
            );

            return [
                'id_cita' => $idCita,
                'id_pago' => $idPago,
                'codigo_cita' => $cita->codigo_cita,
                'precioConsulta' => $precioConsulta,
                'precio_consulta' => $precioConsulta,
                'montoPagado' => $precioConsulta,
                'monto_pagado' => $precioConsulta,
                'saldoPendiente' => 0.00,
                'saldo_pendiente' => 0.00,
                'estadoCobro' => 'Pagada completa',
                'estado_cobro' => 'Pagada completa',
                'cambio' => $cambio,
                'nro_transaccion' => $nroTransaccion,
                'comprobante' => [
                    'titulo' => 'Comprobante de Pago Total de Consulta',
                    'institucion' => 'Clínica Médica Vida Salud',
                    'nro_transaccion' => $nroTransaccion,
                    'codigo_cita' => $cita->codigo_cita,
                    'paciente' => $cita->paciente_apellidos . ', ' . $cita->paciente_nombres,
                    'medico' => 'Dr(a). ' . $cita->medico_apellidos,
                    'especialidad' => $cita->especialidad_nombre,
                    'fecha_turno' => $cita->fecha_cita . ' ' . $cita->hora_inicio,
                    'precio_consulta' => $precioConsulta,
                    'garantia_pagada' => $montoPagado,
                    'saldo_cobrado' => $saldoPendiente,
                    'monto_recibido' => $montoRecibido,
                    'cambio' => $cambio,
                    'metodo_pago' => $metodo,
                    'estado' => 'PAGADA COMPLETA',
                ],
                'mensaje' => 'Cobro de saldo procesado exitosamente. La cita médica se encuentra pagada completa.',
            ];
        });
    }
}
