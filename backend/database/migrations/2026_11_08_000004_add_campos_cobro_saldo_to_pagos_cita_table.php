<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Agrega columnas para persistencia de cobro de saldo en recepción
     * e índice único parcial para evitar dobles pagos de saldo.
     */
    public function up(): void
    {
        Schema::table('pagos_cita', function (Blueprint $table) {
            if (!Schema::hasColumn('pagos_cita', 'tipo_pago')) {
                $table->string('tipo_pago', 20)->default('garantia')->after('id_cita'); // garantia, saldo
            }
            if (!Schema::hasColumn('pagos_cita', 'monto_recibido')) {
                $table->decimal('monto_recibido', 10, 2)->nullable()->after('monto');
            }
            if (!Schema::hasColumn('pagos_cita', 'id_usuario_registro')) {
                $table->foreignId('id_usuario_registro')
                    ->nullable()
                    ->after('fecha_reembolso')
                    ->constrained('usuarios', 'id_usuario')
                    ->onUpdate('cascade')
                    ->onDelete('set null');
            }
        });

        // Asegurar que los pagos preexistentes tengan tipo 'garantia'
        DB::table('pagos_cita')->whereNull('tipo_pago')->orWhere('tipo_pago', '')->update([
            'tipo_pago' => 'garantia',
        ]);

        // Índice único parcial en PostgreSQL para impedir más de un pago de tipo 'saldo' completado para la misma cita
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("
                CREATE UNIQUE INDEX IF NOT EXISTS uq_pagos_saldo_pagado
                ON pagos_cita (id_cita)
                WHERE (tipo_pago = 'saldo' AND estado_pago IN ('completado', 'pagado'))
            ");
        }
    }

    /**
     * Revierte las modificaciones agregadas a pagos_cita.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("DROP INDEX IF EXISTS uq_pagos_saldo_pagado");
        }

        Schema::table('pagos_cita', function (Blueprint $table) {
            if (Schema::hasColumn('pagos_cita', 'id_usuario_registro')) {
                $table->dropForeign(['id_usuario_registro']);
                $table->dropColumn('id_usuario_registro');
            }
            if (Schema::hasColumn('pagos_cita', 'monto_recibido')) {
                $table->dropColumn('monto_recibido');
            }
            if (Schema::hasColumn('pagos_cita', 'tipo_pago')) {
                $table->dropColumn('tipo_pago');
            }
        });
    }
};

