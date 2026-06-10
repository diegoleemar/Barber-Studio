'use client';

import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function BottomSheet({
  open,
  onClose,
  title,
  children
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg rounded-t-2xl border border-base-border bg-base-900 p-5 pb-[max(env(safe-area-inset-bottom),80px)] shadow-dialog sm:rounded-2xl sm:pb-6"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-base-500 sm:hidden" />
            {title && (
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-[18px] font-semibold text-label-primary">{title}</h2>
                <button onClick={onClose} className="btn-icon !h-8 !w-8" aria-label="Cerrar">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="max-h-[70vh] overflow-y-auto scrollbar-hide">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
