import React from 'react';
import { Link } from 'react-router-dom';

// ⚡ Приймаємо хмарні дані та функції з пропсів App.jsx
const Favorites = ({ favoriteItems = [], toggleFavorite, addToCart }) => {

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Кількість товарів тепер вираховується з хмарного масиву */}
        <h1 className="text-xl font-black uppercase tracking-widest mb-8 text-gray-900 border-b border-black pb-3">
          Вибрані товари ({favoriteItems.length})
        </h1>

        {favoriteItems.length === 0 ? (
          <div className="bg-white p-12 border border-black text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-sm text-gray-500 font-medium mb-4">Ваш список вибраного порожній.</p>
            {/* Використовуємо Link замість <a> для швидкого роутингу без перезавантаження */}
            <Link to="/shop" className="inline-block bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition rounded-none">
              Перейти до каталогу
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {favoriteItems.map(product => (
              <div key={product.id} className="bg-white border border-gray-300 p-6 flex flex-col justify-between relative ">
                
                {/* Кнопка швидкого видалення (викликає toggleFavorite, який видалить товар з бази) */}
                <button 
                  onClick={() => toggleFavorite(product)}
                  className="absolute top-1 right-2 text-gray-400 hover:text-black font-bold text-sm p-1 transition-colors"
                >
                  ✕
                </button>

                {/* Зображення товару */}
                <div className="w-full h-40 bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden mb-4">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl.startsWith('http') ? product.imageUrl : `http://localhost:5000${product.imageUrl}`} 
                      alt={product.title} 
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <span className="font-black text-gray-300 text-xs">MOTO</span>
                  )}
                </div>

                {/* Назва та ціна */}
                <div className="mb-4">
                  <h3 className="text-xs font-black uppercase tracking-tight text-gray-900 line-clamp-2 h-8">
                    {product.title}
                  </h3>
                  <p className="text-sm font-mono font-black text-black mt-1">
                    {Number(product.price).toFixed(2)} UAH
                  </p>
                </div>

                {/* Кнопка "Купити" прямо з вибраного */}
                <button
                  onClick={() => addToCart(product)}
                  className="w-full h-10 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition active:scale-95 rounded-none"
                >
                  В кошик
                </button>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;