# Estructura Arquitectónica del Proyecto — Clínica "Vida Salud"

Este documento define la arquitectura oficial de software, organización de capas, paquetes, casos de uso y convenciones de código para la aplicación de la **Clínica "Vida Salud"** (Laravel 13, React 19, PostgreSQL 18).

---

## 1. Principio Arquitectónico

El proyecto combina la **organización por Paquetes y Casos de Uso (Package-by-Feature)** con las **capas nativas de Laravel** para garantizar un desacoplamiento limpio, alta cohesión y trazabilidad directa de los requisitos del sistema.

### Reglas de Ubicación de Código en el Backend

| Capa / Responsabilidad | Ruta en el Proyecto | Convención de Namespace |
| :--- | :--- | :--- |
| **Controladores HTTP** | `backend/app/Http/Controllers/Paquetes/<Paquete>/<CUxx>/` | `namespace App\Http\Controllers\Paquetes\<Paquete>\<CUxx>;` |
| **Validaciones FormRequest** | `backend/app/Http/Requests/Paquetes/<Paquete>/<CUxx>/` | `namespace App\Http\Requests\Paquetes\<Paquete>\<CUxx>;` |
| **Lógica de Negocio (Servicios)** | `backend/app/Paquetes/<Paquete>/<CUxx>/` | `namespace App\Paquetes\<Paquete>\<CUxx>;` |
| **Consultas Especializadas (Repositorios)** | `backend/app/Paquetes/<Paquete>/<CUxx>/` | `namespace App\Paquetes\<Paquete>\<CUxx>;` |
| **Modelos Eloquent** | `backend/app/Models/` | `namespace App\Models;` |
| **Componentes Transversales** | `backend/app/Nucleo/` | `namespace App\Nucleo\<Subcarpeta>;` |
| **Rutas API REST** | `backend/routes/api.php` | Rutas RESTful asociadas a controladores |

---

## 2. Estructura de Directorios del Backend

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Controller.php
│   │   │   └── Paquetes/
│   │   │       ├── AccesoCuentas/
│   │   │       │   ├── CU01_IniciarCerrarSesion/IniciarCerrarSesionControlador.php
│   │   │       │   ├── CU02_CambiarContrasena/CambiarContrasenaControlador.php # CU-02: Cambiar y recuperar contraseña
│   │   │       │   ├── CU03_RegistrarsePaciente/RegistrarsePacienteControlador.php
│   │   │       │   ├── CU04_AdministrarUsuariosRoles/AdministrarUsuariosRolesControlador.php
│   │   │       │   └── CU26_GenerarRestaurarCopiasSeguridad/GenerarRestaurarCopiasSeguridadControlador.php
│   │   │       ├── PacientesPerfil/
│   │   │       │   ├── CU05_GestionarPacientes/GestionarPacientesControlador.php
│   │   │       │   └── CU06_GestionarMiPerfil/GestionarMiPerfilControlador.php
│   │   │       ├── CatalogosHorarios/
│   │   │       │   ├── CU07_GestionarEspecialidades/GestionarEspecialidadesControlador.php
│   │   │       │   ├── CU08_GestionarMedicos/GestionarMedicosControlador.php
│   │   │       │   ├── CU09_GestionarHorariosAtencion/GestionarHorariosAtencionControlador.php
│   │   │       │   ├── CU10_ConsultarDisponibilidad/ConsultarDisponibilidadControlador.php
│   │   │       │   └── CU11_SuspenderHorarioGestionarCitasAfectadas/SuspenderHorarioControlador.php
│   │   │       ├── CitasNotificaciones/
│   │   │       │   ├── CU12_GestionarCitas/GestionarCitasControlador.php
│   │   │       │   ├── CU13_RegistrarAsistenciaInasistenciaAtencion/RegistrarAsistenciaControlador.php
│   │   │       │   ├── CU14_ConsultarAgendaCitas/ConsultarAgendaCitasControlador.php
│   │   │       │   ├── CU15_ConsultarHistorialSeguimientoCitas/HistorialSeguimientoCitasControlador.php
│   │   │       │   ├── CU16_EnviarNotificacionesRecordatorios/EnviarNotificacionesControlador.php
│   │   │       │   └── CU27_GestionarPagosReembolsos/GestionarPagosReembolsosControlador.php
│   │   │       ├── HistoriaClinica/
│   │   │       │   ├── CU17_ConsultarMisPacientes/ConsultarMisPacientesControlador.php
│   │   │       │   ├── CU18_RegistrarAtencionClinica/RegistrarAtencionClinicaControlador.php
│   │   │       │   ├── CU19_RegistrarResultadosLaboratorio/ResultadosLaboratorioControlador.php
│   │   │       │   └── CU20_ConsultarHistorialClinico/ConsultarHistorialClinicoControlador.php
│   │   │       └── Reportes/
│   │   │           ├── CU21_ConsultarReportesCitas/ReportesCitasControlador.php
│   │   │           ├── CU22_ConsultarReporteAsistenciaPacientes/ReporteAsistenciaControlador.php
│   │   │           ├── CU23_ExportarReportes/ExportarReportesControlador.php
│   │   │           ├── CU24_ConsultarBitacoraAuditoria/ConsultarBitacoraControlador.php
│   │   │           └── CU25_VisualizarDashboardAdministrativo/DashboardAdministrativoControlador.php
│   │   ├── Middleware/
│   │   │   └── CabecerasSeguridad.php
│   │   └── Requests/
│   │       └── Paquetes/
│   │           ├── AccesoCuentas/
│   │           │   ├── CU01_IniciarCerrarSesion/IniciarSesionRequest.php
│   │           │   ├── CU02_CambiarContrasena/CambiarContrasenaRequest.php
│   │           │   ├── CU03_RegistrarsePaciente/RegistrarsePacienteRequest.php
│   │           │   └── CU04_AdministrarUsuariosRoles/GuardarUsuarioRequest.php
│   │           ├── PacientesPerfil/
│   │           │   ├── CU05_GestionarPacientes/GuardarPacienteRequest.php
│   │           │   └── CU06_GestionarMiPerfil/ActualizarPerfilRequest.php
│   │           ├── CatalogosHorarios/
│   │           │   ├── CU07_GestionarEspecialidades/GuardarEspecialidadRequest.php
│   │           │   ├── CU08_GestionarMedicos/GuardarMedicoRequest.php
│   │           │   ├── CU09_GestionarHorariosAtencion/GuardarHorarioRequest.php
│   │           │   └── CU11_SuspenderHorarioGestionarCitasAfectadas/SuspenderHorarioRequest.php
│   │           ├── CitasNotificaciones/
│   │           │   ├── CU12_GestionarCitas/CrearCitaRequest.php
│   │           │   ├── CU12_GestionarCitas/ReprogramarCitaRequest.php
│   │           │   ├── CU13_RegistrarAsistenciaInasistenciaAtencion/RegistrarAsistenciaRequest.php
│   │           │   └── CU27_GestionarPagosReembolsos/ProcesarPagoRequest.php
│   │           └── HistoriaClinica/
│   │               ├── CU18_RegistrarAtencionClinica/RegistrarAtencionRequest.php
│   │               └── CU19_RegistrarResultadosLaboratorio/RegistrarLaboratorioRequest.php
│   ├── Paquetes/
│   │   ├── AccesoCuentas/
│   │   │   ├── CU01_IniciarCerrarSesion/IniciarCerrarSesionServicio.php
│   │   │   ├── CU02_CambiarContrasena/CambiarContrasenaServicio.php
│   │   │   ├── CU03_RegistrarsePaciente/RegistrarsePacienteServicio.php
│   │   │   ├── CU04_AdministrarUsuariosRoles/AdministrarUsuariosRolesServicio.php
│   │   │   └── CU26_GenerarRestaurarCopiasSeguridad/GenerarRestaurarCopiasSeguridadServicio.php
│   │   ├── PacientesPerfil/
│   │   │   ├── CU05_GestionarPacientes/GestionarPacientesServicio.php
│   │   │   └── CU06_GestionarMiPerfil/GestionarMiPerfilServicio.php
│   │   ├── CatalogosHorarios/
│   │   │   ├── CU07_GestionarEspecialidades/GestionarEspecialidadesServicio.php
│   │   │   ├── CU08_GestionarMedicos/GestionarMedicosServicio.php
│   │   │   ├── CU09_GestionarHorariosAtencion/GestionarHorariosAtencionServicio.php
│   │   │   ├── CU10_ConsultarDisponibilidad/ConsultarDisponibilidadServicio.php
│   │   │   └── CU11_SuspenderHorarioGestionarCitasAfectadas/SuspenderHorarioServicio.php
│   │   ├── CitasNotificaciones/
│   │   │   ├── CU12_GestionarCitas/GestionarCitasServicio.php
│   │   │   ├── CU13_RegistrarAsistenciaInasistenciaAtencion/RegistrarAsistenciaServicio.php
│   │   │   ├── CU14_ConsultarAgendaCitas/ConsultarAgendaCitasServicio.php
│   │   │   ├── CU15_ConsultarHistorialSeguimientoCitas/HistorialSeguimientoCitasServicio.php
│   │   │   ├── CU16_EnviarNotificacionesRecordatorios/EnviarNotificacionesServicio.php
│   │   │   └── CU27_GestionarPagosReembolsos/GestionarPagosReembolsosServicio.php
│   │   ├── HistoriaClinica/
│   │   │   ├── CU17_ConsultarMisPacientes/ConsultarMisPacientesServicio.php
│   │   │   ├── CU18_RegistrarAtencionClinica/RegistrarAtencionClinicaServicio.php
│   │   │   ├── CU19_RegistrarResultadosLaboratorio/ResultadosLaboratorioServicio.php
│   │   │   └── CU20_ConsultarHistorialClinico/ConsultarHistorialClinicoServicio.php
│   │   └── Reportes/
│   │       ├── CU21_ConsultarReportesCitas/ReportesCitasServicio.php
│   │       ├── CU22_ConsultarReporteAsistenciaPacientes/ReporteAsistenciaServicio.php
│   │       ├── CU23_ExportarReportes/ExportarReportesServicio.php
│   │       ├── CU24_ConsultarBitacoraAuditoria/ConsultarBitacoraServicio.php
│   │       └── CU25_VisualizarDashboardAdministrativo/DashboardAdministrativoServicio.php
│   ├── Models/
│   │   └── (Modelos Eloquent del dominio médico)
│   └── Nucleo/
│       ├── Bitacora/ServicioBitacora.php
│       ├── Errores/RespuestaApi.php
│       ├── Permisos/MiddlewareVerificarRol.php
│       ├── Sesion/ManejadorSesion.php
│       └── Validaciones/FormRequestPersonalizado.php (Sanitización anti-XSS recursiva)
└── routes/
    └── api.php
```

---

## 3. Estructura de Directorios del Frontend

El frontend en React 19 sigue la misma correspondencia por Paquetes y Casos de Uso:

```
frontend/src/
├── Paquetes/
│   ├── AccesoCuentas/
│   │   ├── CU01_IniciarCerrarSesion/
│   │   │   ├── IniciarSesion.jsx
│   │   │   ├── SelectorPerfilLogin.jsx
│   │   │   └── PaginaLogin.jsx
│   │   ├── CU02_CambiarContrasena/ # CU-02: Cambiar y recuperar contraseña
│   │   ├── CU03_RegistrarsePaciente/
│   │   │   └── PaginaRegistroPaciente.jsx
│   │   ├── CU04_AdministrarUsuariosRoles/
│   │   │   └── PaginaUsuariosRoles.jsx
│   │   └── CU26_GenerarRestaurarCopiasSeguridad/
│   ├── PacientesPerfil/
│   │   ├── CU05_GestionarPacientes/PaginaGestionPacientes.jsx
│   │   └── CU06_GestionarMiPerfil/PaginaMiPerfil.jsx
│   ├── CatalogosHorarios/
│   │   ├── CU07_GestionarEspecialidades/PaginaEspecialidades.jsx
│   │   ├── CU08_GestionarMedicos/PaginaMedicos.jsx
│   │   ├── CU09_GestionarHorariosAtencion/
│   │   ├── CU10_ConsultarDisponibilidad/
│   │   └── CU11_SuspenderHorarioGestionarCitasAfectadas/
│   ├── CitasNotificaciones/
│   │   ├── CU12_GestionarCitas/PaginaReservaCitas.jsx
│   │   ├── CU13_RegistrarAsistenciaInasistenciaAtencion/
│   │   ├── CU14_ConsultarAgendaCitas/PaginaAgendaCitas.jsx
│   │   ├── CU15_ConsultarHistorialSeguimientoCitas/PaginaHistorialCitas.jsx
│   │   ├── CU16_EnviarNotificacionesRecordatorios/
│   │   └── CU27_GestionarPagosReembolsos/
│   │       ├── ModalPasarelaPagoSimulada.jsx
│   │       ├── ComprobanteDigitalTransaccion.jsx
│   │       └── InsigniaEstadoPago.jsx
│   ├── HistoriaClinica/
│   │   ├── CU17_ConsultarMisPacientes/
│   │   ├── CU18_RegistrarAtencionClinica/FormularioAtencionClinica.jsx
│   │   ├── CU19_RegistrarResultadosLaboratorio/
│   │   └── CU20_ConsultarHistorialClinico/PaginaHistorialClinico.jsx
│   └── Reportes/
│       ├── CU21_ConsultarReportesCitas/PaginaReportes.jsx
│       ├── CU22_ConsultarReporteAsistenciaPacientes/
│       ├── CU23_ExportarReportes/
│       ├── CU24_ConsultarBitacoraAuditoria/PaginaBitacora.jsx
│       └── CU25_VisualizarDashboardAdministrativo/PaginaDashboard.jsx
├── comun/
│   └── componentes/
│       └── RutaProtegidaPorRol.jsx
├── compartido/
│   ├── componentes/
│   │   ├── Alerta.jsx
│   │   ├── CampoSelect.jsx
│   │   ├── CampoTexto.jsx
│   │   └── InsigniaEstado.jsx
│   ├── estilos/
│   │   ├── base.css
│   │   └── variables.css
│   ├── layouts/
│   │   └── LayoutPrincipal.jsx
│   └── utilidades/
│       └── api.js (Interceptor Axios global para códigos 401 y 403)
├── publico/
│   └── PaginaInicio.jsx
└── App.jsx
```

---

## 4. Reglas Obligatorias de Integridad y Desarrollo

1. **Inmutabilidad y Preservación de Datos Médicos (RN01, RN15):**
   - Queda terminantemente prohibido ejecutar `DELETE` físico en pacientes, médicos, citas, consultas o historiales clínicos.
   - Toda eliminación se gestiona como baja lógica (`estado = 'inactivo'`, `estado = 'cancelada'`).
2. **Concurrencia Atómica en Citas (CU12):**
   - Las reservas y reprogramaciones de citas se ejecutan dentro de `DB::transaction(...)` utilizando bloqueo pesimista `lockForUpdate()` para prevenir solapamiento de horarios con el mismo médico.
3. **Auditoría Obligatoria (RN21, CU24):**
   - Todo inicio de sesión, cambio de estado de cita, modificación de historial clínico o acción sensible debe registrarse mediante `ServicioBitacora`.
4. **Respuesta Estándar de la API:**
   - Todas las respuestas deben canalizarse a través de `App\Nucleo\Errores\RespuestaApi::exito()` y `RespuestaApi::error()`.
