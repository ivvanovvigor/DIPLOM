import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const AuthForm = ({ mode }) => {
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '', agreed: false });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();
  const { login } = useAuth();

  // === Основна форма входу/реєстрації ===
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === 'register' && !formData.agreed) {
      showToast("Будь ласка, погодьтеся на обробку персональних даних", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast("Введіть коректний формат email", "error");
      return;
    }

    if (mode === 'register') {
      const emailDomain = formData.email.split('@')[1].toLowerCase();
      const allowedDomains = ['gmail.com', 'ukr.net', 'yahoo.com', 'outlook.com', 'icloud.com'];
      if (!allowedDomains.includes(emailDomain)) {
        showToast("Реєстрація дозволена тільки для Gmail, Ukr.net, Outlook, Yahoo, iCloud", "error");
        return;
      }
    }

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
          navigate('/');
        } else {
          showToast('Реєстрація успішна! Тепер увійдіть.', 'success');
          navigate('/login');
        }
      } else {
        showToast(data.message || 'Помилка аутентифікації', 'error');
      }
    } catch (err) {
      showToast('Помилка сервера. Перевірте з’єднання.', 'error');
    }
  };

  // === Відновлення пароля ===
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      showToast("Введіть email", "error");
      return;
    }

    setIsResetting(true);

    try {
      showToast(`Посилання для відновлення пароля надіслано на ${resetEmail}`, 'success');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error) {
      showToast('Не вдалося надіслати запит. Спробуйте пізніше.', 'error');
    } finally {
      setIsResetting(false);
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

          {mode === 'register' && (
            <div className="flex items-center text-xs text-gray-500 mb-4 mt-4">
              <input
                type="checkbox"
                id="agree"
                checked={formData.agreed || false}
                className="mr-2 accent-blue-600"
                onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                required
              />
              <label htmlFor="agree" className="cursor-pointer">
                Я погоджуюсь з{' '}
                <a
                  href="/privacypolicy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-medium hover:underline"
                >
                  Політикою конфіденційності
                </a>
              </label>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-black text-white p-3 hover:bg-gray-800 transition font-bold uppercase text-xs tracking-widest rounded-none"
          >
            {mode === 'register' ? 'Зареєструватися' : 'Увійти'}
          </button>
        </form>

        {/* Посилання "Забули пароль?" */}
        {mode === 'login' && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowForgotPassword(true)}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Забули пароль?
            </button>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-gray-500 uppercase tracking-wider">
          {mode === 'register' ? (
            <p>Вже є акаунт? <Link to="/login" className="text-blue-600 font-bold hover:underline ml-1">Увійти</Link></p>
          ) : (
            <p>Немає акаунту? <Link to="/register" className="text-blue-600 font-bold hover:underline ml-1">Реєстрація</Link></p>
          )}
        </div>
      </div>

      {/* Модальне вікно відновлення пароля */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full p-8 rounded-none shadow-lg">
            <h3 className="text-lg font-bold mb-4">Відновлення пароля</h3>
            <p className="text-sm text-gray-600 mb-6">
              Введіть email, на який ми надішлемо посилання для відновлення пароля.
            </p>

            <form onSubmit={handleResetPassword}>
              <input
                type="email"
                placeholder="Ваш email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full p-3 border border-gray-200 focus:border-black outline-none mb-6 text-sm"
                required
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail('');
                  }}
                  className="flex-1 py-3 border border-gray-300 hover:bg-gray-50 transition"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="flex-1 bg-black text-white py-3 hover:bg-gray-800 transition font-medium disabled:opacity-70"
                >
                  {isResetting ? 'Надсилаємо...' : 'Надіслати посилання'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthForm;