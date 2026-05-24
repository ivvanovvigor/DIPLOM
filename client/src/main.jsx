import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ToastProvider } from './ToastContext.jsx'; // Імпортуємо ваш створений контекст
import { AuthProvider as CustomAuthProvider } from './AuthContext.jsx'; // Наш новий провайдер
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CustomAuthProvider>
      <ToastProvider> {/* 👈 ПРОВАЙДЕР МАЄ ОГОРТАТИ ВЕСЬ ДОДАТОК */}
        <App />
      </ToastProvider>
    </CustomAuthProvider>
  </React.StrictMode>
);