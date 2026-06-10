'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

let _push: (msg: string, type?: ToastType) => void = () => {};

export const toast = (msg: string, type?: ToastType) => _push(msg, type);

export default function ToastHost() {
  const [items, setItems] = useState<{ id: number; msg: string; type: ToastType }[]>([]);

  useEffect(() => {
    _push = (msg: string, type: ToastType = 'info') => {
      const id = Date.now() + Math.random();
      setItems((arr) => [...arr, { id, msg, type }]);
      setTimeout(() => setItems((arr) => arr.filter((i) => i.id !== id)), 2600);
    };
  }, []);

  const icons = {
    success: <CheckCircle className="h-4 w-4 text-emerald-400" />,
    error: <AlertCircle className="h-4 w-4 text-red-400" />,
    info: <Info className="h-4 w-4 text-brand" />
  };

  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2 lg:bottom-10">
      <AnimatePresence mode="popLayout">
        {items.map((i) => (
          <motion.div
            key={i.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-base-border bg-base-800 px-4 py-2.5 shadow-elevated"
          >
            {icons[i.type]}
            <span className="text-[13px] font-medium text-label-primary">{i.msg}</span>
            <button onClick={() => setItems((arr) => arr.filter((x) => x.id !== i.id))} className="ml-1 text-label-quaternary hover:text-label-secondary transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
