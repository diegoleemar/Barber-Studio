'use client';

import { useEffect, useRef, useState } from 'react';

export const useScrollReveal = (options?: IntersectionObserverInit) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.08, ...options }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
};
