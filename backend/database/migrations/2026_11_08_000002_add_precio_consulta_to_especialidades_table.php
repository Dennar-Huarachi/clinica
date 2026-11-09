<?php

// CU-07 Gestionar especialidades — Migración — Precio de consulta médica

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ejecuta las migraciones.
     */
    public function up(): void
    {
        if (Schema::hasTable('especialidades') && !Schema::hasColumn('especialidades', 'precio_consulta')) {
            Schema::table('especialidades', function (Blueprint $table) {
                $table->decimal('precio_consulta', 10, 2)->default(100.00)->after('duracion_turno_minutos');
            });
        }
    }

    /**
     * Revierte las migraciones.
     */
    public function down(): void
    {
        if (Schema::hasTable('especialidades') && Schema::hasColumn('especialidades', 'precio_consulta')) {
            Schema::table('especialidades', function (Blueprint $table) {
                $table->dropColumn('precio_consulta');
            });
        }
    }
};

