import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const Header = ({ cartItems = [], favoriteItems = [], removeFromCart, updateQuantity, onLogout }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, token, logout } = useAuth();

  const [isCartOpen, setIsCartOpen] = useState(false);

  // === Автоматичне оновлення лічильників ===
  const [cartCount, setCartCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [totalSum, setTotalSum] = useState(0);

  useEffect(() => {
    const count = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const fav = favoriteItems.length;
    const sum = cartItems.reduce((sum, item) => {
      const price = item.price || (item.product ? item.product.price : 0);
      return sum + price * (item.quantity || 1);
    }, 0);

    setCartCount(count);
    setFavCount(fav);
    setTotalSum(sum);
  }, [cartItems, favoriteItems]);

  // === Оновлення Header після логіну ===
  useEffect(() => {
    console.log("Header: user changed →", user); // для дебагу
  }, [user, token]);

  const handleLogoutClick = () => {
    logout?.();
    onLogout?.();
    showToast("Ви успішно вийшли з системи", "success");
    setIsCartOpen(false);
  };

  const getImageUrl = (item) => {
    const url = item.product?.imageUrl || item.imageUrl || '';
    if (url.startsWith('http')) return url;
    return url ? `${import.meta.env.VITE_API_URL}${url}` : '/placeholder.jpg';
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 px-6 py-5 md:px-12 sticky top-0 z-50">
      <div className="w-full flex justify-between items-center">

        <Link to="/" className="text-lg font-black uppercase tracking-widest text-black hover:opacity-80 transition">
          MOTO STORE
        </Link>

        <div className="flex items-center space-x-5 sm:space-x-6">

          {/* Обране */}
          <Link to="/favorites" className="flex items-center gap-1 text-xs font-black uppercase tracking-widest hover:opacity-70 transition">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span className="hidden md:inline">Обране</span>
            {favCount > 0 && <span className="bg-black text-white text-[10px] px-1.5 rounded-full">{favCount}</span>}
          </Link>

          {/* Кошик */}
          <div className="relative">
            <button 
              onClick={() => setIsCartOpen(!isCartOpen)} 
              className="relative p-1 hover:bg-gray-100 rounded transition"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold px-1.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Модальне вікно кошика */}
            {isCartOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsCartOpen(false)}></div>
                <div className="fixed top-16 right-2 left-2 sm:absolute sm:top-full sm:right-0 sm:left-auto sm:mt-4 sm:w-80 md:w-96 bg-white border border-gray-200 p-4 shadow-xl z-50 max-h-[80vh] overflow-auto">
                  <h3 className="text-[10px] font-black uppercase text-gray-400 border-b pb-2 mb-3">Ваш кошик</h3>

                  {cartItems.length === 0 ? (
                    <p className="text-gray-400 text-xs text-center py-8">Кошик порожній</p>
                  ) : (
                    <>
                      <div className="max-h-60 overflow-y-auto space-y-4">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex gap-3">
                            <img
                              src={getImageUrl(item)}
                              alt={item.title || item.product?.title}
                              className="w-14 h-14 object-cover border"
                              onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                            />
                            <div className="flex-1 text-xs">
                              <p className="font-bold uppercase leading-tight">
                                {item.title || item.product?.title}
                              </p>
                              <p className="text-gray-500">
                                {item.quantity} × {(item.price || item.product?.price || 0).toFixed(2)} UAH
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-600 text-xl leading-none self-start"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-3 border-t">
                        <div className="flex justify-between font-black text-sm mb-3">
                          <span>Разом:</span>
                          <span>{totalSum.toFixed(2)} UAH</span>
                        </div>
                        <Link
                          to="/cart"
                          onClick={() => setIsCartOpen(false)}
                          className="block w-full py-3 text-center text-xs font-black uppercase bg-black text-white hover:bg-gray-800 transition"
                        >
                          Перейти до кошика
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Авторизація */}
          {user ? (
            <div className="flex items-center gap-4 border-l pl-4">
              <Link to="/profile" className="text-xs font-bold uppercase hover:underline">
                Кабінет
              </Link>
              <button
                onClick={handleLogoutClick}
                className="text-xs font-bold uppercase text-red-600 hover:text-red-700 transition"
              >
                Вийти
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-xs font-bold uppercase border-l pl-4 hover:underline">
              Увійти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;