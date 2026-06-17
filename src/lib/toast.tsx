'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

let nextId = 0;

const icons: Record<string, string> = {
  success: '✓',
  error: '✕',
  info: 'i',
};

const colors: Record<string, string> = {
  success: 'border-green-500 bg-green-500/10 text-green-400',
  error: 'border-red-500 bg-red-500/10 text-red-400',
  info: 'border-ufc-red bg-ufc-red/10 text-ufc-red',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border ${colors[toast.type]} backdrop-blur-lg shadow-2xl animate-fadeSlideUp min-w-[280px] max-w-[400px]`}
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-black/20">
              {icons[toast.type]}
            </div>
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="opacity-50 hover:opacity-100 text-xs p-1">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
