import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const Header = ({ cartItems = [], favoriteItems = [], removeFromCart, updateQuantity }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, token, logout } = useAuth();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const favCount = favoriteItems.length;

  const totalSum = cartItems.reduce((sum, item) => {
    const price = item.price || (item.product ? item.product.price : 0);
    return sum + (price * item.quantity);
  }, 0);

  const handleLogoutClick = () => {
    logout();
    showToast("Ви успішно вийшли з системи", "success");
    navigate('/login');
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 px-6 py-5 md:px-12 sticky top-0 z-50">
      <div className="w-full flex justify-between items-center">
        
        {/* Логотип */}
        <Link to="/" className="text-lg font-black uppercase tracking-widest text-black hover:opacity-80 transition">
          MOTO STORE
        </Link>

        {/* Навігація */}
        <div className="flex items-center space-x-4 sm:space-x-6 flex-shrink-0">
          
          {/* Обране */}
          <Link to="/favorites" className="text-xs font-black uppercase tracking-widest text-black hover:opacity-70 transition flex items-center">
            <svg className="h-6 w-6 fill-black mr-1" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
            <span className="hidden md:inline">Обране</span>
            <span className="bg-gray-100 border border-black px-1.5 ml-1">{favCount}</span>
          </Link>

          {/* Кошик */}
          <div className="relative">
            <button onClick={() => setIsCartOpen(!isCartOpen)} className="relative p-1">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 100 4 2 2 0 000-4z" /></svg>
              {cartCount > 0 && <span className="absolute -top-1 -right-1.5 bg-black text-white text-[9px] font-bold px-1.5">{cartCount}</span>}
            </button>

            {/* Модалка */}
            {isCartOpen && (
              <div className="absolute right-0 mt-4 w-80 bg-white border border-gray-200 p-4 shadow-xl z-50">
                <h3 className="text-[10px] font-black uppercase text-gray-400 border-b pb-2 mb-3">Ваш кошик</h3>
                {cartItems.length === 0 ? (
                  <p className="text-gray-400 text-xs text-center py-6">Кошик порожній</p>
                ) : (
                  <>
                    <div className="max-h-60 overflow-y-auto space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-1 border-b">
                          <div className="text-xs">
                            <p className="font-bold uppercase">{item.title || item.product?.title}</p>
                            <p className="text-[10px] text-gray-500">{item.quantity} × {item.price || item.product?.price} UAH</p>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500">✕</button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 border-t pt-3">
                      <div className="flex justify-between font-black text-xs uppercase mb-3"><span>Разом:</span><span>{totalSum.toFixed(2)} UAH</span></div>
                      <Link to="/cart" onClick={() => setIsCartOpen(false)} className="block w-full py-3 text-center text-xs font-black uppercase bg-black text-white">Перейти до кошика</Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Авторизація */}
          {token ? (
            <div className="flex items-center space-x-4 border-l pl-4">
              <Link to="/profile" className="text-xs font-bold uppercase">Кабінет</Link>
              <button onClick={handleLogoutClick} className="text-xs font-bold uppercase text-red-500">Вийти</button>
            </div>
          ) : (
            <Link to="/login" className="text-xs font-bold uppercase border-l pl-4">Увійти</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;