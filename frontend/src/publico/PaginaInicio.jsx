import { useEffect, useState } from 'react';
import api from '../compartido/utilidades/api';

// Página pública provisional de bienvenida.
export default function PaginaInicio() {
  const [conexion, setConexion] = useState('probando');

  // Al montar la página, consultamos la ruta de salud del backend.
  useEffect(() => {
    api
      .get('/salud')
      .then(() => setConexion('correcta'))
      .catch(() => setConexion('sin respuesta'));
  }, []);

  return (
    <main style={{ padding: '2rem', maxWidth: '640px', margin: '0 auto' }}>
      <h1 className="titulo">
        <b>Clínica</b> <span>Vida Salud</span>
      </h1>

      <p className="tarjeta" style={{ padding: '1rem', marginTop: '1.5rem' }}>
        Conexión con el backend:{' '}
        {conexion === 'probando' ? 'verificando…' : conexion}
      </p>
    </main>
  );
}
