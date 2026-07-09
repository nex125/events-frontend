'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

interface SeatmapStatusMessageProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
  onDismissError: () => void;
}

const ERROR_DISPLAY_DURATION_MS = 1500;

export function SeatmapStatusMessage({
  status,
  message,
  onDismissError,
}: SeatmapStatusMessageProps) {
  useEffect(() => {
    if (status !== 'error') return;

    const timeoutId = window.setTimeout(onDismissError, ERROR_DISPLAY_DURATION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [message, onDismissError, status]);

  const isVisible = status === 'success' || status === 'error';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute right-3 bottom-20 left-3 z-40 rounded-xl border border-[var(--ds-ghost-border)] bg-[var(--ds-surface)] px-4 py-3 text-sm shadow-[var(--ds-shadow-ambient-md)] sm:left-auto sm:w-full sm:max-w-sm"
          role={status === 'error' ? 'alert' : 'status'}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
