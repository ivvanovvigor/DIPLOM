import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import NPAddressSelector from './NPAddressSelector';

const Cart = ({ cartItems = [], removeFromCart, updateQuantity, clearCart }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, token } = useAuth();

  // Стани для форми замовлення
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');

  // Розрахунки
  const totalItemsPrice = cartItems.reduce((sum, item) => {
    const price = item.product ? item.product.price : (item.price || 0);
    return sum + price * item.quantity;
  }, 0);

  const deliveryPrice = totalItemsPrice > 2000 || totalItemsPrice === 0 ? 0 : 150;
  let finalTotal = totalItemsPrice + deliveryPrice;
  const discountAmount = finalTotal * 0.02;

  if (paymentMethod === 'online' && finalTotal > 0) {
    finalTotal -= discountAmount;
  }

  // Обробники
  const handleRemove = (item) => {
    const itemTitle = item.product ? item.product.title : (item.title || 'Товар');
    removeFromCart(item.id);
    showToast(`"${itemTitle}" видалено з кошика`, 'success');
  };

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity < 1) handleRemove(item);
    else updateQuantity(item.id, newQuantity);
  };

  const handleCheckoutSubmit = async () => {
    if (cartItems.length === 0) return;
    if (!user || !token) {
      showToast("Увійдіть в систему для оформлення", "error");
      navigate('/login');
      return;
    }
    if (!phone.trim() || !city || !warehouse) {
      showToast("Заповніть номер телефону та адресу доставки", "error");
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
          userId: Number(user.id),
          totalAmount: Number(finalTotal.toFixed(2)),
          phone,
          address: `м. ${city}, ${warehouse}`,
          paymentMethod: paymentMethod === 'online' ? 'Online' : 'При отриманні',
          cartItems: cartItems.map(item => ({
            id: item.productId || item.id,
            quantity: item.quantity,
            price: item.product ? item.product.price : (item.price || 0)
          }))
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-black uppercase tracking-widest text-gray-900 mb-8 border-b-2 border-black pb-4">Ваш Кошик</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white p-12 text-center shadow-sm border">
            <p className="text-gray-500 mb-6">У вашому кошику ще немає товарів</p>
            <Link to="/shop" className="bg-black text-white px-6 py-3 text-xs font-bold uppercase hover:bg-gray-800">Перейти до покупок</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="bg-white p-6 flex justify-between items-center border shadow-sm">
                  <div>
                    <h3 className="font-bold text-sm uppercase">{item.product?.title || item.title}</h3>
                    <p className="text-xs text-gray-500">{(item.product?.price || item.price || 0).toFixed(2)} UAH</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleQuantityChange(item, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item, item.quantity + 1)}>+</button>
                    <button onClick={() => handleRemove(item)} className="text-red-500 text-[10px] uppercase font-bold">Видалити</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 shadow-md border h-fit sticky top-24">
              <h2 className="text-xs font-black uppercase text-gray-400 border-b pb-3 mb-4">Підсумок</h2>

              <div className="space-y-4">
                <input
                  type="tel"
                  placeholder="(+38) XXX-XXX-XX-XX"
                  value={phone}
                  onChange={(e) => {
                    let input = e.target.value.replace(/\D/g, ''); // Залишаємо лише цифри
                    // Якщо користувач видалив все, повертаємо порожній рядок
                    if (input.length === 0) {
                      setPhone('');
                      return;
                    }
                    // Додаємо +38 на початок
                    if (!input.startsWith('38')) input = '38' + input;
                    // Форматуємо рядок: (+38) XXX-XXX-XX-XX
                    let formatted = '(+38) ';
                    if (input.length > 2) formatted += input.substring(2, 5);
                    if (input.length > 5) formatted += '-' + input.substring(5, 8);
                    if (input.length > 8) formatted += '-' + input.substring(8, 10);
                    if (input.length > 10) formatted += '-' + input.substring(10, 12);

                    setPhone(formatted);
                  }}
                  className="w-full p-2 border text-sm"
                />

                {/* Динамічний вибір адреси */}
                <NPAddressSelector
                  onCityChange={(city) => setCity(city)}
                  onWarehouseChange={(warehouse) => setWarehouse(warehouse)}
                />
              </div>

              <div className="mt-6 pt-4 border-t">
                <span className="text-xl font-black text-blue-600">{finalTotal.toFixed(2)} UAH</span>
                <button
                  onClick={handleCheckoutSubmit}
                  disabled={isSubmitting}
                  className="w-full mt-4 bg-black text-white py-3 text-xs font-bold uppercase hover:bg-gray-800"
                >
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