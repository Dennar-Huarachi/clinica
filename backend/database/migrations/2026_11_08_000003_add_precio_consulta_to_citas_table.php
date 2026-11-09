<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Agrega la columna precio_consulta a la tabla citas, congelando el precio
     * de la especialidad al momento de programar la consulta médica.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('citas', 'precio_consulta')) {
            Schema::table('citas', function (Blueprint $table) {
                $table->decimal('precio_consulta', 10, 2)->default(100.00)->after('id_especialidad');
            });

            // Rellenar las citas existentes con el precio de consulta de su respectiva especialidad
            DB::statement("
                UPDATE citas
                SET precio_consulta = COALESCE(especialidades.precio_consulta, 100.00)
                FROM especialidades
                WHERE citas.id_especialidad = especialidades.id_especialidad
            ");
        }
    }

    /**
     * Revierte la adición de la columna precio_consulta.
     */
    public function down(): void
    {
        if (Schema::hasColumn('citas', 'precio_consulta')) {
            Schema::table('citas', function (Blueprint $table) {
                $table->dropColumn('precio_consulta');
            });
        }
    }
};

