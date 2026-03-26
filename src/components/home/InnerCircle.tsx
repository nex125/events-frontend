'use client';

import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { Button } from '@ds';

export function InnerCircle() {
  return (
    <section className="ds-section bg-[var(--ds-surface)]">
      <ScrollReveal>
        <div className="ds-section-inner text-center">
          <span className="ds-label-sm text-[var(--ds-primary)] tracking-[0.4em] mb-6 block">
            The Inner Circle
          </span>
          <h2 className="ds-display-md font-extrabold tracking-tighter mb-8">
            Access the Inaccessible.
          </h2>
          <p className="ds-body-lg text-[var(--ds-on-surface-variant)] mb-12 max-w-xl mx-auto">
            Подпишитесь на нашу рассылку, чтобы получать уведомления о секретных
            показах, раннем доступе к билетам и эксклюзивных мероприятиях.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col md:flex-row gap-4 justify-center items-center"
          >
            <input
              type="email"
              placeholder="email@address.com"
              className="bg-[var(--ds-surface-container-high)] border-none rounded-[var(--ds-radius-functional)] px-6 py-4 w-full md:w-80 text-[var(--ds-on-surface)] placeholder:text-[var(--ds-on-surface-variant)] focus:ring-1 focus:ring-[var(--ds-primary-ring-soft)] outline-none ds-body-sm"
            />
            <Button variant="primary" size="lg" className="w-full md:w-auto">
              Join the Circle
            </Button>
          </form>
        </div>
      </ScrollReveal>
    </section>
  );
}
