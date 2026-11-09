<?php

// CU-02 Cambiar contraseña — Repositorio — Recuperación por correo. Cubre: RF01 · Reglas: RN12, RN21

namespace App\Paquetes\AccesoCuentas\CU02_CambiarContrasena;

use App\Models\CodigoRecuperacion;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class RecuperarContrasenaRepositorio
{
    /**
     * Busca un usuario activo por su correo electrónico o su cédula de identidad (CI).
     * Soporta cualquier rol dentro del sistema de salud.
     */
    public function buscarUsuarioActivoPorIdentificador(string $identificador): ?object
    {
        $identificadorLimpio = trim($identificador);

        return DB::table('usuarios')
            ->join('personas', 'usuarios.id_persona', '=', 'personas.id_persona')
            ->join('roles', 'usuarios.id_rol', '=', 'roles.id_rol')
            ->where('usuarios.estado', 'activo')
            ->where(function ($query) use ($identificadorLimpio) {
                $query->whereRaw('LOWER(usuarios.correo) = ?', [mb_strtolower($identificadorLimpio)])
                      ->orWhereRaw('LOWER(personas.correo) = ?', [mb_strtolower($identificadorLimpio)])
                      ->orWhere('personas.ci', $identificadorLimpio);
            })
            ->select(
                'usuarios.id_usuario',
                'usuarios.id_persona',
                'usuarios.id_rol',
                'usuarios.nombre_usuario',
                'usuarios.correo as usuario_correo',
                'usuarios.contrasena_hash',
                'usuarios.debe_cambiar_contrasena',
                'usuarios.estado',
                'roles.nombre as rol_nombre',
                'personas.nombres',
                'personas.apellidos',
                'personas.ci',
                'personas.correo as persona_correo'
            )
            ->first();
    }

    /**
     * Obtiene el último registro de código creado para un usuario.
     */
    public function obtenerUltimoRegistro(int $idUsuario): ?CodigoRecuperacion
    {
        return CodigoRecuperacion::where('id_usuario', $idUsuario)
            ->orderBy('fecha_creacion', 'desc')
            ->first();
    }

    /**
     * Cuenta la cantidad de solicitudes realizadas por un usuario en la última hora.
     */
    public function contarSolicitudesUltimaHora(int $idUsuario): int
    {
        return CodigoRecuperacion::where('id_usuario', $idUsuario)
            ->where('fecha_creacion', '>=', Carbon::now()->subHour())
            ->count();
    }

    /**
     * Invalida los códigos anteriores que no hayan sido utilizados marcando su fecha de expiración al instante actual.
     */
    public function invalidarCodigosAnterioresNoUsados(int $idUsuario): void
    {
        CodigoRecuperacion::where('id_usuario', $idUsuario)
            ->whereNull('fecha_uso')
            ->where('fecha_expiracion', '>', Carbon::now())
            ->update([
                'fecha_expiracion' => Carbon::now(),
            ]);
    }

    /**
     * Crea un nuevo registro en la tabla codigos_recuperacion.
     */
    public function crearCodigo(array $datos): CodigoRecuperacion
    {
        return CodigoRecuperacion::create($datos);
    }

    /**
     * Obtiene el último código vigente (no usado, no verificado, no expirado y con intentos disponibles).
     */
    public function obtenerUltimoCodigoVigente(int $idUsuario, int $maximoIntentos): ?CodigoRecuperacion
    {
        return CodigoRecuperacion::where('id_usuario', $idUsuario)
            ->whereNull('fecha_uso')
            ->whereNull('fecha_verificacion')
            ->where('fecha_expiracion', '>', Carbon::now())
            ->where('intentos_fallidos', '<', $maximoIntentos)
            ->orderBy('fecha_creacion', 'desc')
            ->first();
    }

    /**
     * Obtiene el registro verificado con comprobante activo y vigente para restablecimiento.
     */
    public function obtenerRegistroVerificadoConComprobante(int $idUsuario): ?CodigoRecuperacion
    {
        return CodigoRecuperacion::where('id_usuario', $idUsuario)
            ->whereNull('fecha_uso')
            ->whereNotNull('fecha_verificacion')
            ->whereNotNull('comprobante_cifrado')
            ->where('fecha_expiracion_comprobante', '>', Carbon::now())
            ->orderBy('fecha_verificacion', 'desc')
            ->first();
    }

    /**
     * Invalida todos los códigos y comprobantes no usados de un usuario.
     */
    public function invalidarTodosLosCodigos(int $idUsuario): void
    {
        CodigoRecuperacion::where('id_usuario', $idUsuario)
            ->whereNull('fecha_uso')
            ->update([
                'fecha_expiracion' => Carbon::now(),
                'fecha_expiracion_comprobante' => Carbon::now(),
            ]);
    }

    /**
     * Actualiza la contraseña del usuario en la base de datos e invalida sus sesiones activas.
     */
    public function actualizarContrasenaUsuario(int $idUsuario, string $nuevaContrasenaHash): void
    {
        DB::table('usuarios')->where('id_usuario', $idUsuario)->update([
            'contrasena_hash' => $nuevaContrasenaHash,
            'debe_cambiar_contrasena' => false,
            'token_sesion' => null,
            'updated_at' => Carbon::now(),
        ]);
    }
}
