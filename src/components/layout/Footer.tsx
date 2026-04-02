import Link from 'next/link';

const footerLinks = [
  { href: '#', label: 'Конфиденциальность' },
  { href: '#', label: 'Условия' },
  { href: '#', label: 'Контакты' },
  { href: '#', label: 'Партнеры' },
];

export function Footer() {
  return (
    <footer className="relative w-full border-t border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] overflow-hidden">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none opacity-[0.04] select-none">
        <span className="text-[clamp(4rem,20vw,15.625rem)] leading-none whitespace-nowrap font-display font-black tracking-tighter">
          TICKETOK
        </span>
      </div>

      <div className="ds-section-footer relative z-10">
        <div className="max-w-[80rem] mx-auto flex flex-col md:flex-row justify-between items-stretch gap-8">
          <div className="flex flex-col justify-between gap-4 items-center md:items-start">
            <Link
              href="/"
              className="ds-heading-md ds-gradient-primary-text tracking-tighter"
            >
              Ticketok
            </Link>
            {/* Wider max-width so each <br>-separated line stays on one line */}
            <div className="text-[var(--ds-on-surface-variant)] ds-body-sm max-w-xl text-center md:text-left space-y-1">
              <p>
                ООО «Левол Групп»
                <br></br>
                Юридический адрес: 211969, Республика Беларусь, Витебская область, г. Браслав, ул. Красноармейская д. 1/2
                <br></br>
                УНП 391029259. Свидетельство о государственной регистрации выдано 30.10.2024 Браславским районным исполнительным комитетом.
                <br></br>
                Удостоверение Nº2-16/706 от 23.12.2025. Выдано Управлением культуры Витебского облисполкома.
              </p>
              <p>
                Инфолиния{' '}
                <a
                  href="tel:+375292771059"
                  className="text-[var(--ds-primary)] underline decoration-[var(--ds-primary-border)] underline-offset-2 hover:decoration-[var(--ds-primary)] transition-colors"
                >
                  +375 29 277-10-59
                </a>
              </p>
              <p>&copy; {new Date().getFullYear()} ticketok. Все права защищены.</p>
            </div>
          </div>

          <div className="flex flex-col justify-between items-center md:items-end gap-6 shrink-0">
            <div className="flex flex-wrap justify-center gap-10">
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="ds-label-sm text-[var(--ds-on-surface-variant)] hover:text-[var(--ds-tertiary)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            {/* Payment system logos */}
            <img
              src="/bepaid_logos.svg"
              alt="Visa, Mastercard, bePaid, Belcart, Google Pay"
              className="h-8 opacity-60"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
