import { useState } from 'react';

interface ToastProps {
  msg: string;
  type: 'ok' | 'err';
}

export function Toast({ msg, type }: ToastProps) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-[300] px-5 py-3 rounded-xl shadow-xl font-mono text-[11px] ${
        type === 'ok' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
      }`}
    >
      {msg}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  function showToast(msg: string, type: 'ok' | 'err') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  return { toast, showToast };
}
