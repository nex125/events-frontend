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
        <span className="text-[250px] font-display font-black tracking-tighter">
          TICKETOK
        </span>
      </div>

      <div className="ds-section-footer relative z-10">
        <div className="max-w-[80rem] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-4 items-center md:items-start">
            <Link
              href="/"
              className="ds-heading-md ds-gradient-primary-text tracking-tighter"
            >
              Ticketok
            </Link>
            <div className="text-[var(--ds-on-surface-variant)] ds-body-sm max-w-md text-center md:text-left space-y-1">
              <p>
                ООО «Левол Групп», г. Браслав, ул. Красноармейская д. 1/2, УНП
                391029259
              </p>
              <p>© 2024 Ticketok. Сервис продажи билетов.</p>
            </div>
          </div>

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
        </div>
      </div>
    </footer>
  );
}
