import { createContext, useState, useCallback, useContext } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration);
  }, []);

  const success = useCallback((m, d) => show(m, 'success', d), [show]);
  const error = useCallback((m, d) => show(m, 'error', d || 6000), [show]);
  const warning = useCallback((m, d) => show(m, 'warning', d), [show]);
  const info = useCallback((m, d) => show(m, 'info', d), [show]);

  return (
    <ToastContext.Provider value={{ show, success, error, warning, info }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-card shadow-lg animate-slide-up max-w-md ${
              t.type === 'success' ? 'bg-success' :
              t.type === 'error' ? 'bg-red-500' :
              t.type === 'warning' ? 'bg-warning text-primary' : 'bg-surface'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
