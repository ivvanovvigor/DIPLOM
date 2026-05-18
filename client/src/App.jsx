import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './Header';
import Profile from './Profile';
import AuthForm from './AuthForm'; 
import Shop from './Shop'; 
import ProductDetails from './ProductDetails'; 
import Cart from './Cart'; // ✅ ІМПОРТУЄМО НАШУ НОВУ СТОРІНКУ КОШИКА
import Favorites from './Favorites'; // ✅ ІМПОРТУЄМО СТОРІНКУ ОБРАНОГО

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

  // 🔄 ФУНКЦІЯ ДОДАВАННЯ ТОВАРУ В КОШИК (ГЛОБАЛЬНА)
  const addToCart = (product) => {
    const savedCart = localStorage.getItem('cart');
    let currentCart = savedCart ? JSON.parse(savedCart) : [];

    // Шукаємо, чи є вже такий товар в кошику
    const existingIndex = currentCart.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
      // Якщо є — збільшуємо кількість на 1
      currentCart[existingIndex].quantity += 1;
    } else {
      // Якщо немає — додаємо новий об'єкт із початковою кількістю 1
      currentCart.push({
        id: product.id,
        title: product.title,
        price: Number(product.price),
        imageUrl: product.imageUrl,
        quantity: 1
      });
    }

    // Зберігаємо в localStorage та оновлюємо глобальний стейт
    localStorage.setItem('cart', JSON.stringify(currentCart));
    setCartItems(currentCart);
    
    // Тригеримо івент 'storage' для синхронізації з іншими компонентами (наприклад, Header)
    window.dispatchEvent(new Event('storage'));
  };

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
              element={isAuthenticated ? <Shop addToCart={addToCart} /> : <Navigate to="/login" />} 
            />
            
            {/* Детальна сторінка товару */}
            <Route 
              path="/product/:id" 
              element={isAuthenticated ? <ProductDetails addToCart={addToCart} /> : <Navigate to="/login" />} 
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

            {/* ❤️ СТОРІНКА ОБРАНИХ ТОВАРІВ (ЗАХИЩЕНА) */}
            <Route 
              path="/favorites" 
              element={
                isAuthenticated ? (
                  <Favorites addToCart={addToCart} />
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