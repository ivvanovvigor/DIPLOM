import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ⚡ Приймаємо дані та функції хмарного кошика й обраного з пропсів App.jsx
const Shop = ({ addToCart, toggleFavorite, favoriteItems = [] }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // СТАНИ ФІЛЬТРАЦІЇ ТА СОРТУВАННЯ
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Всі');
  const [priceRange, setPriceRange] = useState(40000);
  const [sortBy, setSortBy] = useState('default');

  // СТАН ДЛЯ ФІРМОВОГО СПОВІЩЕННЯ
  const [toastMessage, setToastMessage] = useState('');

  const categories = ['Всі', 'Шоломи', 'Екіпірування', 'Запчастини', 'Аксесуари'];

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
      })
      .catch((err) => console.error("Помилка при отриманні товарів:", err));
  }, []);

  // ЛОГІКА ФІЛЬТРАЦІЇ ТА СОРТУВАННЯ
  useEffect(() => {
    let result = [...products];

    if (activeCategory !== 'Всі') {
      result = result.filter(p => p.category === activeCategory);
    }

    if (searchQuery) {
      result = result.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    result = result.filter(p => p.price <= priceRange);

    if (sortBy === 'low-to-high') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'high-to-low') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    setFilteredProducts(result);
  }, [searchQuery, activeCategory, priceRange, sortBy, products]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Проксі-функція для виклику хмарного додавання до кошика та відображення тосту
  const handleAddToCartClick = async (product) => {
    if (addToCart) {
      await addToCart(product);
      setToastMessage(`Товар "${product.title}" додано до кошика!`);
    }
  };

  // 🚀 Проксі-функція для перемикання хмарного ОБРАНОГО з відображенням тосту
  const handleToggleFavoriteClick = async (product) => {
    if (toggleFavorite) {
      // Визначаємо поточний стан об'єкта, дивимось чи він уже був у базі
      const isCurrentlyFavorite = favoriteItems.some(item => item.id === product.id);

      await toggleFavorite(product);

      if (isCurrentlyFavorite) {
        setToastMessage(`Товар "${product.title}" видалено з вибраного`);
      } else {
        setToastMessage(`Товар "${product.title}" додано до вибраного!`);
      }
    }
  };

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row relative">

      {/* Кнопка для мобільних, яка прихована на десктопах (md:hidden) */}
      <button
        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
        className="md:hidden m-4 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest text-center"
      >
        {isFiltersOpen ? 'Приховати фільтри ✕' : 'Фільтри ⚙️'}
      </button>

      {/* SIDEBAR (Бічна панель) */}
      <aside className={`w-full md:w-64 bg-gray-50 border-r border-gray-100 p-6 flex-shrink-0 ${isFiltersOpen ? 'block' : 'hidden md:block'
        }`}>
        <h2 className="text-lg font-black uppercase tracking-tight mb-8">Фільтри</h2>

        <div className="mb-6">
          <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Пошук</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-b border-gray-300 py-1 text-sm outline-none focus:border-black transition-colors"
          />
        </div>

        <div className="mb-6">
          <label className="block text-[10px] font-bold uppercase text-gray-400 mb-4">Категорії</label>
          <div className="space-y-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`block w-full text-left px-3 py-2 rounded-none text-xs transition ${activeCategory === cat ? 'bg-black text-white font-bold' : 'text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-[10px] font-bold uppercase text-gray-400 mb-4">
            Ціна до: <span className="text-black">{priceRange} грн</span>
          </label>
          <input
            type="range" min="0" max="40000" step="100"
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="w-full accent-black cursor-pointer"
          />
        </div>

        <button
          onClick={() => { setSearchQuery(''); setActiveCategory('Всі'); setPriceRange(40000); setSortBy('default'); }}
          className="w-full py-2 text-[10px] font-bold uppercase border border-black hover:bg-black hover:text-white transition rounded-none"
        >
          Скинути фільтри
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-10">

        <div className="flex flex-col sm:flex-row justify-between items-baseline border-b border-gray-100 pb-4 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Каталог</h1>
            <span className="text-gray-400 text-xs font-mono">Знайдено: {filteredProducts.length}</span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <label className="text-[10px] font-bold uppercase text-gray-400 whitespace-nowrap">Сортувати:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-bold uppercase bg-gray-50 border border-gray-200 px-3 py-2 outline-none focus:border-black cursor-pointer rounded-none"
            >
              <option value="default">За замовчуванням</option>
              <option value="popular">За популярністю</option>
              <option value="low-to-high">Від дешевих до дорогих ↑</option>
              <option value="high-to-low">Від дорогих до дешевих ↓</option>
            </select>
          </div>
        </div>

        {/* СІТКА ТОВАРІВ */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredProducts.map((product) => {
            // 🚀 Перевірка статусу «В обраному» тепер йде через реактивний масив, отриманий з бази PostgreSQL/Neon
            const isFavorite = favoriteItems.some(item => item.id === product.id);

            return (
              <div key={product.id} className="group flex flex-col items-center bg-white border border-gray-100 p-4 transition-all hover:border-gray-300 rounded-none relative">

                <Link to={`/product/${product.id}`} className="w-full aspect-square mb-4 overflow-hidden flex items-center justify-center cursor-pointer">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="max-w-full max-h-full object-contain transition-transform duration-500 ease-in-out group-hover:scale-110"
                  />
                </Link>

                <h3 className="text-center text-[10px] font-black uppercase tracking-widest mb-2 h-8 line-clamp-2 leading-tight hover:text-gray-600 transition-colors">
                  <Link to={`/product/${product.id}`}>{product.title}</Link>
                </h3>

                <div className="w-10 h-[1px] bg-gray-200 mb-3"></div>

                <div className="text-sm font-bold text-gray-900 mb-4 font-mono">
                  {product.price} <span className="text-[9px] font-normal font-sans">UAH</span>
                </div>

                <div className="flex space-x-2 w-full justify-center pt-2 border-t border-gray-50 mt-auto">
                  <button
                    onClick={() => handleAddToCartClick(product)}
                    className="flex-1 h-9 bg-black text-white flex items-center justify-center hover:bg-gray-800 transition active:scale-95 rounded-none"
                  >
                    <span className="text-[10px] font-bold uppercase">В кошик</span>
                  </button>

                  <button
                    onClick={() => handleToggleFavoriteClick(product)}
                    className={`w-9 h-9 border border-black flex items-center justify-center transition rounded-none ${isFavorite ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                      }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill={isFavorite ? "currentColor" : "none"}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </main>

      {/* КАСТOМНИЙ TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 p-4 animate-fade-in-up w-full max-w-md">
          <div className="bg-black text-white p-5 border border-gray-800 shadow-2xl rounded-none flex items-center justify-between relative">
            <p className="text-xs font-black uppercase tracking-wider text-center flex-1 pr-4 leading-relaxed">
              {toastMessage}
            </p>
            <button
              onClick={() => setToastMessage('')}
              className="text-gray-400 hover:text-white text-sm font-mono p-1 transition-colors flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Shop;