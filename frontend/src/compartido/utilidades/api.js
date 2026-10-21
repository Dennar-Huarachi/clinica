import axios from 'axios';

// Instancia de axios para comunicarse con la API del backend (Laravel).
// La URL base se define en el archivo .env -> VITE_API_URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor de peticiones: si existe un token de sesión en el navegador,
// se agrega automáticamente el encabezado Authorization: Bearer <token>.
api.interceptors.request.use((configuracion) => {
  const token = localStorage.getItem('token_clinica');

  if (token) {
    configuracion.headers.Authorization = `Bearer ${token}`;
  }

  return configuracion;
});

export default api;
