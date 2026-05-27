import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const AuthForm = ({ mode }) => {
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '', agreed: false });
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === 'register' && !formData.agreed) {
      showToast("Будь ласка, погодьтеся на обробку персональних даних", "error");
      return;
    }

    // Перевірка загального формату електронної пошти
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast("Введіть коректний формат email (наприклад, user@example.com)", "error");
      return;
    }

    // Валідація поштових доменів при реєстрації нового користувача
    if (mode === 'register') {
      const emailDomain = formData.email.split('@')[1].toLowerCase();
      const allowedDomains = ['gmail.com', 'ukr.net', 'yahoo.com', 'outlook.com', 'icloud.com'];

      if (!allowedDomains.includes(emailDomain)) {
        showToast("Реєстрація дозволена тільки для пошт: Gmail, Ukr.net, Outlook, Yahoo, iCloud", "error");
        return;
      }
    }

    // Перевірка мінімальної довжини пароля
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
          // Авторизація користувача та збереження сесії в контексті
          login(data.user, data.token);

          showToast(`Вітаємо, ${data.user.fullName || 'користувачу'}!`, 'success');

          // Миттєво сповіщаємо App.jsx про успішну авторизацію у поточній вкладці
          window.dispatchEvent(new Event('authChange'));

          // Тригери для синхронізації кошика та обраного в App.jsx для інших систем
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new Event('favoritesUpdated'));

          // Перенаправлення на корінь додатка
          navigate('/');
        } else {
          // Скидання системних маркерів перед переходом на авторизацію
          localStorage.removeItem('token');

          window.dispatchEvent(new Event('authChange'));
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

          {/* Ось тут чекбокс буде під усіма полями */}
          {mode === 'register' && (
            <div className="flex items-center text-xs text-gray-500 mb-4 mt-4">
              <input
                type="checkbox"
                id="agree"
                checked={formData.agreed || false}
                className="mr-2"
                onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                required
              />
              <label htmlFor="agree">
                Я погоджуюсь з
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline ml-1">
                  Політикою конфіденційності
                </a>
              </label>
            </div>
          )}

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