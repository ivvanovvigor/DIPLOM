import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from './ToastContext'; // ✅ ІМПОРТУЄМО НАШ ХУК ТОСТІВ

// 🛒 Приймаємо хмарні cartItems, favoriteItems та функцію видалення прямо з пропсів App.jsx
const Header = ({ cartItems = [], favoriteItems = [], removeFromCart }) => {
  const navigate = useNavigate();
  const { showToast } = useToast(); // ✅ ІНІЦІАЛІЗУЄМО КОНТЕКСТ СПОВІЩЕНЬ
  const [isCartOpen, setIsCartOpen] = useState(false);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const token = localStorage.getItem('token');

  // 🎒 Динамічно рахуємо дані на основі хмарного стейту кошика
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Динамічно рахуємо кількість елементів в обраному на основі пропса з бази даних
  const favCount = favoriteItems.length;

  // Автоматична адаптація суми під структуру Prisma (item.price або item.product.price)
  const totalSum = cartItems.reduce((sum, item) => {
    const price = item.price || (item.product ? item.product.price : 0);
    return sum + (price * item.quantity);
  }, 0);

  // 🚀 МОДЕРНІЗОВАНА ФУНКЦІЯ ОФОРМЛЕННЯ ЗАМОВЛЕННЯ З TOAST
  const handleCheckout = async () => {
    if (!user || !token) {
      showToast("Будь ласка, увійдіть в систему для оформлення замовлення", "error");
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      showToast("Ваш кошик порожній", "error");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: Number(user.id),
          totalAmount: Number(totalSum),
          cartItems: cartItems.map(item => ({
            id: item.productId || item.id,
            quantity: item.quantity,
            price: item.price || (item.product ? item.product.price : 0)
          }))
        })
      });

      if (response.ok) {
        showToast("Замовлення успішно оформлено!", "success");
        setIsCartOpen(false);

        // Викликаємо подію для повної синхронізації фронтенду (перечитування кошика з сервера)
        window.dispatchEvent(new Event('storage'));
        navigate('/profile');
      } else {
        const errorData = await response.json();
        showToast(`Помилка: ${errorData.message || 'Не вдалося оформити'}`, "error");
      }
    } catch (error) {
      console.error("Помилка відправки:", error);
      showToast("Не вдалося зв'язатися з сервером", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Чистимо кошик та обране з пам'яті для повної безпеки
    localStorage.removeItem('cart');
    localStorage.removeItem('favorites');
    window.location.href = '/login';
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 px-6 py-5 md:px-12 sticky top-0 z-50">
      <div className="w-full flex justify-between items-center">

        {/* ЛІВИЙ КУТОК */}
        <div className="flex items-center space-x-8">
          <Link to="/shop" className="text-lg font-black uppercase tracking-widest text-blue-600 hover:opacity-80 transition">
            MOTO STORE
          </Link>
        </div>

        {/* ПРАВИЙ КУТОК */}
        <div className="flex items-center space-x-6">
          <Link
            to="/favorites"
            className="text-xs font-black uppercase tracking-widest text-red-600 hover:text-red-800 transition flex items-center space-x-1"
          >
            <span>Обране</span>
            <span className="bg-red-100 px-1.5 py-0.5 text-[10px] font-mono border border-red-300 ml-1">
              {favCount}
            </span>
          </Link>

          {/* Блок Кошика */}
          <div className="relative">
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="p-1 text-gray-700 hover:text-black transition flex items-center relative"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded-none">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Модальне вікно кошика */}
            {isCartOpen && (
              <div className="absolute right-0 mt-4 w-80 bg-white border border-gray-200 p-4 shadow-xl z-50 rounded-none">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2 mb-3">Ваш кошик</h3>

                {cartItems.length === 0 ? (
                  <p className="text-gray-400 text-xs text-center py-6 italic">Кошик порожній</p>
                ) : (
                  <>
                    <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                      {cartItems.map((item) => {
                        const itemTitle = item.title || (item.product ? item.product.title : 'Товар');
                        const itemPrice = item.price || (item.product ? item.product.price : 0);
                        const itemId = item.id;

                        return (
                          <div key={itemId} className="flex justify-between items-start py-1 border-b border-gray-50 last:border-none">
                            <div className="flex-1 min-w-0 pr-2">
                              <p className="text-xs font-bold uppercase truncate tracking-tight text-gray-900">{itemTitle}</p>
                              <p className="text-[11px] text-gray-500 font-mono mt-0.5">{item.quantity} шт. × {itemPrice} UAH</p>
                            </div>
                            <button
                              onClick={() => removeFromCart && removeFromCart(itemId)}
                              className="text-gray-300 hover:text-black transition text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex justify-between items-baseline text-xs uppercase font-bold text-gray-900">
                        <span>Разом:</span>
                        <span className="text-sm font-black tracking-tight">{totalSum} UAH</span>
                      </div>

                      <div className="space-y-2 mt-4">
                        <Link
                          to="/cart"
                          onClick={() => setIsCartOpen(false)}
                          className="flex items-center justify-center w-full h-10 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition border border-black rounded-none"
                        >
                          Перейти до кошика
                        </Link>
                        <button
                          onClick={handleCheckout}
                          className="flex items-center justify-center w-full h-10 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition rounded-none"
                        >
                          Оформити замовлення
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Блок перевірки авторизації */}
          {token ? (
            <div className="flex items-center space-x-5 border-l border-gray-200 pl-5">
              <Link
                to="/profile"
                className="text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-black transition flex items-center space-x-2.5"
              >
                {user && user.fullName && (
                  <span className="w-7 h-7 bg-gray-100 text-black flex items-center justify-center font-black rounded-none text-[10px] border border-gray-200">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                )}
                <span>Кабінет</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition"
              >
                Вийти
              </button>
            </div>
          ) : (
            <div className="border-l border-gray-200 pl-4">
              <Link to="/login" className="text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-black transition">
                Увійти
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;