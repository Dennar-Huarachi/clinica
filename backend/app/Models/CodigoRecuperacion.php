<?php

// CU-02 Cambiar contraseña — Modelo — Recuperación por correo. Cubre: RF01 · Reglas: RN12, RN21

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo CodigoRecuperacion (Clínica Vida Salud)
 *
 * Administra las solicitudes y comprobantes de recuperación de contraseñas por correo.
 * Estilo de nomenclatura: tabla en plural snake_case (codigos_recuperacion) y columnas en snake_case.
 */
class CodigoRecuperacion extends Model
{
    /**
     * Nombre de la tabla asociada al modelo.
     *
     * @var string
     */
    protected $table = 'codigos_recuperacion';

    /**
     * Clave primaria personalizada de la tabla.
     *
     * @var string
     */
    protected $primaryKey = 'id_codigo_recuperacion';

    /**
     * Indica si el modelo debe gestionar timestamps automáticos (created_at / updated_at).
     * Se desactiva para mantener estricta adherencia al español en las columnas.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * Atributos asignables de forma masiva.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id_usuario',
        'codigo_cifrado',
        'comprobante_cifrado',
        'intentos_fallidos',
        'fecha_creacion',
        'fecha_expiracion',
        'fecha_verificacion',
        'fecha_expiracion_comprobante',
        'fecha_uso',
        'direccion_ip',
    ];

    /**
     * Conversión nativa de tipos de atributos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'id_codigo_recuperacion' => 'integer',
        'id_usuario' => 'integer',
        'intentos_fallidos' => 'integer',
        'fecha_creacion' => 'datetime',
        'fecha_expiracion' => 'datetime',
        'fecha_verificacion' => 'datetime',
        'fecha_expiracion_comprobante' => 'datetime',
        'fecha_uso' => 'datetime',
    ];
}
