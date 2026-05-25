import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from './ToastContext'; // ІМПОРТ ХУКА ТОСТІВ
import { useAuth } from './AuthContext';   // ІМПОРТ КОНТЕКСТУ АВТОРИЗАЦІЇ

// Додано clearCart у пропси для очищення стану кошика після замовлення
const Header = ({ cartItems = [], favoriteItems = [], removeFromCart, clearCart }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // БЕРЕМО ДАНІ АВТОРИЗАЦІЇ З ГЛОБАЛЬНОГО СТЕЙТУ
  const { user, token, logout } = useAuth();

  // Динамічно рахуємо дані на основі хмарного стейту кошика
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Динамічно рахуємо кількість елементів в обраному на основі пропса з бази даних
  const favCount = favoriteItems.length;

  // Автоматична адаптація суми під структуру Prisma (item.price або item.product.price)
  const totalSum = cartItems.reduce((sum, item) => {
    const price = item.price || (item.product ? item.product.price : 0);
    return sum + (price * item.quantity);
  }, 0);

  // МОДЕРНІЗОВАНА ФУНКЦІЯ ОФОРМЛЕННЯ ЗАМОВЛЕННЯ З TOAST
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

    // Перевірка, чи заповнені дані доставки перед відправкою
    if (!phone.trim() || !deliveryAddress.trim()) {
      showToast("Будь ласка, заповніть номер телефону та адресу доставки", "error");
      return;
    }

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: Number(user.id),
          totalAmount: Number(totalSum),
          // Передаємо дані доставки (якщо бекенд їх підтримує)
          phone: phone,
          address: deliveryAddress,
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

        // Скидаємо поля форми доставки
        setPhone('');
        setDeliveryAddress('');

        // Викликаємо функцію очищення локального стейту кошика
        if (clearCart) {
          clearCart();
        } else {
          localStorage.removeItem('cart');
          window.dispatchEvent(new Event('storage'));
        }

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

  // М'ЯКИЙ ВИХІД ЧЕРЕЗ AUTHCONTEXT З ПЛАВНИМ РЕДІРЕКТОМ
  const handleLogoutClick = () => {
    logout();
    showToast("Ви успішно вийшли з системи", "success");
    navigate('/login');
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 px-6 py-5 md:px-12 sticky top-0 z-50">
      <div className="w-full flex justify-between items-center">

        {/* ЛІВИЙ КУТОК */}
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-lg font-black uppercase tracking-widest text-black hover:opacity-80 transition">
            MOTO STORE
          </Link>
        </div>

        {/* ПРАВИЙ КУТОК */}
        <div className="flex items-center space-x-4 sm:space-x-6 flex-shrink-0">
          <Link
            to="/favorites"
            className="text-xs font-black uppercase tracking-widest text-black hover:opacity-70 transition flex items-center space-x-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 fill-black text-black inline-block mr-1"
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>

            <span className="hidden md:inline">Обране</span>

            <span className="bg-gray-100 text-black px-1.5 py-0.5 text-[10px] font-mono border border-black ml-1">
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
              <div className="absolute right-0 mt-4 w-[calc(100vw-2rem)] sm:w-80 bg-white border border-gray-200 p-4 shadow-xl z-50 rounded-none max-sm:fixed max-sm:top-16 max-sm:left-4 max-sm:right-4 max-sm:w-auto">
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
                        <span className="text-sm font-black tracking-tight">{Number(totalSum).toFixed(2)} UAH</span>
                      </div>

                      {/* БЛОК СПРОЩЕНОГО ОФОРМЛЕННЯ ДОСТАВКИ ДЛЯ ДИПЛОМУ */}
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                          Дані для доставки
                        </p>
                        <input
                          type="tel"
                          placeholder="Номер телефону (наприклад, 0931234567)"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full p-2 border border-gray-200 focus:border-black outline-none transition text-xs rounded-none bg-gray-50 text-gray-900 font-medium"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Місто та № відділення Нової Пошти"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="w-full p-2 border border-gray-200 focus:border-black outline-none transition text-xs rounded-none bg-gray-50 text-gray-900 font-medium"
                          required
                        />
                      </div>

                      <div className="mt-4">
                        <Link
                          to="/cart"
                          onClick={() => {
                            // Якщо у тебе є стейт, який закриває модалку при кліку, викликай його тут, наприклад:
                            // setIsCartOpen(false);
                          }}
                          className="block w-full py-3 text-center text-xs font-black uppercase tracking-widest bg-black text-white hover:bg-gray-800 transition active:scale-[0.99] rounded-none"
                        >
                          Перейти до кошика ↗
                        </Link>
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
                onClick={handleLogoutClick}
                className="text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition"
              >
                Вийти
              </button>
            </div>
          ) : (
            <div className="border-l border-gray-200 pl-4">
              <Link to="/login" className="text-xs font-bold uppercase tracking-wider text-black hover:opacity-70 transition">
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