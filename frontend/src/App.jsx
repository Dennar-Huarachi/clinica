import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import PaginaInicio from './publico/PaginaInicio';

// Página simple para rutas que no existen.
function PaginaNoEncontrada() {
  return (
    <main style={{ padding: '2rem', maxWidth: '640px', margin: '0 auto' }}>
      <h1 className="titulo">
        <b>Página</b> <span>no encontrada</span>
      </h1>
      <p style={{ marginTop: '1rem' }}>
        La dirección que buscas no existe.{' '}
        <Link to="/">Volver al inicio</Link>
      </p>
    </main>
  );
}

// Rutas principales de la aplicación.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PaginaInicio />} />
        <Route path="*" element={<PaginaNoEncontrada />} />
      </Routes>
    </BrowserRouter>
  );
}
