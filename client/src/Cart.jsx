import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from './ToastContext';

// Додаємо новий пропс clearCart (або функцію, яка повністю занулює кошик на фронтенді)
const Cart = ({ cartItems = [], removeFromCart, updateQuantity, clearCart }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Отримуємо токен та користувача
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const token = localStorage.getItem('token');

  // Динамічні розрахунки вартості з урахуванням структури Prisma (item.product)
  const totalItemsPrice = cartItems.reduce((sum, item) => {
    const price = item.product ? item.product.price : (item.price || 0);
    return sum + price * item.quantity;
  }, 0);

  const deliveryPrice = totalItemsPrice > 2000 || totalItemsPrice === 0 ? 0 : 150; // Безкоштовно від 2000 грн
  const finalTotal = totalItemsPrice + deliveryPrice;

  // Видалення товару з тостом (використовуємо внутрішній id зв'язку CartItem)
  const handleRemove = (item) => {
    const itemTitle = item.product ? item.product.title : (item.title || 'Товар');
    removeFromCart(item.id);
    showToast(`"${itemTitle}" видалено з кошика`, 'success');
  };

  // Зміна кількості товарів
  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity < 1) {
      handleRemove(item);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  // Оформлення замовлення
  const handleCheckoutSubmit = async () => {
    if (cartItems.length === 0) return;

    if (!user || !token) {
      showToast("Будь ласка, увійдіть в систему для оформлення замовлення", "error");
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: Number(user.id),
          totalAmount: Number(finalTotal),
          cartItems: cartItems.map(item => ({
            id: item.productId || item.id, // передаємо реальний ID продукту для зв'язку в замовленні
            quantity: item.quantity,
            price: item.product ? item.product.price : (item.price || 0)
          }))
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Помилка замовлення');

      showToast(data.message || 'Замовлення успішно створено!', 'success');

      // 🚀 ЗАМІСТЬ ЦИКЛУ: Просто очищаємо локальний стейт на фронтенді
      if (typeof clearCart === 'function') {
        clearCart(); // Якщо передано функцію повного очищення з App.jsx чи Context
      } else {
        // Якщо такої функції немає, примусово очищаємо через поштучний фільтр стейту БЕЗ запитів на сервер,
        // але краще передати clearCart з батька.
        cartItems.length = 0; 
      }

      window.dispatchEvent(new Event('storage'));
      navigate('/profile');

    } catch (error) {
      console.error(error);
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Заголовок сторінки */}
        <h1 className="text-2xl font-black uppercase tracking-widest text-gray-900 mb-8 border-b-2 border-black pb-4">
          Ваш Кошик
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white border border-gray-200 p-12 text-center shadow-sm">
            <p className="text-gray-500 font-medium text-lg mb-6">У вашому кошику ще немає товарів</p>
            <Link to="/shop" className="inline-block bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition">
              Перейти до покупок
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* СПИСОК ТОВАРІВ */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => {
                const itemTitle = item.product ? item.product.title : (item.title || 'Товар');
                const itemPrice = item.product ? item.product.price : (item.price || 0);
                const itemImageUrl = item.product ? item.product.imageUrl : item.imageUrl;

                return (
                  <div key={item.id} className="bg-white border border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm relative">

                    {/* Інформація про товар */}
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="w-16 h-16 bg-gray-100 border border-gray-200 flex items-center justify-center font-black text-gray-400 text-xs flex-shrink-0 overflow-hidden">
                        {itemImageUrl ? (
                          <img
                            src={itemImageUrl.startsWith('http') ? itemImageUrl : `${import.meta.env.VITE_API_URL}${itemImageUrl}`}
                            alt={itemTitle}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentNode.innerText = 'MOTO';
                            }}
                          />
                        ) : (
                          'MOTO'
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm uppercase tracking-tight text-gray-900 truncate">
                          {itemTitle}
                        </h3>
                        <p className="text-xs text-gray-500 font-mono mt-1">{itemPrice.toFixed(2)} UAH / шт.</p>
                      </div>
                    </div>

                    {/* Керування кількістю */}
                    <div className="flex justify-between sm:justify-end items-center gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                      <div className="flex items-center border border-gray-300 h-9">
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          className="px-3 h-full bg-gray-50 hover:bg-gray-200 text-sm font-bold transition"
                          disabled={isSubmitting}
                        >-</button>
                        <span className="px-4 font-mono text-sm font-bold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          className="px-3 h-full bg-gray-50 hover:bg-gray-200 text-sm font-bold transition"
                          disabled={isSubmitting}
                        >+</button>
                      </div>

                      <div className="text-right min-w-[100px]">
                        <p className="font-black text-sm tracking-tight">{(itemPrice * item.quantity).toFixed(2)} UAH</p>
                        <button
                          onClick={() => handleRemove(item)}
                          className="text-red-500 text-[11px] font-bold uppercase tracking-wider hover:underline mt-0.5"
                          disabled={isSubmitting}
                        >Видалити</button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* БЛОК ПІДСУМКУ ЗАМОВЛЕННЯ */}
            <div className="bg-white border border-gray-200 p-6 shadow-md sticky top-24">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b pb-3 mb-4">
                Підсумок замовлення
              </h2>

              <div className="space-y-3 font-medium text-sm text-gray-600 pb-4 border-b">
                <div className="flex justify-between">
                  <span>Вартість товарів:</span>
                  <span className="font-mono text-gray-900">{totalItemsPrice.toFixed(2)} UAH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Доставка:</span>
                  <span className="font-mono text-gray-900">
                    {deliveryPrice === 0 ? (
                      <span className="text-green-600 font-bold uppercase text-xs">Безкоштовно</span>
                    ) : (
                      `${deliveryPrice.toFixed(2)} UAH`
                    )}
                  </span>
                </div>
                {deliveryPrice > 0 && (
                  <p className="text-[10px] text-gray-400 italic">
                    Додайте товарів ще на {(2000 - totalItemsPrice).toFixed(2)} UAH для безкоштовної доставки.
                  </p>
                )}
              </div>

              <div className="flex justify-between items-baseline py-4 mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-gray-900">Всього до сплати:</span>
                <span className="text-xl font-black tracking-tight text-blue-600">{finalTotal.toFixed(2)} UAH</span>
              </div>

              <button
                onClick={handleCheckoutSubmit}
                disabled={isSubmitting || cartItems.length === 0}
                className={`w-full h-12 text-white text-xs font-black uppercase tracking-widest transition active:scale-[0.98] rounded-none ${
                  isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
                }`}
              >
                {isSubmitting ? 'Оформляється...' : 'Підтвердити замовлення'}
              </button>

              <div className="mt-6 pt-4 border-t border-gray-100 text-[11px] text-gray-400 space-y-2">
                <p className="flex items-center gap-2">🔒 Безпечне шифрування даних замовлення.</p>
                <p>⚡ Офіційна гарантія та швидке повернення товарів протягом 14 днів.</p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;