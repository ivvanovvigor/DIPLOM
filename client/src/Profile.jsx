import React, { useEffect, useState } from 'react';

const Profile = () => {
  const [orders, setOrders] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  // Стейт для керування кастомним модальним вікном
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Викликаємо новий безпечний ендпоінт, де сервер сам витягне юзера з токена
    fetch(`${import.meta.env.VITE_API_URL}/api/orders/my`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Не вдалося завантажити замовлення');
        return res.json();
      })
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Помилка завантаження замовлень:", err));
  }, []);

  // 1. Коли користувач тицяє "Скасувати", ми відкриваємо модалку
  const openCancelModal = (orderId) => {
    setOrderToCancel(orderId);
    setIsModalOpen(true);
  };

  // 2. Функція, яка спрацьовує, якщо користувач підтвердив скасування у нашій модалці
  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderToCancel}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`, // Обов'язково додаємо токен сюди також!
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Не вдалося скасувати замовлення');
      }

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderToCancel ? { ...order, status: 'cancelled' } : order
        )
      );
    } catch (err) {
      console.error(err);
      alert('Помилка при скасуванні замовлення.');
    } finally {
      // Закриваємо модальне вікно та очищуємо тимчасовий стейт
      setIsModalOpen(false);
      setOrderToCancel(null);
    }
  };

  const renderStatus = (status) => {
    if (status === 'cancelled') {
      return (
        <span className="text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-700 border border-red-200 px-2 py-0.5">
          Скасовано
        </span>
      );
    }
    return (
      <span className="text-[10px] font-black uppercase tracking-widest bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5">
        В обробці
      </span>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white p-8 border border-gray-200 text-center rounded-none max-w-sm w-full">
          <p className="text-xs uppercase font-black tracking-widest text-gray-400 mb-4">Доступ обмежено</p>
          <p className="text-sm font-medium text-gray-800 mb-6">Будь ласка, увійдіть в систему, щоб переглянути кабінет.</p>
          <a href="/login" className="inline-block w-full bg-black text-white p-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition rounded-none">
            Увійти
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 relative">
      <div className="max-w-4xl mx-auto">

        {/* БЛОК ІНФОРМАЦІЇ КОРИСТУВАЧА */}
        <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-none mb-10">
          <h1 className="text-xl font-black uppercase tracking-widest mb-6 text-gray-900 border-b border-gray-100 pb-3">
            Мій кабінет
          </h1>
          <div className="space-y-3 text-sm text-gray-700">
            <p className="uppercase text-xs tracking-wider text-gray-400 font-bold">Особисті дані</p>
            <p className="text-gray-900">
              Користувач: <span className="font-bold ml-1">{user.fullName}</span>
            </p>
            <p className="text-gray-900">
              Email: <span className="font-mono text-gray-600 ml-1">{user.email || 'Не вказано'}</span>
            </p>
          </div>
        </div>

        {/* БЛОК ІСТОРІЇ ЗАМОВЛЕНЬ */}
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
          Історія замовлень ({orders.length})
        </h2>

        {orders.length === 0 ? (
          <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-none text-center">
            <p className="text-sm text-gray-400 italic">Ви ще нічого не замовляли.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div
                key={order.id}
                className="bg-white p-6 border border-gray-200 border-l-4 border-l-black shadow-sm rounded-none transition hover:border-gray-400"
              >
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs uppercase font-black tracking-wider text-gray-900">
                      Замовлення №{order.id}
                    </span>
                    {renderStatus(order.status)}
                  </div>
                  <span className="text-sm font-black font-mono tracking-tight text-black">
                    {order.totalAmount} UAH
                  </span>
                </div>

                <div className="text-xs text-gray-800 space-y-2 mb-4">
                  {order.items && order.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-0.5">
                      <span className="font-medium uppercase tracking-tight text-gray-900">
                        • {item.product?.title || 'Товар'}
                      </span>
                      <span className="font-mono text-gray-500 bg-gray-50 px-2 py-0.5">
                        x{item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div>
                    {order.status !== 'cancelled' && (
                      <button
                        onClick={() => openCancelModal(order.id)}
                        className="h-8 px-4 border border-red-600 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition active:scale-95 rounded-none"
                      >
                        Скасувати замовлення
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                    Дата оформлення: {new Date(order.createdAt).toLocaleDateString('uk-UA')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🕶️ КАСТОРМНЕ БРУТАЛІСТИЧНЕ МОДАЛЬНЕ ВІКНО ПІДТВЕРДЖЕННЯ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border-2 border-black p-6 max-w-sm w-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none transform transition-all">
            <h3 className="text-xs font-black uppercase tracking-widest text-red-600 mb-3">
              Підтвердження дії
            </h3>
            <p className="text-sm font-medium text-gray-900 mb-6 tracking-tight">
              Ви впевнені, що хочете скасувати це замовлення? Цю дію не можна буде скасувати.
            </p>
            
            <div className="flex space-x-3">
              {/* Кнопка ТАК */}
              <button
                onClick={confirmCancelOrder}
                className="flex-1 h-10 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition active:scale-95 rounded-none"
              >
                Так, скасувати
              </button>
              
              {/* Кнопка НІ */}
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setOrderToCancel(null);
                }}
                className="flex-1 h-10 bg-gray-100 border border-gray-300 text-black text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition active:scale-95 rounded-none"
              >
                Назад
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;