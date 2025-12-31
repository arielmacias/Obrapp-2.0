import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ObraProvider } from './context/ObraContext';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ObraProvider>
        <App />
      </ObraProvider>
    </AuthProvider>
  </React.StrictMode>
);
