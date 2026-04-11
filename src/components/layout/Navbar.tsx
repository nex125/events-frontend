'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@ds/utils/cn';
import { dsMotion } from '@ds';
import { SearchBar } from '@/components/shared/SearchBar';
import { ComingSoonTooltip } from '@/components/shared/ComingSoonTooltip';

export function Navbar() {
  const t = useTranslations('navbar');
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileQuery, setMobileQuery] = useState('');
  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/events', label: t('allEvents') },
  ];

  function handleMobileSearch(e: React.FormEvent) {
    e.preventDefault();
    if (mobileQuery.trim()) {
      router.push(`/events?q=${encodeURIComponent(mobileQuery.trim())}`);
      setMobileOpen(false);
      setMobileQuery('');
    }
  }

  return (
    <nav className="fixed top-0 w-full z-[var(--z-navbar)] bg-[var(--ds-surface)]/80 backdrop-blur-xl">
      <div className="relative flex items-center justify-between px-6 md:px-8 py-2.5 max-w-[80rem] mx-auto">
        <Link
          href="/"
          className="ds-heading-lg ds-gradient-primary-text tracking-tighter"
        >
          Ticketok
        </Link>

        <div className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'ds-body-sm font-display transition-colors pb-1',
                  isActive
                    ? 'text-[var(--ds-primary)] border-b-2 border-[var(--ds-primary)]'
                    : 'text-[var(--ds-on-surface-variant)] hover:text-[var(--ds-on-surface)]',
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <SearchBar />
          <ComingSoonTooltip />
          <button
            aria-label={mobileOpen ? t('closeMenu') : t('openMenu')}
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden flex items-center justify-center w-8 h-8 text-[var(--ds-on-surface-variant)] hover:text-[var(--ds-on-surface)] transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: dsMotion.duration.normal,
              ease: dsMotion.ease.default,
            }}
            className="md:hidden overflow-hidden border-t border-[var(--ds-ghost-border)]"
          >
            <div className="px-6 py-4 space-y-4">
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  const isActive =
                    link.href === '/'
                      ? pathname === '/'
                      : pathname.startsWith(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'ds-body-sm font-display py-2.5 px-3 rounded-[var(--ds-radius-functional)] transition-colors',
                        isActive
                          ? 'text-[var(--ds-primary)] bg-[var(--ds-primary-wash)]'
                          : 'text-[var(--ds-on-surface-variant)] hover:text-[var(--ds-on-surface)] hover:bg-[var(--ds-surface-container-high)]',
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              <form onSubmit={handleMobileSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ds-on-surface-variant)]"
                  />
                  <input
                    type="search"
                    enterKeyHint="search"
                    value={mobileQuery}
                    onChange={(e) => setMobileQuery(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className="w-full bg-[var(--ds-surface-container-low)] border-none rounded-[var(--ds-radius-pill)] py-2.5 pl-10 pr-4 ds-body-sm text-[var(--ds-on-surface)] placeholder:text-[var(--ds-on-surface-variant)] focus:outline-none focus:ring-1 focus:ring-[var(--ds-primary-ring-soft)]"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-[var(--ds-primary-wash)] text-[var(--ds-primary)] hover:bg-[var(--ds-primary-wash-strong)] transition-colors"
                  aria-label={t('search')}
                >
                  <Search size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
