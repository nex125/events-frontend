'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { dsMotion } from '@ds';
import { events } from '@/data/events';
import { searchEvents } from '@/lib/search';
import Link from 'next/link';
import { formatEventDateShort } from '@/lib/datetime';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const results = query.trim()
    ? searchEvents(
        events.filter((e) => !e.isMock),
        query,
      ).slice(0, 3)
    : [];

  const showDropdown = focused && query.trim().length > 0;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/events?q=${encodeURIComponent(query.trim())}`);
        setFocused(false);
      }
    },
    [query, router],
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative hidden lg:block">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ds-on-surface-variant)]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Поиск событий..."
            className="bg-[var(--ds-surface-container-low)] border-none rounded-[var(--ds-radius-pill)] py-2 pl-10 pr-6 ds-body-sm w-64 text-[var(--ds-on-surface)] placeholder:text-[var(--ds-on-surface-variant)] focus:outline-none focus:ring-1 focus:ring-[var(--ds-primary-ring-soft)] transition-all"
          />
        </div>
      </form>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{
              duration: dsMotion.duration.fast,
              ease: dsMotion.ease.default,
            }}
            className="absolute top-full left-0 right-0 mt-4 bg-[var(--ds-surface)]/80 backdrop-blur-xl ds-ghost-border rounded-[var(--ds-radius-structural)] overflow-hidden z-[var(--z-dropdown)]"
          >
            {results.length > 0 ? (
              <>
                {results.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.slug}`}
                    onClick={() => setFocused(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--ds-surface-container-high)] transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-[var(--ds-radius-functional)] bg-[var(--ds-surface-container)] bg-cover bg-center shrink-0"
                      style={
                        event.image
                          ? { backgroundImage: `url(${event.image})` }
                          : undefined
                      }
                    />
                    <div className="min-w-0">
                      <p className="ds-body-sm font-semibold text-[var(--ds-on-surface)] truncate">
                        {event.title}
                      </p>
                      <p className="ds-label-sm text-[var(--ds-on-surface-variant)]">
                        {formatEventDateShort(event.datetimeUtc)} ·{' '}
                        {event.location}
                      </p>
                    </div>
                  </Link>
                ))}
                <Link
                  href={`/events?q=${encodeURIComponent(query.trim())}`}
                  onClick={() => setFocused(false)}
                  className="block px-4 py-3 text-center ds-label-sm text-[var(--ds-primary)] hover:bg-[var(--ds-surface-container-high)] transition-colors border-t border-[var(--ds-ghost-border)]"
                >
                  Показать все результаты
                </Link>
              </>
            ) : (
              <div className="px-4 py-3 ds-body-sm text-[var(--ds-on-surface-variant)]">
                Ничего не найдено
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
