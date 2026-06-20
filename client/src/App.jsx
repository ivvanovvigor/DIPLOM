import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './Header';
import Profile from './Profile';
import AuthForm from './AuthForm';
import Shop from './Shop';
import ProductDetails from './ProductDetails';
import Cart from './Cart';
import Favorites from './Favorites';
import PrivacyPolicy from './PrivacyPolicy';
import { ToastProvider, useToast } from './ToastContext';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

function AppContent() {
  const { showToast } = useToast();
  const [authTrigger, setAuthTrigger] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);

  // Динамічна перевірка токена
  const checkAuth = () => !!localStorage.getItem('token');

  // Оновлення кошика з сервера
  const fetchCartFromServer = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/cart`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data);
      }
    } catch (e) { console.error('Помилка кошика:', e); }
  }, []);

  // Оновлення обраного з сервера
  const fetchFavoritesFromServer = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/favorites`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) setFavoriteItems(await response.json());
    } catch (e) { console.error('Помилка обраного:', e); }
  }, []);

  useEffect(() => {
    if (checkAuth()) {
      fetchCartFromServer();
      fetchFavoritesFromServer();
    }
  }, [authTrigger, fetchCartFromServer, fetchFavoritesFromServer]);

  useEffect(() => {
    const handleAuthChange = () => {
      setAuthTrigger(prev => !prev);
    };

    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Функціонал кошика
  const addToCart = async (product) => {
    const token = localStorage.getItem('token');
    if (!token) { showToast("Увійдіть у систему", "error"); return; }
    try {
      const response = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 })
      });
      if (response.ok) { fetchCartFromServer(); showToast("Товар додано", "success"); }
    } catch (e) { console.error(e); }
  };

  const removeFromCart = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/cart/remove/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchCartFromServer();
    } catch (e) { console.error(e); }
  };

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity <= 0) { removeFromCart(id); return; }
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/cart/update`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, quantity: newQuantity })
      });
      fetchCartFromServer();
    } catch (e) { console.error(e); }
  };

  const toggleFavorite = async (product) => {
    const token = localStorage.getItem('token');
    if (!token) { showToast("Увійдіть у систему", "error"); return; }
    try {
      const response = await fetch(`${API_URL}/favorites/toggle`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id })
      });
      if (response.ok) fetchFavoritesFromServer();
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCartItems([]);
    setFavoriteItems([]);
    setAuthTrigger(prev => !prev);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header
          cartItems={cartItems}
          favoriteItems={favoriteItems}
          isAuthenticated={checkAuth()}
          removeFromCart={removeFromCart}
          onLogout={handleLogout}
        />
        <main>
          <Routes>
            <Route path="/shop" element={<Shop addToCart={addToCart} toggleFavorite={toggleFavorite} favoriteItems={favoriteItems} />} />
            <Route path="/product/:id" element={<ProductDetails addToCart={addToCart} toggleFavorite={toggleFavorite} favoriteItems={favoriteItems} />} />
            <Route path="/cart" element={checkAuth() ? <Cart cartItems={cartItems} removeFromCart={removeFromCart} updateQuantity={updateQuantity} /> : <Navigate to="/login" />} />
            <Route path="/favorites" element={checkAuth() ? <Favorites favoriteItems={favoriteItems} toggleFavorite={toggleFavorite} addToCart={addToCart} /> : <Navigate to="/login" />} />
            <Route path="/login" element={<AuthForm mode="login" onAuthSuccess={() => setAuthTrigger(!authTrigger)} />} />
            <Route path="/register" element={<AuthForm mode="register" onAuthSuccess={() => setAuthTrigger(!authTrigger)} />} />
            <Route path="/profile" element={checkAuth() ? <Profile onLogout={handleLogout} /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/shop" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default function App() {
  return <ToastProvider><AppContent /></ToastProvider>;
}