import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './Header';
import Profile from './Profile';
import AuthForm from './AuthForm';
import Shop from './Shop';
import ProductDetails from './ProductDetails';
import Cart from './Cart';
import Favorites from './Favorites';

const API_URL = '${import.meta.env.VITE_API_URL}/api';

function App() {
  // 🔐 Робимо статус авторизації реактивним стейтом
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [cartItems, setCartItems] = useState([]);
  // ❤️ Додаємо реактивний стейт для обраних товарів
  const [favoriteItems, setFavoriteItems] = useState([]);

  // 📥 1. ХМАРНЕ ЗАВАНТАЖЕННЯ: Функція отримання кошика з бази даних сервера
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

  // ❤️ 2. ХМАРНЕ ЗАВАНТАЖЕННЯ ОБРАНОГО: Функція отримання списку обраного з сервера
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
        setFavoriteItems(data); // Записуємо масив чистих продуктів, отриманих від бекенду
      }
    } catch (error) {
      console.error('Помилка завантаження хмарного обраного:', error);
    }
  }, []);

  // Синхронізація кошика, обраного та авторизації
  useEffect(() => {
    if (isAuthenticated) {
      fetchCartFromServer();
      fetchFavoritesFromServer(); // 🚀 Завантажуємо обране при успішній авторизації
    } else {
      setCartItems([]); 
      setFavoriteItems([]); // Якщо користувач вийшов — очищуємо стейт обраного
    }
  }, [isAuthenticated, fetchCartFromServer, fetchFavoritesFromServer]);

  // 🔄 Слухач подій localStorage для миттєвої синхронізації при вході/виході
  useEffect(() => {
    const handleStorageChange = () => {
      const tokenExists = !!localStorage.getItem('token');
      setIsAuthenticated(tokenExists);
      if (tokenExists) {
        fetchCartFromServer();
        fetchFavoritesFromServer(); // 🚀 Синхронізуємо обране при змінах сесії
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchCartFromServer, fetchFavoritesFromServer]);


  // 🔄 ХМАРНЕ ДОДАВАННЯ В КОШИК
  const addToCart = async (product) => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert("Будь ласка, увійдіть в акаунт!");
      return;
    }

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
        window.dispatchEvent(new Event('storage'));
      }
    } catch (error) {
      console.error('Помилка додавання в хмарний кошик:', error);
    }
  };


  // 🔄 ХМАРНЕ ВИДАЛЕННЯ З КОШИКА
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
        window.dispatchEvent(new Event('storage'));
      }
    } catch (error) {
      console.error('Помилка видалення з хмарного кошика:', error);
    }
  };


  // 🔄 ХМАРНА ЗМІНА КІЛЬКОСТІ ТОВАРУ
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
        window.dispatchEvent(new Event('storage'));
      } else {
        console.error('Сервер повернув помилку при оновленні кількості');
      }
    } catch (error) {
      console.error('Помилка оновлення кількості в хмарі:', error);
    }
  };

  // ❤️ 3. ХМАРНЕ ДОДАВАННЯ/ВИДАЛЕННЯ З ОБРАНОГО (TOGGLE)
  const toggleFavorite = async (product) => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert("Будь ласка, увійдіть в акаунт, щоб додавати товари в обране!");
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
        fetchFavoritesFromServer(); // Перемальовуємо актуальний стан з бази
        window.dispatchEvent(new Event('storage'));
      }
    } catch (error) {
      console.error('Помилка зміни статусу обраного в хмарі:', error);
    }
  };

  // ЛОКАЛЬНЕ ОЧИЩЕННЯ КОШИКА ПІСЛЯ ЗАМОВЛЕННЯ
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Передаємо кількість елементів у шапку сайту (за потреби можна додати й favoriteItems) */}
        <Header cartItems={cartItems} favoriteItems={favoriteItems} />

        <main>
          <Routes>
            {/* Публічні сторінки */}
            <Route path="/login" element={<AuthForm mode="login" />} />
            <Route path="/register" element={<AuthForm mode="register" />} />

            {/* Захищені сторінки */}
            {/* 🚀 Передаємо стейт обраного та функцію toggleFavorite в каталог */}
            <Route 
              path="/shop" 
              element={<Shop addToCart={addToCart} toggleFavorite={toggleFavorite} favoriteItems={favoriteItems} />} 
            />

            {/* 🚀 Передаємо стейт обраного та функцію toggleFavorite на сторінку деталей товару */}
            <Route
              path="/product/:id"
              element={
                isAuthenticated ? (
                  <ProductDetails addToCart={addToCart} toggleFavorite={toggleFavorite} favoriteItems={favoriteItems} />
                ) : (
                  <Navigate to="/login" />
                )
              }
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

            {/* 🚀 Оновлюємо роут Favorites: передаємо хмарні дані та функції зміни стану */}
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
              element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
            />

            {/* Редирект з головної */}
            <Route path="/" element={<Navigate to={isAuthenticated ? "/shop" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;