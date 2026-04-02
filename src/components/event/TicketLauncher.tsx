'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, X } from 'lucide-react';

interface TicketLauncherProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TicketLauncher({ isOpen, onClose }: TicketLauncherProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Panel — shares layoutId with the button, morphs between them */}
          <motion.div
            layoutId="ticket-launcher"
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="relative z-10 bg-[var(--ds-surface)] overflow-hidden rounded-[var(--ds-radius-structural)] shadow-[var(--ds-shadow-ambient-lg)] w-full max-w-2xl"
            style={{ height: 'min(92vh, 860px)' }}
          >
            {/* Close button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ delay: 0.2, duration: 0.2 }}
              onClick={onClose}
              aria-label="Закрыть"
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-[var(--ds-surface-container-high)] hover:bg-[var(--ds-surface-container-highest)] transition-colors"
            >
              <X size={18} />
            </motion.button>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ delay: 0.22, duration: 0.3 }}
              className="flex flex-col w-full h-full"
            >
              <div className="flex items-center gap-3 px-8 py-6 border-b border-[var(--ds-border-subtle)] shrink-0">
                <Ticket size={22} className="text-[var(--ds-primary)]" />
                <h2 className="ds-heading-md tracking-tight">Выбор билетов</h2>
              </div>

              <div className="flex-1 overflow-hidden">
                <iframe
                  src="https://qa.store.ticketok.by/widget/?ticket_id=4&event_id=4&mode=1"
                  className="w-full h-full border-0"
                  allow="payment"
                  title="Виджет бронирования"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
}
