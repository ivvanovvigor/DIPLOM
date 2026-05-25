import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from './ToastContext';

// Статичний довідник для логістики
const UKRAINE_LOGISTICS = {
  "Київська область": {
    "Київ": ["Відділення №1 (вул. Пирогівський шлях, 135)", "Відділення №5 (вул. Федорова, 32)", "Відділення №10 (вул. Василя Жуковського, 22А)"],
    "Біла Церква": ["Відділення №1 (вул. Київська, 33)", "Відділення №4 (вул. 1-ша Піщана, 7б)", "Відділення №12 (вул. Наливайка Северина, 20А)"]
  },
  "Одеська область": {
    "Одеса": ["Відділення №1 (Київське шосе, 27)", "Відділення №8 (вул. Афанасьєва Геннадія, 3/5)", "Відділення №25 (вул. Мала Арнаутська, 45)"],
    "Чорноморськ": ["Відділення №1 (вул. Захисників України, 23)", "Відділення №3 (вул. Паркова, 28)"]
  },
  "Львівська область": {
    "Львів": ["Відділення №1 (вул. Городоцька, 359)", "Відділення №11 (вул. Городоцька, 120)", "Відділення №42 (вул. Чорновола В'ячеслава, 67г)"]
  }
};

const Cart = ({ cartItems = [], removeFromCart, updateQuantity, clearCart }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [phone, setPhone] = useState('');

  // 📍 Покрокові стейти адреси
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [warehouse, setWarehouse] = useState('');

  // 💳 Стейт для способу оплати ('online' або 'cash')
  const [paymentMethod, setPaymentMethod] = useState('online');

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const token = localStorage.getItem('token');

  const totalItemsPrice = cartItems.reduce((sum, item) => {
    const price = item.product ? item.product.price : (item.price || 0);
    return sum + price * item.quantity;
  }, 0);

  const deliveryPrice = totalItemsPrice > 2000 || totalItemsPrice === 0 ? 0 : 150;

  // Розрахунок фінальної вартості з урахуванням знижки 2% за онлайн-оплату
  let finalTotal = totalItemsPrice + deliveryPrice;
  const discountAmount = finalTotal * 0.02;

  if (paymentMethod === 'online' && finalTotal > 0) {
    finalTotal = finalTotal - discountAmount;
  }

  const handleRemove = (item) => {
    const itemTitle = item.product ? item.product.title : (item.title || 'Товар');
    removeFromCart(item.id);
    showToast(`"${itemTitle}" видалено з кошика`, 'success');
  };

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity < 1) {
      handleRemove(item);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  const handleCheckoutSubmit = async () => {
    if (cartItems.length === 0) return;

    if (!user || !token) {
      showToast("Будь ласка, увійдіть в систему для оформлення замовлення", "error");
      navigate('/login');
      return;
    }

    // Перевірка заповнення ВСІХ полів
    if (!phone.trim() || !region || !city || !warehouse) {
      showToast("Будь ласка, заповніть номер телефону та оберіть повну адресу доставки", "error");
      return;
    }

    setIsSubmitting(true);

    const fullPhoneNumber = phone;
    const fullAddressString = `${region}, м. ${city}, ${warehouse}`;
    const paymentMethodText = paymentMethod === 'online' ? 'Online Оплата / Оплата частинами' : 'Оплата при отриманні';

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: Number(user.id),
          totalAmount: Number(finalTotal.toFixed(2)),
          phone: fullPhoneNumber,
          address: fullAddressString,
          paymentMethod: paymentMethodText, // Додаткове поле для бекенду
          cartItems: cartItems.map(item => ({
            id: item.productId || item.id,
            quantity: item.quantity,
            price: item.product ? item.product.price : (item.price || 0)
          }))
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Помилка замовлення');

      showToast(data.message || 'Замовлення успішно створено!', 'success');

      setPhone('');
      setRegion('');
      setCity('');
      setWarehouse('');
      setPaymentMethod('online');

      if (typeof clearCart === 'function') {
        clearCart();
      } else {
        cartItems.forEach(item => removeFromCart(item.id));
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

  // Допоміжні масиви на основі вибору користувача
  const availableCities = region ? Object.keys(UKRAINE_LOGISTICS[region] || {}) : [];
  const availableWarehouses = (region && city) ? UKRAINE_LOGISTICS[region][city] || [] : [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
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
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="w-16 h-16 bg-gray-100 border border-gray-200 flex items-center justify-center font-black text-gray-400 text-xs flex-shrink-0 overflow-hidden rounded-none">
                        {itemImageUrl ? (
                          <img
                            src={itemImageUrl.startsWith('http') ? itemImageUrl : (import.meta.env.VITE_API_URL + itemImageUrl)}
                            alt={itemTitle}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentNode.innerText = 'MOTO';
                            }}
                          />
                        ) : 'MOTO'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm uppercase tracking-tight text-gray-900 truncate">{itemTitle}</h3>
                        <p className="text-xs text-gray-500 font-mono mt-1">{itemPrice.toFixed(2)} UAH / шт.</p>
                      </div>
                    </div>

                    <div className="flex justify-between sm:justify-end items-center gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                      <div className="flex items-center border border-gray-300 h-9">
                        <button onClick={() => handleQuantityChange(item, item.quantity - 1)} className="px-3 h-full bg-gray-50 hover:bg-gray-200 text-sm font-bold transition rounded-none" disabled={isSubmitting}>-</button>
                        <span className="px-4 font-mono text-sm font-bold text-gray-900">{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(item, item.quantity + 1)} className="px-3 h-full bg-gray-50 hover:bg-gray-200 text-sm font-bold transition rounded-none" disabled={isSubmitting}>+</button>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <p className="font-black text-sm tracking-tight">{(itemPrice * item.quantity).toFixed(2)} UAH</p>
                        <button onClick={() => handleRemove(item)} className="text-red-500 text-[11px] font-bold uppercase tracking-wider hover:underline mt-0.5" disabled={isSubmitting}>Видалити</button>
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

              <div className="space-y-3 font-medium text-sm text-gray-600 pb-4">
                <div className="flex justify-between">
                  <span>Вартість товарів:</span>
                  <span className="font-mono text-gray-900">{totalItemsPrice.toFixed(2)} UAH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Доставка:</span>
                  <span className="font-mono text-gray-900">
                    {deliveryPrice === 0 ? (
                      <span className="text-green-600 font-bold uppercase text-xs">Безкоштовно</span>
                    ) : `${deliveryPrice.toFixed(2)} UAH`}
                  </span>
                </div>
                {/* Динамічний вивід знижки в чек */}
                {paymentMethod === 'online' && finalTotal > 0 && (
                  <div className="flex justify-between text-xs text-green-600 font-bold">
                    <span>Економія 2% (Онлайн):</span>
                    <span className="font-mono">- {discountAmount.toFixed(2)} UAH</span>
                  </div>
                )}
              </div>

              {/* РЕКВІЗИТИ ТА ЛОГІСТИКА */}
              <div className="mt-2 pt-4 border-t border-gray-200 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Реквізити одержувача та логістика
                </p>

                {/* Телефон */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Мобільний телефон *</label>
                  <input
                    type="tel"
                    placeholder="+38 (0XX) XXX-XX-XX"
                    maxLength="19"
                    value={phone}
                    onChange={(e) => {
                      // Залишаємо цифри, плюси, мінуси, дужки та пробіли
                      let val = e.target.value.replace(/[^0-9+\-() ]/g, '');

                      // Автоматично підставляємо +380, якщо користувач тільки починає писати
                      if (val.length === 1 && val !== '+') {
                        val = '+380' + val;
                      }

                      setPhone(val);
                    }}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-black focus:bg-white outline-none transition text-sm font-medium text-gray-900 shadow-sm"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                {/* Область */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Регіон / Область *</label>
                  <select
                    value={region}
                    onChange={(e) => {
                      setRegion(e.target.value);
                      setCity('');
                      setWarehouse('');
                    }}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 focus:border-black outline-none transition text-xs rounded-none font-bold text-gray-900 appearance-none cursor-pointer"
                    disabled={isSubmitting}
                    required
                  >
                    <option value="">--- Виберіть область ---</option>
                    {Object.keys(UKRAINE_LOGISTICS).map(reg => (
                      <option key={reg} value={reg}>{reg}</option>
                    ))}
                  </select>
                </div>

                {/* Місто */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Місто *</label>
                  <select
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setWarehouse('');
                    }}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 focus:border-black outline-none transition text-xs rounded-none font-bold text-gray-900 appearance-none cursor-pointer disabled:opacity-50"
                    disabled={!region || isSubmitting}
                    required
                  >
                    <option value="">--- Виберіть місто ---</option>
                    {availableCities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Адреса / Відділення */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Адреса доставки *</label>
                  <select
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 focus:border-black outline-none transition text-xs rounded-none font-bold text-gray-900 appearance-none cursor-pointer disabled:opacity-50"
                    disabled={!city || isSubmitting}
                    required
                  >
                    <option value="">--- Виберіть пункт або відділення ---</option>
                    {availableWarehouses.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>

                {/* СПОСІБ ОПЛАТИ */}
                <div className="pt-3 border-t border-gray-200">
                  <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">Спосіб оплати</label>
                  <div className="space-y-2">

                    {/* Картка / Онлайн */}
                    <label className={`flex flex-col p-3 border transition cursor-pointer ${paymentMethod === 'online' ? 'border-black bg-gray-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="payment"
                          value="online"
                          checked={paymentMethod === 'online'}
                          onChange={() => setPaymentMethod('online')}
                          className="accent-black cursor-pointer"
                        />
                        <span className="text-xs font-bold text-gray-900">Online Оплата / Оплата частинами</span>
                      </div>
                      <div className="mt-1.5 ml-5 bg-green-50 border border-dashed border-green-300 text-green-700 text-[10px] px-2 py-0.5 font-medium inline-block w-max">
                        Економіія 2% на післяплаті
                      </div>
                    </label>

                    {/* Післяплата */}
                    <label className={`flex items-center gap-2 p-3 border transition cursor-pointer ${paymentMethod === 'cash' ? 'border-black bg-gray-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={() => setPaymentMethod('cash')}
                        className="accent-black cursor-pointer"
                      />
                      <span className="text-xs font-bold text-gray-900">Оплата при отриманні</span>
                    </label>

                  </div>
                </div>
              </div>

              {/* Фінал */}
              <div className="flex justify-between items-baseline py-4 mt-4 mb-2 border-t border-gray-100">
                <span className="text-xs font-black uppercase tracking-wider text-gray-900">Всього до сплати:</span>
                <span className="text-xl font-black tracking-tight text-blue-600">{finalTotal.toFixed(2)} UAH</span>
              </div>

              <button
                onClick={handleCheckoutSubmit}
                disabled={isSubmitting || cartItems.length === 0}
                className={`w-full h-12 text-white text-xs font-black uppercase tracking-widest transition active:scale-[0.98] rounded-none ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
                  }`}
              >
                {isSubmitting ? 'Оформляється...' : 'Підтвердити замовлення'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;