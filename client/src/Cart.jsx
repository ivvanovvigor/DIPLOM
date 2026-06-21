import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import NPAddressSelector from './NPAddressSelector';

const Cart = ({ cartItems = [], removeFromCart, updateQuantity, clearCart }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, token } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Online Оплата / Оплата частинами');

  // Універсальна функція для обробки URL зображень
  const getImageUrl = (item) => {
    const url = item.product?.imageUrl || item.imageUrl || '';
    if (url.startsWith('http')) return url;
    return url ? `${import.meta.env.VITE_API_URL}${url}` : '/placeholder.jpg';
  };

  // Розрахунки
  const totalItemsPrice = cartItems.reduce((sum, item) => {
    const price = item.product ? item.product.price : (item.price || 0);
    return sum + price * item.quantity;
  }, 0);

  const deliveryPrice = totalItemsPrice > 2000 || totalItemsPrice === 0 ? 0 : 150;
  let finalTotal = totalItemsPrice + deliveryPrice;
  const discount = paymentMethod === 'Online Оплата / Оплата частинами' ? finalTotal * 0.02 : 0;
  finalTotal -= discount;

  const handleCheckoutSubmit = async () => {
    if (!user || !token) {
      showToast("Увійдіть в систему для оформлення", "error");
      navigate('/login');
      return;
    }
    if (!phone.trim() || !city || !warehouse) {
      showToast("Будь ласка, заповніть номер телефону та адресу доставки", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          totalAmount: Number(finalTotal.toFixed(2)),
          phone,
          address: `м. ${city}, ${warehouse}`,
          paymentMethod,
          cartItems: cartItems.map(item => ({
            productId: Number(item.productId || item.id),
            quantity: Number(item.quantity),
            price: Number(item.product?.price || item.price || 0)
          }))
        }),
      });

      if (!response.ok) throw new Error("Помилка при оформленні");

      showToast('Замовлення успішно оформлено!', 'success');
      if (typeof clearCart === 'function') clearCart();
      navigate('/profile');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-black uppercase mb-8 border-b-2 border-black pb-4">Ваш Кошик</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white p-12 text-center border">
            <p className="text-gray-500 mb-6">У кошику немає товарів</p>
            <Link to="/shop" className="bg-black text-white px-6 py-3 uppercase text-xs font-bold">До покупок</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Список товарів з примусовим сортуванням */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems
                .slice()
                .sort((a, b) => a.id - b.id)
                .map(item => (
                  <div key={item.id} className="bg-white p-4 sm:p-6 flex flex-col sm:flex-row gap-4 border">

                    {/* Зображення + Інформація */}
                    <div className="flex items-start gap-4 flex-1">
                      <img
                        src={getImageUrl(item)}
                        alt={item.product?.title || item.title}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover border border-gray-100 flex-shrink-0"
                        onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm uppercase leading-tight">
                          {item.product?.title || item.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {(item.product?.price || item.price || 0).toFixed(2)} UAH
                        </p>
                      </div>
                    </div>

                    {/* Керування кількістю + Видалення */}
                    <div className="flex flex-col sm:items-end gap-3 sm:gap-4 w-full sm:w-auto">

                      {/* Блок зміни кількості */}
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 text-lg font-medium"
                          >
                            −
                          </button>

                          <span className="w-10 text-center font-medium text-sm border-x border-gray-300 py-2">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 text-lg font-medium"
                          >
                            +
                          </button>
                        </div>

                        {/* Кнопка "Видалити" */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-600 text-xs font-bold uppercase whitespace-nowrap"
                        >
                          Видалити
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
            </div>

            {/* Блок оформлення */}
            <div className="bg-white p-6 border h-fit space-y-6">
              <h2 className="text-xs font-black uppercase text-gray-400 border-b pb-3">Оформлення</h2>
              <div className="space-y-4">
                <input
                  type="tel"
                  placeholder="(+38) XXX-XXX-XX-XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 border text-sm"
                />
                <NPAddressSelector onCityChange={setCity} onWarehouseChange={setWarehouse} />
              </div>

              <div className="border-t pt-4">
                <h3 className="text-xs font-black uppercase text-gray-400 mb-3">Спосіб оплати</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer text-sm">
                    <input type="radio" value="Online Оплата / Оплата частинами" checked={paymentMethod === 'Online Оплата / Оплата частинами'} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <span>Online Оплата / Оплата частинами</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer text-sm">
                    <input type="radio" value="Оплата при отриманні" checked={paymentMethod === 'Оплата при отриманні'} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <span>Оплата при отриманні</span>
                  </label>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-xl font-black text-blue-600 mb-4">{finalTotal.toFixed(2)} UAH</p>
                <button onClick={handleCheckoutSubmit} disabled={isSubmitting} className="w-full bg-black text-white py-3 uppercase text-xs font-bold">
                  {isSubmitting ? 'Оформлюється...' : 'Підтвердити замовлення'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;