'use client';

import React, { createContext, useContext, useCallback, useState, useMemo } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  durationMs?: number;
}

interface ToastContextValue {
  show: (type: ToastType, message: string, durationMs?: number) => void;
  success: (message: string, durationMs?: number) => void;
  error: (message: string, durationMs?: number) => void;
  info: (message: string, durationMs?: number) => void;
  warning: (message: string, durationMs?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within <ToastProvider>');
  }
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts(current => current.filter(t => t.id !== id));
  }, []);

  const show = useCallback((type: ToastType, message: string, durationMs = 3500) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const toast: Toast = { id, type, message, durationMs };
    setToasts(current => [...current, toast]);
    if (durationMs > 0) {
      setTimeout(() => remove(id), durationMs);
    }
  }, [remove]);

  const api = useMemo<ToastContextValue>(() => ({
    show,
    success: (msg, ms) => show('success', msg, ms),
    error: (msg, ms) => show('error', msg, ms),
    info: (msg, ms) => show('info', msg, ms),
    warning: (msg, ms) => show('warning', msg, ms),
  }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Toast viewport */}
      <div className="fixed top-4 right-4 z-[9999] space-y-3">
        {toasts.map(t => (
          <div
            key={t.id}
            className={[
              'min-w-[260px] max-w-sm px-4 py-3 rounded-lg shadow-lg border text-sm font-medium',
              t.type === 'success' && 'bg-green-50 text-green-800 border-green-200',
              t.type === 'error' && 'bg-red-50 text-red-800 border-red-200',
              t.type === 'info' && 'bg-blue-50 text-blue-800 border-blue-200',
              t.type === 'warning' && 'bg-yellow-50 text-yellow-800 border-yellow-200',
            ].filter(Boolean).join(' ')}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};



