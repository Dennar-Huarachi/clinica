<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas de la API
|--------------------------------------------------------------------------
|
| Rutas de la API REST del sistema de gestión de citas médicas.
| Todas se sirven bajo el prefijo /api (definido en bootstrap/app.php).
|
*/

// Ruta de salud del sistema: verifica que la base de datos responda.
Route::get('/salud', function () {
    try {
        DB::select('select 1');

        return response()->json([
            'estado' => 'ok',
            'base_datos' => 'conectada',
        ]);
    } catch (\Throwable $e) {
        // No se muestran detalles internos del error al cliente.
        report($e);

        return response()->json([
            'estado' => 'error',
            'base_datos' => 'sin conexion',
        ], 500);
    }
});
