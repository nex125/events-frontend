'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';
import { dsMotion } from '@ds';

export function ComingSoonTooltip() {
  const t = useTranslations('navbar');
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        aria-label={t('accountAriaLabel')}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="flex items-center justify-center w-8 h-8 text-[var(--ds-on-surface-variant)] hover:text-[var(--ds-primary)] transition-colors"
      >
        <User size={20} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="tooltip"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{
              duration: dsMotion.duration.fast,
              ease: dsMotion.ease.default,
            }}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-5 z-[var(--z-tooltip)] pointer-events-none"
          >
            <div className="relative bg-[var(--ds-surface)]/80 backdrop-blur-xl px-4 py-2 rounded-[var(--ds-radius-functional)] shadow-md ds-ghost-border">
              <div className="absolute left-1/2 -translate-x-1/2 -top-[5px] w-2.5 h-2.5 rotate-45 bg-[var(--ds-surface)]/80 backdrop-blur-xl border-l border-t border-[var(--ds-ghost-border)]" />
              <span className="relative ds-body-sm text-[var(--ds-on-surface)] whitespace-nowrap">
                {t('comingSoonTooltip')}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
