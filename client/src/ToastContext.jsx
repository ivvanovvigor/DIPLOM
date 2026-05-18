import React, { createContext, useContext, useState, useEffect } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ message: '', type: 'success' }); // type: 'success' або 'error'

  // Автоматично ховаємо плашку через 4 секунди
  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => {
        setToast({ message: '', type: 'success' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.message]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* ГЛОБАЛЬНЕ СТИЛЬНЕ СПОВІЩЕННЯ ЗНИЗУ ПО ЦЕНТРУ */}
      {toast.message && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] p-4 w-full max-w-md animate-fade-in-up">
          <div className={`p-5 border shadow-2xl rounded-none flex items-center justify-between relative transition-all duration-300 ${
            toast.type === 'error' 
              ? 'bg-red-950 text-red-200 border-red-800' 
              : 'bg-black text-white border-gray-800'
          }`}>
            
            {/* Текст сповіщення: чітко по центру, без зайвих заголовків */}
            <p className="text-xs font-black uppercase tracking-wider text-center flex-1 pr-4 leading-relaxed">
              {toast.message}
            </p>
            
            {/* Кнопка закриття (✕) */}
            <button
              onClick={() => setToast({ message: '', type: 'success' })}
              className={`text-sm font-mono p-1 transition-colors flex-shrink-0 ${
                toast.type === 'error' ? 'text-red-400 hover:text-red-100' : 'text-gray-400 hover:text-white'
              }`}
            >
              ✕
            </button>
            
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);