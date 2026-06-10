'use client';

import { motion } from 'framer-motion';

export default function Switch({
  checked,
  onChange,
  disabled
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
        checked ? 'bg-brand' : 'bg-base-500'
      } ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm ${checked ? 'left-[18px]' : 'left-0.5'}`}
      />
    </button>
  );
}
