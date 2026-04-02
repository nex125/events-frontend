'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { Button } from '@ds';
import { dsMotion } from '@ds';
import { ApiRequestError, subscribeToNewsletter } from '@/lib/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InnerCircle() {
  const [submittedStatus, setSubmittedStatus] = useState<
    'created' | 'existing' | 'reactivated' | null
  >(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showError = (msg: string) => {
    setError(msg);
    if (errorTimer.current) clearTimeout(errorTimer.current);
    errorTimer.current = setTimeout(() => setError(null), 3000);
  };

  useEffect(() => () => { if (errorTimer.current) clearTimeout(errorTimer.current); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!email.trim()) return showError('Введите email');
    if (!EMAIL_RE.test(email)) return showError('Некорректный email');

    setIsSubmitting(true);
    try {
      const response = await subscribeToNewsletter(
        { email: email.trim() },
        {
          headers: { 'x-client-source': 'inner-circle' },
          locale: navigator.language,
        },
      );
      setSubmittedStatus(response.status);
      setError(null);
      setEmail('');
    } catch (cause) {
      if (cause instanceof ApiRequestError && cause.code === 'VALIDATION_ERROR') {
        showError('Некорректный email');
      } else {
        showError('Не удалось оформить подписку. Попробуйте позже.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitted = submittedStatus !== null;
  const successTitle =
    submittedStatus === 'existing' ? 'Вы уже в списке' : 'Вы в списке';
  const successSubtitle =
    submittedStatus === 'reactivated'
      ? 'Подписка восстановлена. Ждите новостей.'
      : 'Ждите новостей — мы напишем первыми.';

  return (
    <section className="ds-section bg-[var(--ds-surface)]">
      <ScrollReveal>
        <div className="ds-section-inner text-center">
          <span className="ds-label-sm text-[var(--ds-primary)] tracking-[0.4em] mb-6 block">
            Закрытый круг
          </span>
          <h2 className="ds-display-md font-extrabold tracking-tighter mb-8">
            Доступ к тому, что недоступно другим.
          </h2>
          <p className="ds-body-lg text-[var(--ds-on-surface-variant)] mb-12 max-w-xl mx-auto">
            Подпишитесь на нашу рассылку, чтобы получать уведомления о секретных
            ивентах, раннем доступе к билетам и эксклюзивных мероприятиях.
          </p>

          <div className="relative flex justify-center items-center min-h-[72px]">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12, scale: 0.97 }}
                  transition={{ duration: 0.25, ease: 'easeIn' }}
                  className="flex flex-col md:flex-row gap-4 justify-center items-center w-full"
                >
                  {/* Input wrapped in relative so the tooltip can anchor to it */}
                  <div className="relative w-full md:w-80">
                    <input
                      type="text"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(null); }}
                      placeholder="email@address.com"
                      className="bg-[var(--ds-surface-container-high)] border-none rounded-[var(--ds-radius-functional)] px-6 py-4 w-full text-[var(--ds-on-surface)] placeholder:text-[var(--ds-on-surface-variant)] focus:ring-1 focus:ring-[var(--ds-primary-ring-soft)] outline-none ds-body-sm"
                    />

                    {/* Validation tooltip — same glass style as ComingSoonTooltip */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          role="tooltip"
                          initial={{ opacity: 0, scale: 0.96, y: 4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.96, y: 4 }}
                          transition={{ duration: dsMotion.duration.fast, ease: dsMotion.ease.default }}
                          className="absolute left-1/2 -translate-x-1/2 top-full mt-3 z-[var(--z-tooltip)] pointer-events-none"
                        >
                          <div className="relative bg-[var(--ds-surface)]/80 backdrop-blur-xl px-4 py-2 rounded-[var(--ds-radius-functional)] shadow-md ds-ghost-border">
                            {/* Arrow pointing up toward the input */}
                            <div className="absolute left-1/2 -translate-x-1/2 -top-[5px] w-2.5 h-2.5 rotate-45 bg-[var(--ds-surface)]/80 backdrop-blur-xl border-l border-t border-[var(--ds-ghost-border)]" />
                            <span className="relative ds-body-sm text-[var(--ds-on-surface)] whitespace-nowrap">
                              {error}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={isSubmitting}
                    className="w-full md:w-auto"
                  >
                    Подписаться
                  </Button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  className="flex flex-col items-center gap-5"
                >
                  {/* Checkmark with pulsing rings */}
                  <div className="relative flex items-center justify-center">
                    {/* Outer pulse ring */}
                    <motion.span
                      initial={{ scale: 0.6, opacity: 0.6 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      transition={{ duration: 1.1, ease: 'easeOut', delay: 0.2 }}
                      className="absolute w-14 h-14 rounded-full bg-[var(--ds-primary)]"
                    />
                    {/* Inner pulse ring */}
                    <motion.span
                      initial={{ scale: 0.6, opacity: 0.4 }}
                      animate={{ scale: 1.7, opacity: 0 }}
                      transition={{ duration: 0.9, ease: 'easeOut', delay: 0.35 }}
                      className="absolute w-14 h-14 rounded-full bg-[var(--ds-primary)]"
                    />

                    {/* Circle + check SVG */}
                    <motion.svg
                      width="56"
                      height="56"
                      viewBox="0 0 56 56"
                      fill="none"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 16, stiffness: 260, delay: 0.05 }}
                    >
                      {/* Background circle */}
                      <motion.circle
                        cx="28"
                        cy="28"
                        r="26"
                        fill="var(--ds-primary)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                      />
                      {/* Animated checkmark path */}
                      <motion.path
                        d="M16 28 L24 36 L40 20"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.45, ease: 'easeOut', delay: 0.25 }}
                      />
                    </motion.svg>
                  </div>

                  {/* Text */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.45 }}
                    className="space-y-1"
                  >
                    <p className="ds-heading-sm tracking-tight">{successTitle}</p>
                    <p className="ds-body-sm text-[var(--ds-on-surface-variant)]">
                      {successSubtitle}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
