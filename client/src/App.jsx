import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './Header';
import Profile from './Profile';
import AuthForm from './AuthForm'; 
import Shop from './Shop'; 
import ProductDetails from './ProductDetails'; 
import Cart from './Cart'; // ✅ ІМПОРТУЄМО НАШУ НОВУ СТОРІНКУ КОШИКА

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  // 🛒 СТЕЙТ КОШИКА НА НАЙВИЩОМУ РІВНІ ДЛЯ СИНХРОНІЗАЦІЇ
  const [cartItems, setCartItems] = useState([]);

  // Функція для завантаження кошика з localStorage при старті
  const updateCartFromStorage = () => {
    const savedCart = localStorage.getItem('cart');
    setCartItems(savedCart ? JSON.parse(savedCart) : []);
  };

  useEffect(() => {
    updateCartFromStorage();
    // Слухаємо зміни в localStorage (наприклад, коли видаляють товари в Header.jsx)
    window.addEventListener('storage', updateCartFromStorage);
    return () => window.removeEventListener('storage', updateCartFromStorage);
  }, []);

  // 🔄 ФУНКЦІЯ ВИДАЛЕННЯ ТОВАРУ
  const removeFromCart = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setCartItems(updatedCart);
    window.dispatchEvent(new Event('storage')); // тригеримо оновлення для Header
  };

  // 🔄 ФУНКЦІЯ ЗМІНИ КІЛЬКОСТІ ТОВАРУ
  const updateQuantity = (id, newQuantity) => {
    const updatedCart = cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setCartItems(updatedCart);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            {/* Публічні сторінки (доступні без токена) */}
            <Route path="/login" element={<AuthForm mode="login" />} />
            <Route path="/register" element={<AuthForm mode="register" />} />
            
            {/* Захищені сторінки (доступні тільки після авторизації) */}
            <Route 
              path="/shop" 
              element={isAuthenticated ? <Shop /> : <Navigate to="/login" />} 
            />
            
            {/* Детальна сторінка товару */}
            <Route 
              path="/product/:id" 
              element={isAuthenticated ? <ProductDetails /> : <Navigate to="/login" />} 
            />

            {/* 🛒 НАШ НОВИЙ МАРШРУТ: Окрема розширена сторінка кошика */}
            <Route 
              path="/cart" 
              element={
                isAuthenticated ? (
                  <Cart 
                    cartItems={cartItems} 
                    removeFromCart={removeFromCart} 
                    updateQuantity={updateQuantity} 
                  />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />

            <Route 
              path="/profile" 
              element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
            />

            {/* Редирект з головної сторінки */}
            <Route path="/" element={<Navigate to={isAuthenticated ? "/shop" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;