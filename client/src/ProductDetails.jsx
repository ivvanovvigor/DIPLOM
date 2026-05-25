import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';

const ProductDetails = ({ addToCart, toggleFavorite, favoriteItems = [] }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/api/products/' + id)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Помилка завантаження:", err);
        setLoading(false);
      });
  }, [id]);

  // Кешуємо статус «В обраному», щоб компонент не смикався зайвий раз
  const isFavorite = useMemo(() => {
    if (!product) return false;
    return favoriteItems.some(item => item.productId === product.id || item.id === product.id);
  }, [product, favoriteItems]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-xs font-black uppercase tracking-widest animate-pulse">Завантаження товару...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <p className="text-sm italic text-gray-400 mb-4">Товар не знайдено 🏍️</p>
        <Link to="/" className="text-xs font-bold uppercase border-b border-black pb-1">Назад до каталогу</Link>
      </div>
    );
  }

  const productImgUrl = product.imageUrl && product.imageUrl.startsWith('http') 
    ? product.imageUrl 
    : (import.meta.env.VITE_API_URL + product.imageUrl);

  // Перевіряємо, що specs це дійсно об'єкт і він не null
  const hasSpecs = product.specs && typeof product.specs === 'object' && !Array.isArray(product.specs) && Object.keys(product.specs).length > 0;

  return (
    <div className="min-h-screen bg-white text-black p-6 md:p-16">
      <div className="max-w-6xl mx-auto mb-8">
        <Link to="/" className="text-[10px] font-bold uppercase text-gray-400 hover:text-black transition">
          Каталог
        </Link>
        <span className="text-[10px] text-gray-300 mx-2">/</span>
        <span className="text-[10px] font-bold uppercase text-gray-400">{product.category}</span>
      </div>

      {/* Основна розмітка */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        
        {/* ЛІВА ЧАСТИНА: Фото */}
        <div className="w-full aspect-square border border-gray-100 p-8 flex items-center justify-center bg-white">
          <img 
            src={productImgUrl} 
            alt={product.title} 
            className="max-w-full max-h-full object-contain transform hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* ПРАВА ЧАСТИНА: Інфо */}
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-4 leading-tight">
              {product.title}
            </h1>
            
            <div className="text-xl font-bold mb-6 text-gray-900">
              {product.price} <span className="text-xs font-normal text-gray-400">UAH</span>
            </div>

            <div className="w-12 h-[1px] bg-black mb-6"></div>

            <p className="text-xs text-gray-600 leading-relaxed mb-8">
              {product.description || "Опис для даного товару тимчасово відсутній."}
            </p>

            {/* ХАРАКТЕРИСТИКИ */}
            {hasSpecs && (
              <div className="mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Технічні характеристики</h3>
                <div className="border-t border-gray-100 divide-y divide-gray-100">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-2 py-2.5 text-xs">
                      <span className="font-medium text-gray-500">{key}</span>
                      <span className="font-bold text-right uppercase tracking-tight">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Кнопки дії */}
          <div className="mt-6 pt-6 border-t border-gray-100 flex gap-4">
            <button 
              onClick={() => addToCart && addToCart(product)}
              className="flex-1 h-12 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition active:scale-95 rounded-none"
            >
              Додати у кошик
            </button>
            
            <button 
              onClick={() => toggleFavorite && toggleFavorite(product)}
              className={`w-12 h-12 border border-black flex items-center justify-center transition active:scale-95 rounded-none ${
                isFavorite ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill={isFavorite ? "currentColor" : "none"} 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetails;