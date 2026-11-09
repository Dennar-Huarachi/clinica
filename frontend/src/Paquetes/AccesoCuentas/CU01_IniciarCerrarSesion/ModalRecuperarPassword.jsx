// CU-02 Cambiar contraseña — Modal de recuperación de contraseña por correo — Recuperación por correo

import ModalRecuperarContrasena from '../CU02_CambiarContrasena/ModalRecuperarContrasena';

/**
 * ModalRecuperarPassword
 * Adaptador de compatibilidad para el acceso al modal de recuperación desde CU-01.
 * Conecta directamente con la implementación completa de CU-02.
 */
export default function ModalRecuperarPassword(props) {
  return <ModalRecuperarContrasena {...props} />;
}
