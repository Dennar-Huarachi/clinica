<?php

use App\Http\Controllers\Paquetes\AccesoCuentas\CU02_CambiarContrasena\RecuperarContrasenaControlador;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// CU-02 Recuperación de contraseña por correo (soporte de ruta directa sin prefijo api)
Route::post('/acceso/recuperacion/solicitar', [RecuperarContrasenaControlador::class, 'solicitar'])->middleware('throttle:10,1');
Route::post('/acceso/recuperacion/verificar', [RecuperarContrasenaControlador::class, 'verificar'])->middleware('throttle:10,1');
Route::post('/acceso/recuperacion/restablecer', [RecuperarContrasenaControlador::class, 'restablecer'])->middleware('throttle:10,1');
