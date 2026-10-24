<?php

namespace App\Http\Requests\Paquetes\CitasNotificaciones\CU27_GestionarPagosReembolsos;

use App\Nucleo\Validaciones\FormRequestPersonalizado;

class ProcesarPagoRequest extends FormRequestPersonalizado
{
    public function rules(): array
    {
        return [
            'id_cita' => 'required|integer|exists:citas,id_cita',
            'metodo_pago' => 'required|string|in:qr_transferencia,tarjeta_debito_credito,qr,tarjeta',
            'monto' => 'nullable|numeric|min:1',
            'referencia_simulada' => 'nullable|string|max:100',
            'detalles_pasarela' => 'nullable|array',
        ];
    }
}
