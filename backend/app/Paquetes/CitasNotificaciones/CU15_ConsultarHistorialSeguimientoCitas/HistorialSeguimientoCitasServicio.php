<?php

namespace App\Paquetes\CitasNotificaciones\CU15_ConsultarHistorialSeguimientoCitas;

use Illuminate\Support\Facades\DB;

class HistorialSeguimientoCitasServicio
{
    public function consultarHistorial(?int $idPaciente = null, ?string $codigoCita = null): array
    {
        $query = DB::table('citas')
            ->join('pacientes', 'citas.id_paciente', '=', 'pacientes.id_paciente')
            ->join('personas as per_paciente', 'pacientes.id_persona', '=', 'per_paciente.id_persona')
            ->join('medicos', 'citas.id_medico', '=', 'medicos.id_medico')
            ->join('personas as per_medico', 'medicos.id_persona', '=', 'per_medico.id_persona')
            ->join('especialidades', 'citas.id_especialidad', '=', 'especialidades.id_especialidad')
            ->join('estados_cita', 'citas.id_estado_cita', '=', 'estados_cita.id_estado_cita')
            ->leftJoin('atenciones_clinicas', 'citas.id_cita', '=', 'atenciones_clinicas.id_cita')
            ->leftJoin('pagos_cita', 'citas.id_cita', '=', 'pagos_cita.id_cita')
            ->select(
                'citas.*',
                'per_paciente.ci as paciente_ci',
                'per_paciente.nombres as paciente_nombres',
                'per_paciente.apellidos as paciente_apellidos',
                'pacientes.codigo_historia',
                'per_medico.nombres as medico_nombres',
                'per_medico.apellidos as medico_apellidos',
                'especialidades.nombre as especialidad_nombre',
                'citas.precio_consulta as precio_consulta',
                'estados_cita.codigo as estado_codigo',
                'estados_cita.nombre as estado_nombre',
                'atenciones_clinicas.id_atencion',
                'atenciones_clinicas.diagnostico',
                'pagos_cita.monto as pago_monto',
                'pagos_cita.metodo_pago',
                'pagos_cita.nro_transaccion',
                'pagos_cita.estado_pago',
                'pagos_cita.fecha_pago',
                'pagos_cita.fecha_reembolso'
            )
            ->orderBy('citas.fecha_cita', 'desc')
            ->orderBy('citas.hora_inicio', 'desc');

        if ($idPaciente) {
            $query->where('citas.id_paciente', $idPaciente);
        }

        if ($codigoCita) {
            $query->where('citas.codigo_cita', 'ilike', "%{$codigoCita}%");
        }

        return $query->get()->map(function ($c) {
            $fila = (array)$c;
            $precio = isset($fila['precio_consulta']) && (float)$fila['precio_consulta'] > 0
                ? (float)$fila['precio_consulta']
                : 100.00;

            $pagos = DB::table('pagos_cita')->where('id_cita', $fila['id_cita'])->get();
            $montoPagado = (float)$pagos->where('estado_pago', 'completado')->sum('monto');
            $tieneReembolso = $pagos->contains('estado_pago', 'reembolsado');

            if ($montoPagado <= 0 && (!empty($fila['pago_monto']) || !empty($fila['pago_confirmado']))) {
                $montoPagado = !empty($fila['pago_monto']) ? (float)$fila['pago_monto'] : 50.00;
            }

            $saldoPendiente = round(max(0, $precio - $montoPagado), 2);

            if ($tieneReembolso) {
                $estadoCobro = 'Reembolsado';
            } elseif ($saldoPendiente <= 0) {
                $estadoCobro = 'Pagada completa';
            } else {
                $estadoCobro = 'Saldo pendiente';
            }

            $fila['precioConsulta'] = $precio;
            $fila['precio_consulta'] = $precio;
            $fila['montoPagado'] = $montoPagado;
            $fila['monto_pagado'] = $montoPagado;
            $fila['saldoPendiente'] = $saldoPendiente;
            $fila['saldo_pendiente'] = $saldoPendiente;
            $fila['estadoCobro'] = $estadoCobro;
            $fila['estado_cobro'] = $estadoCobro;

            return (object)$fila;
        })->toArray();
    }
}
