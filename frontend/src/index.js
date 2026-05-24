/**
 * Punto de entrada de la aplicacion React.
 * Monta el componente raiz App en el elemento #root del HTML.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
