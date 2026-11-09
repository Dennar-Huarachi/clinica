<?php

// CU-02 Cambiar contraseña — Migración — Recuperación por correo. Cubre: RF01 · Reglas: RN12, RN21

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ejecuta las migraciones.
     * Crea la tabla codigos_recuperacion siguiendo el patrón estándar del esquema:
     * nombre en plural y snake_case, clave primaria id_codigo_recuperacion y columnas en snake_case.
     */
    public function up(): void
    {
        if (!Schema::hasTable('codigos_recuperacion')) {
            Schema::create('codigos_recuperacion', function (Blueprint $table) {
                $table->id('id_codigo_recuperacion');
                $table->foreignId('id_usuario')
                    ->constrained('usuarios', 'id_usuario')
                    ->onUpdate('cascade')
                    ->onDelete('cascade');
                $table->string('codigo_cifrado', 255);
                $table->string('comprobante_cifrado', 255)->nullable();
                $table->integer('intentos_fallidos')->default(0);
                $table->timestamp('fecha_creacion');
                $table->timestamp('fecha_expiracion');
                $table->timestamp('fecha_verificacion')->nullable();
                $table->timestamp('fecha_expiracion_comprobante')->nullable();
                $table->timestamp('fecha_uso')->nullable();
                $table->string('direccion_ip', 45)->nullable();

                $table->index(['id_usuario', 'fecha_creacion']);
            });
        }
    }

    /**
     * Revierte las migraciones.
     */
    public function down(): void
    {
        Schema::dropIfExists('codigos_recuperacion');
    }
};
