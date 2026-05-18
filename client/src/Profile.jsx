import React, { useEffect, useState } from 'react';

const Profile = () => {
  const [orders, setOrders] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user && user.id) {
      fetch(`http://localhost:5000/api/orders/user/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setOrders(Array.isArray(data) ? data : []);
        })
        .catch(err => console.error("Помилка завантаження замовлень:", err));
    }
  }, []);

  // Функція для гарного та зрозумілого відображення статусів
  const renderStatus = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-700 border border-green-200 px-2 py-0.5">
            Виконано
          </span>
        );
      case 'pending':
        return (
          <span className="text-[10px] font-black uppercase tracking-widest bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5">
            В обробці
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-700 border border-red-200 px-2 py-0.5">
            Скасовано
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-600 border border-gray-200 px-2 py-0.5">
            {status}
          </span>
        );
    }
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
    <div className="min-h-screen bg-gray-50 py-12 px-6">
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
          Історія замовлений ({orders.length})
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
                {/* Шапка замовлення: Номер, Статус та Сума */}
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs uppercase font-black tracking-wider text-gray-900">
                      Замовлення №{order.id}
                    </span>
                    {/* Відображення статусу замовлення */}
                    {renderStatus(order.status)}
                  </div>
                  <span className="text-sm font-black font-mono tracking-tight text-black">
                    {order.totalAmount} UAH
                  </span>
                </div>
                
                {/* Список товарів у замовленні */}
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
                
                {/* Дата замовлення */}
                <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400 text-right">
                  Дата оформлення: {new Date(order.createdAt).toLocaleDateString('uk-UA')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;