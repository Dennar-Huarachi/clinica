<?php

namespace App\Http\Requests\Paquetes\AccesoCuentas\CU04_AdministrarUsuariosRoles;

use App\Nucleo\Validaciones\FormRequestPersonalizado;

class GuardarUsuarioRequest extends FormRequestPersonalizado
{
    public function rules(): array
    {
        $idUsuario = $this->route('id');

        return [
            'ci' => 'required|string|max:20',
            'nombres' => 'required|string|max:80',
            'apellidos' => 'required|string|max:80',
            'correo' => 'required|email|max:100',
            'telefono' => 'nullable|string|max:20',
            'id_rol' => 'required|integer|exists:roles,id_rol',
            'nombre_usuario' => 'required|string|max:50|unique:usuarios,nombre_usuario,' . $idUsuario . ',id_usuario',
            'contrasena' => $idUsuario ? 'nullable|string|min:6' : 'required|string|min:6',
            'estado' => 'nullable|string|in:activo,inactivo,bloqueado',
        ];
    }
}
