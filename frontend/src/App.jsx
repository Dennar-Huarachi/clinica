import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import PaginaInicio from './publico/PaginaInicio';
import IniciarSesion from './Paquetes/AccesoCuentas/CU01_IniciarCerrarSesion/IniciarSesion';
import LoginPaciente from './Paquetes/AccesoCuentas/CU01_IniciarCerrarSesion/LoginPaciente';
import LoginPersonal from './Paquetes/AccesoCuentas/CU01_IniciarCerrarSesion/LoginPersonal';
import PaginaCambiarContrasena from './Paquetes/AccesoCuentas/CU02_CambiarContrasena/PaginaCambiarContrasena';
import PaginaRegistroPaciente from './Paquetes/AccesoCuentas/CU03_RegistrarsePaciente/PaginaRegistroPaciente';
import PaginaUsuariosRoles from './Paquetes/AccesoCuentas/CU04_AdministrarUsuariosRoles/PaginaUsuariosRoles';

import PaginaGestionPacientes from './Paquetes/PacientesPerfil/CU05_GestionarPacientes/PaginaGestionPacientes';
import PaginaMiPerfil from './Paquetes/PacientesPerfil/CU06_GestionarMiPerfil/PaginaMiPerfil';

import PaginaEspecialidades from './Paquetes/CatalogosHorarios/CU07_GestionarEspecialidades/PaginaEspecialidades';
import PaginaMedicos from './Paquetes/CatalogosHorarios/CU08_GestionarMedicos/PaginaMedicos';
import PaginaHorarios from './Paquetes/CatalogosHorarios/CU09_GestionarHorariosAtencion/PaginaHorarios';

import PaginaReservaCitas from './Paquetes/CitasNotificaciones/CU12_GestionarCitas/PaginaReservaCitas';
import PaginaAgendaCitas from './Paquetes/CitasNotificaciones/CU14_ConsultarAgendaCitas/PaginaAgendaCitas';
import PaginaHistorialCitas from './Paquetes/CitasNotificaciones/CU15_ConsultarHistorialSeguimientoCitas/PaginaHistorialCitas';

import FormularioAtencionClinica from './Paquetes/HistoriaClinica/CU18_RegistrarAtencionClinica/FormularioAtencionClinica';
import PaginaHistorialClinico from './Paquetes/HistoriaClinica/CU20_ConsultarHistorialClinico/PaginaHistorialClinico';

import PaginaReportes from './Paquetes/Reportes/CU21_ConsultarReportesCitas/PaginaReportes';
import PaginaBitacora from './Paquetes/Reportes/CU24_ConsultarBitacoraAuditoria/PaginaBitacora';
import PaginaDashboard from './Paquetes/Reportes/CU25_VisualizarDashboardAdministrativo/PaginaDashboard';

function PaginaNoEncontrada() {
  return (
    <main style={{ padding: '3rem 2rem', maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
      <h1 className="titulo">
        <b>Página</b> <span>no encontrada (404)</span>
      </h1>
      <p style={{ marginTop: '1rem', color: 'var(--texto-sec)' }}>
        La ruta solicitada no existe o no se encuentra disponible.
      </p>
      <div style={{ marginTop: '1.5rem' }}>
        <Link to="/" className="boton-primario">
          Volver al Inicio
        </Link>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas y de Autenticación Divididas (CU01) */}
        <Route path="/" element={<PaginaInicio />} />
        <Route path="/login" element={<IniciarSesion />} />
        <Route path="/login/paciente" element={<LoginPaciente />} />
        <Route path="/login/personal" element={<LoginPersonal />} />
        <Route path="/iniciar-sesion" element={<IniciarSesion />} />
        <Route path="/registro-paciente" element={<PaginaRegistroPaciente />} />

        {/* Rutas Canónicas y de Navegación por Rol */}
        {/* Paciente */}
        <Route path="/paciente/mis-citas" element={<PaginaHistorialCitas />} />
        <Route path="/paciente/reservar" element={<PaginaReservaCitas />} />
        <Route path="/paciente/historial" element={<PaginaHistorialClinico />} />
        <Route path="/paciente/perfil" element={<PaginaMiPerfil />} />

        {/* Médico */}
        <Route path="/medico/agenda" element={<PaginaAgendaCitas />} />
        <Route path="/medico/pacientes" element={<PaginaGestionPacientes />} />
        <Route path="/medico/atenciones" element={<PaginaHistorialClinico />} />
        <Route path="/medico/laboratorio" element={<PaginaHistorialClinico />} />

        {/* Recepcionista */}
        <Route path="/recepcion/citas" element={<PaginaAgendaCitas />} />
        <Route path="/recepcion/agendar" element={<PaginaReservaCitas />} />
        <Route path="/recepcion/pacientes" element={<PaginaGestionPacientes />} />
        <Route path="/recepcion/suspensiones" element={<PaginaEspecialidades />} />
        <Route path="/recepcion/reportes" element={<PaginaReportes />} />

        {/* Administrador */}
        <Route path="/admin/dashboard" element={<PaginaDashboard />} />
        <Route path="/admin/especialidades" element={<PaginaEspecialidades />} />
        <Route path="/admin/medicos" element={<PaginaMedicos />} />
        <Route path="/admin/horarios" element={<PaginaHorarios />} />
        <Route path="/admin/citas" element={<PaginaAgendaCitas />} />
        <Route path="/admin/pacientes" element={<PaginaGestionPacientes />} />
        <Route path="/admin/usuarios" element={<PaginaUsuariosRoles />} />
        <Route path="/admin/bitacora" element={<PaginaBitacora />} />
        <Route path="/admin/respaldos" element={<PaginaDashboard />} />
        <Route path="/admin/reportes" element={<PaginaReportes />} />

        {/* Rutas Generales de Módulos */}
        <Route path="/dashboard" element={<PaginaDashboard />} />
        <Route path="/perfil" element={<PaginaMiPerfil />} />
        <Route path="/cuenta/cambiar-contrasena" element={<PaginaCambiarContrasena />} />

        {/* Citas y Agenda */}
        <Route path="/citas/reserva" element={<PaginaReservaCitas />} />
        <Route path="/citas/agenda" element={<PaginaAgendaCitas />} />
        <Route path="/citas/historial" element={<PaginaHistorialCitas />} />

        {/* Pacientes e Historias */}
        <Route path="/pacientes" element={<PaginaGestionPacientes />} />
        <Route path="/historia-clinica" element={<PaginaGestionPacientes />} />
        <Route path="/historia-clinica/:idPaciente" element={<PaginaHistorialClinico />} />
        <Route path="/historia-clinica/atencion/:idCita" element={<FormularioAtencionClinica />} />

        {/* Catálogos */}
        <Route path="/medicos" element={<PaginaMedicos />} />
        <Route path="/especialidades" element={<PaginaEspecialidades />} />

        {/* Administración y Reportes */}
        <Route path="/usuarios" element={<PaginaUsuariosRoles />} />
        <Route path="/reportes" element={<PaginaReportes />} />
        <Route path="/auditoria" element={<PaginaBitacora />} />

        {/* 404 */}
        <Route path="*" element={<PaginaNoEncontrada />} />
      </Routes>
    </BrowserRouter>
  );
}
