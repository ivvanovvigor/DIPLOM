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

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [cartItems, setCartItems] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);

  // ХМАРНЕ ЗАВАНТАЖЕННЯ КОШИКА
  const fetchCartFromServer = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/cart`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data);
      }
    } catch (error) {
      console.error('Помилка завантаження хмарного кошика:', error);
    }
  }, []);

  // ХМАРНЕ ЗАВАНТАЖЕННЯ ОБРАНОГО
  const fetchFavoritesFromServer = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/favorites`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFavoriteItems(data);
      }
    } catch (error) {
      console.error('Помилка завантаження хмарного обраного:', error);
    }
  }, []);

  // Синхронізація даних при зміні статусу авторизації
  useEffect(() => {
    if (isAuthenticated) {
      fetchCartFromServer();
      fetchFavoritesFromServer();
    } else {
      setCartItems([]);
      setFavoriteItems([]);
    }
  }, [isAuthenticated, fetchCartFromServer, fetchFavoritesFromServer]);

  // Синхронізація стану авторизації (для поточної вкладки та сусідніх вкладок)
  useEffect(() => {
    const syncAuth = () => {
      const tokenExists = !!localStorage.getItem('token');
      setIsAuthenticated(tokenExists);
    };

    // Слухач для міжвкладкового сховища (інші вкладки)
    window.addEventListener('storage', (e) => {
      if (e.key === 'token' || !e.key) syncAuth();
    });

    // Слухач для швидкої синхронізації в межах поточної вкладки
    window.addEventListener('authChange', syncAuth);

    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('authChange', syncAuth);
    };
  }, []);

  // ХМАРНЕ ДОДАВАННЯ В КОШИК
  const addToCart = async (product) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId: product.id, quantity: 1 })
      });

      if (response.ok) {
        fetchCartFromServer();
      }
    } catch (error) {
      console.error('Помилка додавання в хмарний кошик:', error);
    }
  };

  // ХМАРНЕ ВИДАЛЕННЯ З КОШИКА
  const removeFromCart = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/cart/remove/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchCartFromServer();
      }
    } catch (error) {
      console.error('Помилка видалення з хмарного кошика:', error);
    }
  };

  // ХМАРНА ЗМІНА КІЛЬКОСТІ ТОВАРУ
  const updateQuantity = async (id, newQuantity) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cart/update`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: id, quantity: newQuantity })
      });

      if (response.ok) {
        fetchCartFromServer();
      }
    } catch (error) {
      console.error('Помилка оновлення кількості в хмарі:', error);
    }
  };

  // ХМАРНИЙ ТOГЛ ОБРАНОГО
  const toggleFavorite = async (product) => {
    const token = localStorage.getItem('token');

    // Перевірка авторизації
    if (!token) {
      showToast("Ця функція доступна лише для авторизованих користувачів. Будь ласка, увійдіть або зареєструйтеся.", "error");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/favorites/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId: product.id })
      });

      if (response.ok) {
        fetchFavoritesFromServer();
      }
    } catch (error) {
      console.error('Помилка зміни статусу обраного в хмарі:', error);
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Функція для чистого виходу з системи
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    window.dispatchEvent(new Event('authChange'));
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header cartItems={cartItems} favoriteItems={favoriteItems} isAuthenticated={isAuthenticated} onLogout={handleLogout} />

        <main>
          <Routes>
            {/* Публічні роути для гостей */}
            <Route path="/login" element={!isAuthenticated ? <AuthForm mode="login" /> : <Navigate to="/shop" />} />
            <Route path="/register" element={!isAuthenticated ? <AuthForm mode="register" /> : <Navigate to="/shop" />} />

            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

            {/* Захищені приватні роути */}
            <Route
              path="/shop"
              element={<Shop addToCart={addToCart} toggleFavorite={toggleFavorite} favoriteItems={favoriteItems} />}
            />

            <Route
              path="/product/:id"
              element={isAuthenticated ? <ProductDetails addToCart={addToCart} toggleFavorite={toggleFavorite} favoriteItems={favoriteItems} /> : <Navigate to="/login" />}
            />

            <Route
              path="/cart"
              element={
                isAuthenticated ? (
                  <Cart
                    cartItems={cartItems}
                    removeFromCart={removeFromCart}
                    updateQuantity={updateQuantity}
                    clearCart={clearCart}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/favorites"
              element={
                isAuthenticated ? (
                  <Favorites
                    favoriteItems={favoriteItems}
                    toggleFavorite={toggleFavorite}
                    addToCart={addToCart}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/profile"
              element={isAuthenticated ? <Profile onLogout={handleLogout} /> : <Navigate to="/login" />}
            />

            {/* Розумний редирект з кореню */}
            <Route path="/" element={<Navigate to="/shop" replace />} />

            {/* Страховка від неіснуючих роутів (404) */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;