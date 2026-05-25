import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ToastProvider } from './ToastContext.jsx'; // Імпортуємо створений контекст
import { AuthProvider as CustomAuthProvider } from './AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CustomAuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </CustomAuthProvider>
  </React.StrictMode>
);