<?php

namespace App\Http\Controllers\Paquetes\AccesoCuentas\CU26_GenerarRestaurarCopiasSeguridad;

use App\Paquetes\AccesoCuentas\CU26_GenerarRestaurarCopiasSeguridad\GenerarRestaurarCopiasSeguridadServicio;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use App\Nucleo\Errores\RespuestaApi;

class GenerarRestaurarCopiasSeguridadControlador extends Controller
{
    public function __construct(
        protected GenerarRestaurarCopiasSeguridadServicio $servicio
    ) {}

    /**
     * Lista el historial cronológico de copias de seguridad de base de datos (CU-26).
     */
    public function index(): JsonResponse
    {
        return RespuestaApi::exito($this->servicio->listar());
    }

    /**
     * Genera un nuevo respaldo completo de la base de datos PostgreSQL.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $usuario = $request->attributes->get('usuario_autenticado');
            $resultado = $this->servicio->generar($usuario?->id_usuario);

            return RespuestaApi::exito(
                $resultado,
                'Copia de seguridad generada y almacenada satisfactoriamente.',
                201
            );
        } catch (\Throwable $e) {
            return RespuestaApi::error('Error al generar copia de seguridad: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Descarga física forzada del archivo SQL del respaldo.
     */
    public function descargar(int $id, Request $request): BinaryFileResponse|JsonResponse
    {
        try {
            $usuario = $request->attributes->get('usuario_autenticado');
            $archivo = $this->servicio->obtenerParaDescarga($id, $usuario?->id_usuario);

            $headers = [
                'Content-Type' => 'application/sql',
                'Content-Disposition' => 'attachment; filename="' . $archivo['nombre'] . '"',
                'Cache-Control' => 'no-cache, private',
            ];

            return response()->download($archivo['ruta'], $archivo['nombre'], $headers);
        } catch (\DomainException $e) {
            return RespuestaApi::error($e->getMessage(), 404);
        } catch (\Throwable $e) {
            return RespuestaApi::error('Error al procesar la descarga del respaldo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Ejecuta la restauración de la base de datos a partir de una copia previa.
     */
    public function restaurar(int $id, Request $request): JsonResponse
    {
        try {
            $usuario = $request->attributes->get('usuario_autenticado');
            $resultado = $this->servicio->restaurar($id, $usuario?->id_usuario);

            return RespuestaApi::exito(
                $resultado,
                'Base de datos restaurada exitosamente desde la copia de seguridad seleccionada.'
            );
        } catch (\DomainException $e) {
            return RespuestaApi::error($e->getMessage(), 422);
        } catch (\Throwable $e) {
            return RespuestaApi::error('Error al restaurar la copia de seguridad: ' . $e->getMessage(), 500);
        }
    }
}
