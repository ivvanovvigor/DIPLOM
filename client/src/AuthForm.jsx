import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from './ToastContext'; // Імпортуємо наш глобальний хук
import { useAuth } from './AuthContext';   // ІМПОРТУЄМО НАШ КОНТЕКСТ

const AuthForm = ({ mode }) => {
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });
  const navigate = useNavigate();
  const { showToast } = useToast(); // Ініціалізуємо тости
  const { login } = useAuth();      // БЕРЕМО МЕТОД LOGIN З КОНТЕКСТУ

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Базова перевірка загального формату (наявність @ та крапки)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast("Введіть коректний формат email (наприклад, user@example.com)", "error");
      return;
    }

    // Перевірка на реальні дозволені домени
    // Виділяємо все, що йде після символу "@" і переводимо в нижній регістр
    const emailDomain = formData.email.split('@')[1].toLowerCase();

    // Список «білих» реальних доменів, які дозволені на сайті
    const allowedDomains = ['gmail.com', 'ukr.net', 'yahoo.com', 'outlook.com', 'icloud.com'];

    if (!allowedDomains.includes(emailDomain)) {
      showToast("Реєстрація дозволена тільки для пошт: Gmail, Ukr.net, Outlook, Yahoo, iCloud", "error");
      return; // Блокуємо відправку на сервер
    }

    // Довжина пароля (щоб не реєстрували акаунти з паролем "1")
    if (formData.password.length < 6) {
      showToast("Пароль має бути не менше 6 символів", "error");
      return;
    }

    const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';

    const requestBody = mode === 'register'
      ? { email: formData.email, password: formData.password, fullName: formData.fullName }
      : { email: formData.email, password: formData.password };

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        if (mode === 'login') {
          login(data.user, data.token);

          showToast(`Вітаємо, ${data.user.fullName || 'користувачу'}!`, 'success');

          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new Event('favoritesUpdated'));

          navigate('/');

        } else {
          // Перед реєстрацією нового юзера чистимо старі дані
          localStorage.removeItem('cart');
          localStorage.removeItem('favorites');
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new Event('favoritesUpdated'));

          showToast('Реєстрація успішна! Тепер увійдіть.', 'success');

          setFormData({ email: '', password: '', fullName: '' });
          navigate('/login');
        }
      } else {
        showToast(data.message || 'Помилка аутентифікації', 'error');
      }
    } catch (err) {
      console.error("Помилка на фронтенді:", err);
      showToast('Помилка сервера. Перевірте з’єднання.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 shadow-sm border border-gray-100 rounded-none">
        <h2 className="text-center text-xl font-black uppercase tracking-widest mb-6 text-gray-800">
          {mode === 'register' ? 'Створити акаунт' : 'Вхід у систему'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Повне ім'я"
              value={formData.fullName}
              className="w-full p-3 border border-gray-200 focus:border-black outline-none transition text-sm rounded-none"
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            className="w-full p-3 border border-gray-200 focus:border-black outline-none transition text-sm rounded-none"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={formData.password}
            className="w-full p-3 border border-gray-200 focus:border-black outline-none transition text-sm rounded-none"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button className="w-full bg-black text-white p-3 hover:bg-gray-800 transition font-bold uppercase text-xs tracking-widest rounded-none">
            {mode === 'register' ? 'Зареєструватися' : 'Увійти'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500 uppercase tracking-wider">
          {mode === 'register' ? (
            <p>Вже є акаунт? <Link to="/login" className="text-blue-600 font-bold hover:underline ml-1">Увійти</Link></p>
          ) : (
            <p>Немає акаунту? <Link to="/register" className="text-blue-600 font-bold hover:underline ml-1">Реєстрація</Link></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;