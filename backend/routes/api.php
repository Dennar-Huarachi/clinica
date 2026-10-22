<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

// Paquete 1: Acceso y Cuentas
use App\Http\Controllers\Paquetes\AccesoCuentas\CU01_IniciarCerrarSesion\IniciarCerrarSesionControlador;
use App\Http\Controllers\Paquetes\AccesoCuentas\CU02_CambiarContrasena\CambiarContrasenaControlador;
use App\Http\Controllers\Paquetes\AccesoCuentas\CU03_RegistrarsePaciente\RegistrarsePacienteControlador;
use App\Http\Controllers\Paquetes\AccesoCuentas\CU04_AdministrarUsuariosRoles\AdministrarUsuariosRolesControlador;
use App\Http\Controllers\Paquetes\AccesoCuentas\CU26_GenerarRestaurarCopiasSeguridad\GenerarRestaurarCopiasSeguridadControlador;

// Paquete 2: Pacientes y Perfil
use App\Http\Controllers\Paquetes\PacientesPerfil\CU05_GestionarPacientes\GestionarPacientesControlador;
use App\Http\Controllers\Paquetes\PacientesPerfil\CU06_GestionarMiPerfil\GestionarMiPerfilControlador;

// Paquete 3: Catálogos y Horarios
use App\Http\Controllers\Paquetes\CatalogosHorarios\CU07_GestionarEspecialidades\GestionarEspecialidadesControlador;
use App\Http\Controllers\Paquetes\CatalogosHorarios\CU08_GestionarMedicos\GestionarMedicosControlador;
use App\Http\Controllers\Paquetes\CatalogosHorarios\CU09_GestionarHorariosAtencion\GestionarHorariosAtencionControlador;
use App\Http\Controllers\Paquetes\CatalogosHorarios\CU10_ConsultarDisponibilidad\ConsultarDisponibilidadControlador;
use App\Http\Controllers\Paquetes\CatalogosHorarios\CU11_SuspenderHorarioGestionarCitasAfectadas\SuspenderHorarioControlador;

// Paquete 4: Citas y Notificaciones
use App\Http\Controllers\Paquetes\CitasNotificaciones\CU12_GestionarCitas\GestionarCitasControlador;
use App\Http\Controllers\Paquetes\CitasNotificaciones\CU13_RegistrarAsistenciaInasistenciaAtencion\RegistrarAsistenciaControlador;
use App\Http\Controllers\Paquetes\CitasNotificaciones\CU14_ConsultarAgendaCitas\ConsultarAgendaCitasControlador;
use App\Http\Controllers\Paquetes\CitasNotificaciones\CU15_ConsultarHistorialSeguimientoCitas\HistorialSeguimientoCitasControlador;
use App\Http\Controllers\Paquetes\CitasNotificaciones\CU16_EnviarNotificacionesRecordatorios\EnviarNotificacionesControlador;

// Paquete 5: Historia Clínica
use App\Http\Controllers\Paquetes\HistoriaClinica\CU17_ConsultarMisPacientes\ConsultarMisPacientesControlador;
use App\Http\Controllers\Paquetes\HistoriaClinica\CU18_RegistrarAtencionClinica\RegistrarAtencionClinicaControlador;
use App\Http\Controllers\Paquetes\HistoriaClinica\CU19_RegistrarResultadosLaboratorio\ResultadosLaboratorioControlador;
use App\Http\Controllers\Paquetes\HistoriaClinica\CU20_ConsultarHistorialClinico\ConsultarHistorialClinicoControlador;

// Paquete 6: Reportes y Auditoría
use App\Http\Controllers\Paquetes\Reportes\CU21_ConsultarReportesCitas\ReportesCitasControlador;
use App\Http\Controllers\Paquetes\Reportes\CU22_ConsultarReporteAsistenciaPacientes\ReporteAsistenciaControlador;
use App\Http\Controllers\Paquetes\Reportes\CU23_ExportarReportes\ExportarReportesControlador;
use App\Http\Controllers\Paquetes\Reportes\CU24_ConsultarBitacoraAuditoria\ConsultarBitacoraControlador;
use App\Http\Controllers\Paquetes\Reportes\CU25_VisualizarDashboardAdministrativo\DashboardAdministrativoControlador;

/*
|--------------------------------------------------------------------------
| Rutas Públicas (Sin autenticación requerida)
|--------------------------------------------------------------------------
*/
Route::get('/salud', function () {
    try {
        DB::select('SELECT 1');
        return response()->json([
            'estado' => 'ok',
            'base_datos' => 'conectada',
            'sistema' => 'Clínica Vida Salud API',
        ]);
    } catch (\Throwable $e) {
        report($e);
        return response()->json([
            'estado' => 'error',
            'base_datos' => 'sin conexion',
        ], 500);
    }
});

// CU01 & CU03
Route::post('/acceso/login', [IniciarCerrarSesionControlador::class, 'login']);
Route::post('/acceso/registro-paciente', [RegistrarsePacienteControlador::class, 'registrar']);

// Catálogos públicos de especialidades y médicos para reserva
Route::get('/catalogos/especialidades-publicas', [GestionarEspecialidadesControlador::class, 'index']);
Route::get('/catalogos/medicos-publicos', [GestionarMedicosControlador::class, 'index']);
Route::get('/catalogos/disponibilidad', [ConsultarDisponibilidadControlador::class, 'consultar']);


/*
|--------------------------------------------------------------------------
| Rutas Protegidas (Requieren token de sesión válido)
|--------------------------------------------------------------------------
*/
Route::middleware(['sesion.clinica'])->group(function () {

    // --- PAQUETE 1: AccesoCuentas ---
    Route::get('/acceso/verificar', [IniciarCerrarSesionControlador::class, 'verificar']);
    Route::post('/acceso/logout', [IniciarCerrarSesionControlador::class, 'logout']);
    Route::post('/acceso/cambiar-contrasena', [CambiarContrasenaControlador::class, 'cambiar']);

    // --- PAQUETE 2: PacientesPerfil ---
    Route::get('/perfil/mi-perfil', [GestionarMiPerfilControlador::class, 'show']);
    Route::put('/perfil/mi-perfil', [GestionarMiPerfilControlador::class, 'update']);

    // --- PAQUETE 4: CitasNotificaciones ---
    Route::get('/citas', [GestionarCitasControlador::class, 'index']);
    Route::post('/citas', [GestionarCitasControlador::class, 'store']);
    Route::put('/citas/{id}/reprogramar', [GestionarCitasControlador::class, 'reprogramar']);
    Route::put('/citas/{id}/cancelar', [GestionarCitasControlador::class, 'cancelar']);
    Route::get('/citas/agenda', [ConsultarAgendaCitasControlador::class, 'index']);
    Route::get('/citas/historial', [HistorialSeguimientoCitasControlador::class, 'index']);

    Route::get('/notificaciones', [EnviarNotificacionesControlador::class, 'index']);
    Route::put('/notificaciones/{id}/leida', [EnviarNotificacionesControlador::class, 'marcarLeida']);

    // Historia clínica para el propio paciente
    Route::get('/historia-clinica/pacientes/{idPaciente}', [ConsultarHistorialClinicoControlador::class, 'show']);

    /*
    |----------------------------------------------------------------------
    | Rutas de Recepción y Personal de Admisión (Admin + Recepcionista)
    |----------------------------------------------------------------------
    */
    Route::middleware(['rol:administrador,recepcionista'])->group(function () {
        // CU13
        Route::put('/citas/{id}/asistencia', [RegistrarAsistenciaControlador::class, 'registrar']);

        // CU05
        Route::get('/pacientes', [GestionarPacientesControlador::class, 'index']);
        Route::get('/pacientes/{id}', [GestionarPacientesControlador::class, 'show']);
        Route::post('/pacientes', [GestionarPacientesControlador::class, 'store']);
        Route::put('/pacientes/{id}', [GestionarPacientesControlador::class, 'update']);
        Route::patch('/pacientes/{id}/alternar-estado', [GestionarPacientesControlador::class, 'alternarEstado']);

        // CU16
        Route::post('/notificaciones/disparar-recordatorios', [EnviarNotificacionesControlador::class, 'dispararRecordatorios']);
    });

    /*
    |----------------------------------------------------------------------
    | Rutas de Médicos y Profesionales de Salud (Admin + Médico)
    |----------------------------------------------------------------------
    */
    Route::middleware(['rol:administrador,medico'])->group(function () {
        // CU17, CU18, CU19
        Route::get('/historia-clinica/mis-pacientes', [ConsultarMisPacientesControlador::class, 'index']);
        Route::post('/historia-clinica/atenciones', [RegistrarAtencionClinicaControlador::class, 'store']);
        Route::post('/historia-clinica/laboratorios', [ResultadosLaboratorioControlador::class, 'store']);
        Route::get('/historia-clinica/laboratorios', [ResultadosLaboratorioControlador::class, 'index']);
    });

    /*
    |----------------------------------------------------------------------
    | Rutas Exclusivas de Administración del Sistema (Admin)
    |----------------------------------------------------------------------
    */
    Route::middleware(['rol:administrador'])->group(function () {
        // CU04
        Route::get('/administracion/usuarios', [AdministrarUsuariosRolesControlador::class, 'index']);
        Route::get('/administracion/roles', [AdministrarUsuariosRolesControlador::class, 'roles']);
        Route::post('/administracion/usuarios', [AdministrarUsuariosRolesControlador::class, 'store']);
        Route::put('/administracion/usuarios/{id}', [AdministrarUsuariosRolesControlador::class, 'update']);
        Route::patch('/administracion/usuarios/{id}/alternar-estado', [AdministrarUsuariosRolesControlador::class, 'alternarEstado']);

        // CU07
        Route::post('/catalogos/especialidades', [GestionarEspecialidadesControlador::class, 'store']);
        Route::put('/catalogos/especialidades/{id}', [GestionarEspecialidadesControlador::class, 'update']);
        Route::patch('/catalogos/especialidades/{id}/alternar-estado', [GestionarEspecialidadesControlador::class, 'alternarEstado']);

        // CU08
        Route::post('/catalogos/medicos', [GestionarMedicosControlador::class, 'store']);
        Route::put('/catalogos/medicos/{id}', [GestionarMedicosControlador::class, 'update']);
        Route::patch('/catalogos/medicos/{id}/alternar-estado', [GestionarMedicosControlador::class, 'alternarEstado']);

        // CU09 & CU11
        Route::get('/catalogos/horarios', [GestionarHorariosAtencionControlador::class, 'index']);
        Route::post('/catalogos/horarios', [GestionarHorariosAtencionControlador::class, 'store']);
        Route::patch('/catalogos/horarios/{id}/alternar-estado', [GestionarHorariosAtencionControlador::class, 'alternarEstado']);

        Route::get('/catalogos/suspensiones', [SuspenderHorarioControlador::class, 'index']);
        Route::post('/catalogos/suspensiones', [SuspenderHorarioControlador::class, 'store']);

        // CU21, CU22, CU23, CU24, CU25, CU26
        Route::get('/reportes/citas', [ReportesCitasControlador::class, 'index']);
        Route::get('/reportes/asistencia', [ReporteAsistenciaControlador::class, 'index']);
        Route::get('/reportes/exportar', [ExportarReportesControlador::class, 'exportarCitas']);
        Route::get('/auditoria/bitacora', [ConsultarBitacoraControlador::class, 'index']);
        Route::get('/dashboard/metricas', [DashboardAdministrativoControlador::class, 'index']);

        Route::get('/administracion/backups', [GenerarRestaurarCopiasSeguridadControlador::class, 'index']);
        Route::post('/administracion/backups', [GenerarRestaurarCopiasSeguridadControlador::class, 'store']);
    });
});
