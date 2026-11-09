<?php

// CU-02 Cambiar contraseña — Servicio — Recuperación por correo. Cubre: RF01 · Reglas: RN12, RN21

namespace App\Paquetes\AccesoCuentas\CU02_CambiarContrasena;

use App\Nucleo\Bitacora\ServicioBitacora;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RecuperarContrasenaServicio
{
    public function __construct(
        protected RecuperarContrasenaRepositorio $repositorio
    ) {}

    /**
     * Obtiene el código de verificación configurado para la recuperación de cuentas.
     * Es el único punto del sistema de donde se obtiene el código, lo que permite sustituirlo
     * a futuro por un generador dinámico con envío real sin modificar la lógica del flujo.
     */
    public function obtenerCodigoDeVerificacion(): string
    {
        return (string) config('recuperacion.codigo', '482913');
    }

    /**
     * Paso 1: Registra la solicitud de recuperación y emite el código cifrado.
     * Responde siempre con estructura uniforme para prevenir enumeración de usuarios.
     *
     * @throws \Exception
     */
    public function solicitar(string $identificador, ?string $direccionIp = null): array
    {
        $identificadorLimpio = trim($identificador);
        $segundosEspera = (int) config('recuperacion.segundosEspera', 60);

        $usuario = $this->repositorio->buscarUsuarioActivoPorIdentificador($identificadorLimpio);
        $correoDestino = $this->obtenerCorreoUsuario($usuario);

        // Si el usuario no existe, está inactivo o no tiene correo electrónico válido registrado
        if (!$usuario || !$correoDestino) {
            return [
                'mensaje' => 'Si los datos corresponden a una cuenta activa con correo registrado, enviamos un código de verificación a su correo.',
                'segundosEspera' => $segundosEspera,
                'correoEnmascarado' => null,
            ];
        }

        // Control de frecuencia: mínimo 60 segundos entre solicitudes del mismo usuario
        $ultimoRegistro = $this->repositorio->obtenerUltimoRegistro($usuario->id_usuario);
        if ($ultimoRegistro && $ultimoRegistro->fecha_creacion) {
            $segundosTranscurridos = Carbon::parse($ultimoRegistro->fecha_creacion)->diffInSeconds(Carbon::now());
            if ($segundosTranscurridos < $segundosEspera) {
                $segundosRestantes = $segundosEspera - $segundosTranscurridos;
                throw new \Exception("Debe esperar {$segundosRestantes} segundos antes de solicitar un nuevo código de verificación.", 429);
            }
        }

        // Control de frecuencia: máximo de solicitudes permitidas por hora
        $maximoSolicitudesPorHora = (int) config('recuperacion.maximoSolicitudesPorHora', 5);
        $solicitudesUltimaHora = $this->repositorio->contarSolicitudesUltimaHora($usuario->id_usuario);
        if ($solicitudesUltimaHora >= $maximoSolicitudesPorHora) {
            throw new \Exception('Ha alcanzado el límite máximo de solicitudes permitidas por hora. Por favor intente más tarde.', 429);
        }

        // Invalidar códigos anteriores no utilizados
        $this->repositorio->invalidarCodigosAnterioresNoUsados($usuario->id_usuario);

        // Registrar nuevo código con cifrado estricto (nunca en texto plano)
        $codigo = $this->obtenerCodigoDeVerificacion();
        $vigenciaMinutos = (int) config('recuperacion.vigenciaMinutos', 10);
        $fechaActual = Carbon::now();

        $nuevoCodigo = $this->repositorio->crearCodigo([
            'id_usuario' => $usuario->id_usuario,
            'codigo_cifrado' => Hash::make($codigo),
            'comprobante_cifrado' => null,
            'intentos_fallidos' => 0,
            'fecha_creacion' => $fechaActual,
            'fecha_expiracion' => (clone $fechaActual)->addMinutes($vigenciaMinutos),
            'fecha_verificacion' => null,
            'fecha_expiracion_comprobante' => null,
            'fecha_uso' => null,
            'direccion_ip' => $direccionIp ? mb_substr($direccionIp, 0, 45) : null,
        ]);

        // Registrar evento en bitácora de auditoría (RN21)
        ServicioBitacora::registrar(
            'CU02_CambiarContrasena',
            'Solicitud de recuperación de contraseña',
            'codigos_recuperacion',
            (string) $nuevoCodigo->id_codigo_recuperacion,
            null,
            ['identificador' => $identificadorLimpio],
            $usuario->id_usuario
        );

        return [
            'mensaje' => 'Si los datos corresponden a una cuenta activa con correo registrado, enviamos un código de verificación a su correo.',
            'segundosEspera' => $segundosEspera,
            'correoEnmascarado' => $this->enmascararCorreo($correoDestino),
        ];
    }

    /**
     * Paso 2: Valida el código de 6 dígitos ingresado por la persona.
     * Genera y devuelve un comprobante de 64 caracteres si la verificación es exitosa.
     *
     * @throws \Exception
     */
    public function verificar(string $identificador, string $codigo): array
    {
        $identificadorLimpio = trim($identificador);
        $usuario = $this->repositorio->buscarUsuarioActivoPorIdentificador($identificadorLimpio);

        if (!$usuario) {
            throw new \Exception('El código de verificación ha expirado o no es válido. Por favor solicite uno nuevo.', 422);
        }

        $maximoIntentos = (int) config('recuperacion.maximoIntentos', 5);
        $registro = $this->repositorio->obtenerUltimoCodigoVigente($usuario->id_usuario, $maximoIntentos);

        if (!$registro) {
            throw new \Exception('El código de verificación ha expirado o no es válido. Por favor solicite uno nuevo.', 422);
        }

        // Verificación criptográfica del código suministrado
        if (!Hash::check((string) $codigo, $registro->codigo_cifrado)) {
            $registro->intentos_fallidos += 1;
            $intentosRestantes = $maximoIntentos - $registro->intentos_fallidos;

            if ($intentosRestantes <= 0) {
                $registro->fecha_expiracion = Carbon::now();
                $registro->save();

                ServicioBitacora::registrar(
                    'CU02_CambiarContrasena',
                    'Código de recuperación incorrecto',
                    'codigos_recuperacion',
                    (string) $registro->id_codigo_recuperacion,
                    null,
                    ['intentos_fallidos' => $registro->intentos_fallidos, 'motivo' => 'Máximo de intentos alcanzado'],
                    $usuario->id_usuario
                );

                throw new \Exception('Ha superado el número máximo de intentos permitidos. Debe solicitar un nuevo código de verificación.', 422);
            }

            $registro->save();

            ServicioBitacora::registrar(
                'CU02_CambiarContrasena',
                'Código de recuperación incorrecto',
                'codigos_recuperacion',
                (string) $registro->id_codigo_recuperacion,
                null,
                ['intentos_fallidos' => $registro->intentos_fallidos, 'intentos_restantes' => $intentosRestantes],
                $usuario->id_usuario
            );

            throw new \Exception("Código incorrecto. Le quedan {$intentosRestantes} intentos.", 422);
        }

        // Código correcto: generar comprobante criptográfico de 64 caracteres
        $comprobante = Str::random(64);
        $fechaActual = Carbon::now();

        $registro->comprobante_cifrado = Hash::make($comprobante);
        $registro->fecha_verificacion = $fechaActual;
        $registro->fecha_expiracion_comprobante = (clone $fechaActual)->addMinutes(10);
        $registro->save();

        ServicioBitacora::registrar(
            'CU02_CambiarContrasena',
            'Código de recuperación verificado',
            'codigos_recuperacion',
            (string) $registro->id_codigo_recuperacion,
            null,
            ['estado' => 'verificado'],
            $usuario->id_usuario
        );

        return [
            'mensaje' => 'Código de verificación confirmado exitosamente.',
            'comprobante' => $comprobante,
        ];
    }

    /**
     * Paso 3: Restablece definitivamente la contraseña con el comprobante validado.
     *
     * @throws \Exception
     */
    public function restablecer(string $identificador, string $comprobante, string $contrasena): void
    {
        $identificadorLimpio = trim($identificador);
        $usuario = $this->repositorio->buscarUsuarioActivoPorIdentificador($identificadorLimpio);

        if (!$usuario) {
            throw new \Exception('No se encontró una solicitud válida para los datos proporcionados.', 422);
        }

        $registro = $this->repositorio->obtenerRegistroVerificadoConComprobante($usuario->id_usuario);

        if (!$registro) {
            throw new \Exception('El comprobante de verificación ha expirado o no es válido. Por favor inicie el proceso nuevamente.', 422);
        }

        if (!Hash::check((string) $comprobante, $registro->comprobante_cifrado)) {
            throw new \Exception('El comprobante de verificación suministrado no es válido.', 422);
        }

        // Validación de no reutilización de la contraseña inmediatamente anterior
        if (Hash::check($contrasena, $usuario->contrasena_hash)) {
            throw new \Exception('La nueva contraseña no puede ser idéntica a la contraseña actual.', 422);
        }

        // Actualizar la contraseña del usuario en la base de datos
        $this->repositorio->actualizarContrasenaUsuario($usuario->id_usuario, Hash::make($contrasena));

        // Invalidar todos los códigos pendientes del usuario y marcar el actual como consumido
        $this->repositorio->invalidarTodosLosCodigos($usuario->id_usuario);
        $registro->fecha_uso = Carbon::now();
        $registro->save();

        // Registrar auditoría del cambio efectuado (RN21)
        ServicioBitacora::registrar(
            'CU02_CambiarContrasena',
            'Contraseña restablecida por correo',
            'usuarios',
            (string) $usuario->id_usuario,
            ['debe_cambiar_contrasena' => $usuario->debe_cambiar_contrasena],
            ['debe_cambiar_contrasena' => false],
            $usuario->id_usuario
        );
    }

    /**
     * Resuelve el correo electrónico asociado a la cuenta de usuario.
     */
    protected function obtenerCorreoUsuario(?object $usuario): ?string
    {
        if (!$usuario) {
            return null;
        }

        if (!empty($usuario->usuario_correo) && filter_var(trim($usuario->usuario_correo), FILTER_VALIDATE_EMAIL)) {
            return trim($usuario->usuario_correo);
        }

        if (!empty($usuario->persona_correo) && filter_var(trim($usuario->persona_correo), FILTER_VALIDATE_EMAIL)) {
            return trim($usuario->persona_correo);
        }

        return null;
    }

    /**
     * Enmascara parcialmente una dirección de correo electrónico para visualización segura (ej. ma****@gmail.com).
     */
    protected function enmascararCorreo(string $correo): string
    {
        $partes = explode('@', $correo);
        if (count($partes) !== 2) {
            return '****';
        }

        $usuario = $partes[0];
        $dominio = $partes[1];
        $longitud = mb_strlen($usuario);

        if ($longitud <= 2) {
            $visible = mb_substr($usuario, 0, 1);
        } else {
            $visible = mb_substr($usuario, 0, 2);
        }

        return $visible . '****@' . $dominio;
    }
}
