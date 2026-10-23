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
        return $this->obtenerRolesConConteo();
    }

    public function obtenerRolesConConteo(): array
    {
        return DB::table('roles')
            ->leftJoin('rol_permiso', 'roles.id_rol', '=', 'rol_permiso.id_rol')
            ->select(
                'roles.id_rol',
                'roles.nombre',
                'roles.descripcion',
                DB::raw('COUNT(rol_permiso.id_permiso) as permisos_count')
            )
            ->groupBy('roles.id_rol', 'roles.nombre', 'roles.descripcion')
            ->orderBy('roles.id_rol')
            ->get()
            ->map(function ($rol) {
                $rol->permisos_count = (int)$rol->permisos_count;
                return $rol;
            })
            ->toArray();
    }

    public function crearRol(array $datos): int
    {
        $nombre = trim($datos['nombre'] ?? '');
        if (empty($nombre)) {
            throw new \Exception('El nombre del rol es obligatorio.', 422);
        }

        $existe = DB::table('roles')->where('nombre', $nombre)->exists();
        if ($existe) {
            throw new \Exception("Ya existe un rol con el nombre '{$nombre}'.", 422);
        }

        $idRol = DB::table('roles')->insertGetId([
            'nombre' => $nombre,
            'descripcion' => $datos['descripcion'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ], 'id_rol');

        ServicioBitacora::registrar(
            'CU04_AdministrarUsuariosRoles',
            'CREAR_ROL',
            'roles',
            (string)$idRol,
            null,
            ['nombre' => $nombre, 'descripcion' => $datos['descripcion'] ?? null]
        );

        return $idRol;
    }

    public function obtenerPermisosRol(int $idRol): array
    {
        $rol = DB::table('roles')->where('id_rol', $idRol)->first();
        if (!$rol) {
            throw new \Exception('El rol solicitado no existe.', 404);
        }

        $asignados = DB::table('rol_permiso')
            ->where('id_rol', $idRol)
            ->pluck('id_permiso')
            ->toArray();

        $asignadosSet = array_flip($asignados);

        $permisos = DB::table('permisos')
            ->orderBy('modulo')
            ->orderBy('id_permiso')
            ->get();

        $modulos = [];
        foreach ($permisos as $p) {
            $item = [
                'id_permiso' => $p->id_permiso,
                'modulo' => $p->modulo,
                'nombre' => $p->nombre,
                'slug' => $p->slug,
                'descripcion' => $p->descripcion,
                'asignado' => isset($asignadosSet[$p->id_permiso]),
            ];

            $modulos[$p->modulo][] = $item;
        }

        return [
            'rol' => $rol,
            'permisos_asignados_count' => count($asignados),
            'modulos' => $modulos,
        ];
    }

    public function sincronizarPermisosRol(int $idRol, array $permisosIds): void
    {
        $rol = DB::table('roles')->where('id_rol', $idRol)->first();
        if (!$rol) {
            throw new \Exception('El rol solicitado no existe.', 404);
        }

        DB::transaction(function () use ($idRol, $rol, $permisosIds) {
            $anteriores = DB::table('rol_permiso')
                ->where('id_rol', $idRol)
                ->pluck('id_permiso')
                ->toArray();

            DB::table('rol_permiso')->where('id_rol', $idRol)->delete();

            $insertar = [];
            foreach ($permisosIds as $idPermiso) {
                $insertar[] = [
                    'id_rol' => $idRol,
                    'id_permiso' => (int)$idPermiso,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            if (!empty($insertar)) {
                DB::table('rol_permiso')->insert($insertar);
            }

            ServicioBitacora::registrar(
                'CU04_AdministrarUsuariosRoles',
                'SINCRONIZAR_PERMISOS_ROL',
                'rol_permiso',
                (string)$idRol,
                ['rol' => $rol->nombre, 'permisos' => $anteriores],
                ['rol' => $rol->nombre, 'permisos' => $permisosIds]
            );
        });
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
