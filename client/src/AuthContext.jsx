import React, { createContext, useState, useContext, useEffect } from 'react';

// Створюємо сам контекст
const AuthContext = createContext(null);

// Провайдер, який обгортатиме весь додаток
export const AuthProvider = ({ children }) => {
  // Ініціалізуємо стейт значеннями з localStorage (виконується ОДИН раз при старті додатка)
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Функція для авторизації (входу/реєстрації)
  const login = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
  };

  // Функція для виходу з акаунту
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    localStorage.removeItem('favorites');
    setToken(null);
    setUser(null);
    // Робимо м'який редірект на логін через useNavigate в самих компонентах,
    // більше ніяких жорстких перезавантажень сторінки!
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Зручний кастомний хук для використання в компонентах
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth має використовуватися всередині AuthProvider');
  }
  return context;
};