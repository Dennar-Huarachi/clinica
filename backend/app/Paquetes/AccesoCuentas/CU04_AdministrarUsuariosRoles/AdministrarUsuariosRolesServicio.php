<?php

namespace App\Paquetes\AccesoCuentas\CU04_AdministrarUsuariosRoles;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Nucleo\Bitacora\ServicioBitacora;

class AdministrarUsuariosRolesServicio
{
    public function listar(?string $termino = null, ?string $rol = null): array
    {
        $query = DB::table('usuarios')
            ->join('roles', 'usuarios.id_rol', '=', 'roles.id_rol')
            ->join('personas', 'usuarios.id_persona', '=', 'personas.id_persona')
            ->select(
                'usuarios.id_usuario',
                'usuarios.nombre_usuario',
                'usuarios.correo',
                'usuarios.estado',
                'usuarios.ultimo_acceso',
                'usuarios.id_rol',
                'roles.nombre as rol',
                'personas.id_persona',
                'personas.nombres',
                'personas.apellidos',
                'personas.ci',
                'personas.telefono'
            )
            ->orderBy('usuarios.id_usuario', 'desc');

        if ($termino) {
            $query->where(function ($q) use ($termino) {
                $q->where('usuarios.nombre_usuario', 'ilike', "%{$termino}%")
                  ->orWhere('personas.nombres', 'ilike', "%{$termino}%")
                  ->orWhere('personas.apellidos', 'ilike', "%{$termino}%")
                  ->orWhere('personas.ci', 'ilike', "%{$termino}%");
            });
        }

        if ($rol) {
            $query->where('roles.nombre', $rol);
        }

        return $query->get()->toArray();
    }

    public function obtenerRoles(): array
    {
        return DB::table('roles')->orderBy('id_rol')->get()->toArray();
    }

    public function crear(array $datos): int
    {
        return DB::transaction(function () use ($datos) {
            $idPersona = DB::table('personas')->insertGetId([
                'ci' => $datos['ci'],
                'nombres' => $datos['nombres'],
                'apellidos' => $datos['apellidos'],
                'telefono' => $datos['telefono'] ?? null,
                'correo' => $datos['correo'],
                'created_at' => now(),
                'updated_at' => now(),
            ], 'id_persona');

            $idUsuario = DB::table('usuarios')->insertGetId([
                'id_persona' => $idPersona,
                'id_rol' => $datos['id_rol'],
                'nombre_usuario' => $datos['nombre_usuario'],
                'correo' => $datos['correo'],
                'contrasena_hash' => Hash::make($datos['contrasena']),
                'debe_cambiar_contrasena' => true,
                'estado' => $datos['estado'] ?? 'activo',
                'created_at' => now(),
                'updated_at' => now(),
            ], 'id_usuario');

            ServicioBitacora::registrar(
                'CU04_AdministrarUsuariosRoles',
                'CREAR_USUARIO',
                'usuarios',
                (string)$idUsuario,
                null,
                ['nombre_usuario' => $datos['nombre_usuario'], 'id_rol' => $datos['id_rol']]
            );

            return $idUsuario;
        });
    }

    public function actualizar(int $idUsuario, array $datos): void
    {
        DB::transaction(function () use ($idUsuario, $datos) {
            $usuario = DB::table('usuarios')->where('id_usuario', $idUsuario)->first();
            if (!$usuario) {
                throw new \Exception('Usuario no encontrado', 404);
            }

            // Actualizar persona
            DB::table('personas')->where('id_persona', $usuario->id_persona)->update([
                'ci' => $datos['ci'],
                'nombres' => $datos['nombres'],
                'apellidos' => $datos['apellidos'],
                'telefono' => $datos['telefono'] ?? null,
                'correo' => $datos['correo'],
                'updated_at' => now(),
            ]);

            // Actualizar usuario
            $updateUsuario = [
                'id_rol' => $datos['id_rol'],
                'nombre_usuario' => $datos['nombre_usuario'],
                'correo' => $datos['correo'],
                'estado' => $datos['estado'] ?? $usuario->estado,
                'updated_at' => now(),
            ];

            if (!empty($datos['contrasena'])) {
                $updateUsuario['contrasena_hash'] = Hash::make($datos['contrasena']);
            }

            DB::table('usuarios')->where('id_usuario', $idUsuario)->update($updateUsuario);

            ServicioBitacora::registrar(
                'CU04_AdministrarUsuariosRoles',
                'ACTUALIZAR_USUARIO',
                'usuarios',
                (string)$idUsuario,
                ['id_rol' => $usuario->id_rol, 'estado' => $usuario->estado],
                $updateUsuario
            );
        });
    }

    public function alternarEstado(int $idUsuario): string
    {
        $usuario = DB::table('usuarios')->where('id_usuario', $idUsuario)->first();
        if (!$usuario) {
            throw new \Exception('Usuario no encontrado', 404);
        }

        $nuevoEstado = $usuario->estado === 'activo' ? 'inactivo' : 'activo';

        DB::table('usuarios')->where('id_usuario', $idUsuario)->update([
            'estado' => $nuevoEstado,
            'updated_at' => now(),
        ]);

        ServicioBitacora::registrar(
            'CU04_AdministrarUsuariosRoles',
            'CAMBIAR_ESTADO_USUARIO',
            'usuarios',
            (string)$idUsuario,
            ['estado' => $usuario->estado],
            ['estado' => $nuevoEstado]
        );

        return $nuevoEstado;
    }
}
