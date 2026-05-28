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
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [cartItems, setCartItems] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);

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
    if (isAuthenticated) {
      fetchCartFromServer();
      fetchFavoritesFromServer();
    }
  }, [isAuthenticated, fetchCartFromServer, fetchFavoritesFromServer]);

  // Дії з кошиком
  const addToCart = async (product) => {
    const token = localStorage.getItem('token');
    if (!token) { showToast("Увійдіть у систему", "error"); return; }
    try {
      const response = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 })
      });
      if (response.ok) fetchCartFromServer();
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

  // ФУНКЦІЯ ОЧИЩЕННЯ: Оновлює UI одразу після замовлення
  const clearCart = () => {
    setCartItems([]);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setCartItems([]);
    setFavoriteItems([]);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header cartItems={cartItems} favoriteItems={favoriteItems} isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <main>
          <Routes>
            <Route path="/shop" element={<Shop addToCart={addToCart} />} />
            <Route path="/cart" element={isAuthenticated ? 
              <Cart cartItems={cartItems} removeFromCart={removeFromCart} updateQuantity={updateQuantity} clearCart={clearCart} /> 
              : <Navigate to="/login" />} 
            />
            <Route path="/login" element={<AuthForm mode="login" onAuthSuccess={() => setIsAuthenticated(true)} />} />
            <Route path="/profile" element={isAuthenticated ? <Profile onLogout={handleLogout} /> : <Navigate to="/login" />} />
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