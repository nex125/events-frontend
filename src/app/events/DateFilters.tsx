'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, ChevronDown, Filter, MapPin, X } from 'lucide-react';
import { DayPicker, type Matcher } from 'react-day-picker';
import { useTranslations } from 'next-intl';
import styles from './DateFilters.module.css';
import { resolveLocaleTag } from '@/lib/i18n/config';

interface DateFiltersProps {
  query: string;
  selectedCategory: string;
  selectedCity: string;
  dateFrom: string;
  dateTo: string;
  validationError?: string | null;
}

interface DatePickerFieldProps {
  id: string;
  label: string;
  value?: Date;
  placeholder: string;
  open: boolean;
  disabled?: Matcher | Matcher[];
  onOpenChange: (open: boolean) => void;
  onChange: (nextDate: Date | undefined) => void;
  locale: string;
}

function parseDateParam(value: string): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split('-').map((part) => Number(part));
  if (!year || !month || !day) return undefined;
  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
}

function formatDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateLabel(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function clampToTodayOrLater(date: Date | undefined): Date | undefined {
  if (!date) return undefined;
  const today = getToday();
  return date < today ? today : date;
}

function DatePickerField({
  id,
  label,
  value,
  placeholder,
  open,
  disabled,
  onOpenChange,
  onChange,
  locale,
}: DatePickerFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onMouseDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onOpenChange(false);
      }
    };

    document.addEventListener('mousedown', onMouseDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, [open, onOpenChange]);

  return (
    <div className="flex flex-col gap-2" ref={containerRef}>
      <label htmlFor={id} className="ds-label-sm text-[var(--ds-on-surface-variant)]">
        {label}
      </label>

      <div className="relative">
        <button
          id={id}
          type="button"
          onClick={() => onOpenChange(!open)}
          className="flex h-10 w-full min-w-[15rem] items-center justify-between rounded-[var(--ds-radius-functional)] border border-[var(--ds-outline-variant)] bg-[var(--ds-surface)] px-3 text-left text-sm transition-colors hover:bg-[var(--ds-surface-container-low)]"
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <span
            className={
              value
                ? 'text-[var(--ds-on-surface)]'
                : 'text-[var(--ds-on-surface-variant)]'
            }
          >
            {value ? formatDateLabel(value, locale) : placeholder}
          </span>
          <Calendar className="h-4 w-4 text-[var(--ds-on-surface-variant)]" />
        </button>

        {open && (
          <div className="absolute right-0 top-full z-[var(--z-dropdown)] mt-2 rounded-[var(--ds-radius-structural)] border border-[var(--ds-ghost-border)] bg-[var(--ds-surface)] p-3 shadow-xl">
            <DayPicker
              mode="single"
              selected={value}
              disabled={disabled}
              showOutsideDays
              onSelect={(nextDate) => {
                onChange(nextDate);
                onOpenChange(false);
              }}
              className={styles.calendar}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function DateFilters({
  query,
  selectedCategory,
  selectedCity,
  dateFrom,
  dateTo,
  validationError,
}: DateFiltersProps) {
  const tCatalog = useTranslations('eventsCatalog');
  const t = useTranslations('dates');
  const locale = resolveLocaleTag();
  const router = useRouter();
  const today = useMemo(() => getToday(), []);
  const hasActiveFilters = Boolean(selectedCity || dateFrom || dateTo);
  const [city, setCity] = useState(selectedCity);
  const [fromDate, setFromDate] = useState<Date | undefined>(() =>
    clampToTodayOrLater(parseDateParam(dateFrom)),
  );
  const [toDate, setToDate] = useState<Date | undefined>(() =>
    clampToTodayOrLater(parseDateParam(dateTo)),
  );
  const [openPicker, setOpenPicker] = useState<'from' | 'to' | null>(null);
  const [isOpen, setIsOpen] = useState(hasActiveFilters || Boolean(validationError));

  useEffect(() => {
    setCity(selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    setFromDate(clampToTodayOrLater(parseDateParam(dateFrom)));
  }, [dateFrom]);

  useEffect(() => {
    setToDate(clampToTodayOrLater(parseDateParam(dateTo)));
  }, [dateTo]);

  useEffect(() => {
    if (hasActiveFilters || validationError) {
      setIsOpen(true);
    }
  }, [hasActiveFilters, validationError]);

  const fromDisabled = useMemo<Matcher | Matcher[] | undefined>(
    () => (toDate ? [{ before: today }, { after: toDate }] : { before: today }),
    [toDate, today],
  );

  const toDisabled = useMemo<Matcher | Matcher[] | undefined>(
    () => ({ before: fromDate ?? today }),
    [fromDate, today],
  );

  const buildCatalogUrl = (
    nextCity?: string,
    nextFrom?: Date,
    nextTo?: Date,
  ): string => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedCategory) params.set('category', selectedCategory);
    if (nextCity?.trim()) params.set('city', nextCity.trim());
    if (nextFrom) params.set('dateFrom', formatDateParam(nextFrom));
    if (nextTo) params.set('dateTo', formatDateParam(nextTo));

    const queryString = params.toString();
    return queryString ? `/events?${queryString}` : '/events';
  };

  return (
    <div className="relative w-full lg:min-w-[24rem]">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex min-h-11 items-center gap-3 rounded-[var(--ds-radius-pill)] border border-[var(--ds-primary-border)] bg-[var(--ds-primary-wash)] px-5 py-2.5 text-[var(--ds-on-surface)] transition-colors hover:bg-[var(--ds-primary-wash-strong)] lg:ml-auto"
        aria-expanded={isOpen}
      >
        <span className="ds-icon-primary rounded-[var(--ds-radius-functional)] p-2">
          <Filter className="h-4 w-4" />
        </span>
        <span className="ds-label-sm tracking-[0.16em]">
          {tCatalog('filtersButton')}
        </span>
        {hasActiveFilters && (
          <span className="rounded-[var(--ds-radius-pill)] bg-[var(--ds-primary)] px-2 py-0.5 text-[10px] font-semibold text-[var(--ds-on-primary)]">
            {[selectedCity ? 1 : 0, dateFrom ? 1 : 0, dateTo ? 1 : 0].reduce((sum, value) => sum + value, 0)}
          </span>
        )}
        <ChevronDown
          className={`h-4 w-4 text-[var(--ds-on-surface-variant)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="mt-4 rounded-[var(--ds-radius-structural)] border border-[var(--ds-ghost-border)] bg-[var(--ds-surface-container-low)] p-4 lg:absolute lg:right-0 lg:top-full lg:z-[var(--z-dropdown)] lg:mt-3 lg:w-[24rem]">
          <div className="mb-3 flex items-center justify-between">
            <span className="ds-label-sm tracking-[0.2em] text-[var(--ds-primary)]">
              {t('label')}
            </span>
            {(city || fromDate || toDate) && (
              <button
                type="button"
                onClick={() => {
                  setCity('');
                  setFromDate(undefined);
                  setToDate(undefined);
                  router.push(buildCatalogUrl('', undefined, undefined));
                }}
                className="inline-flex items-center gap-1 text-xs text-[var(--ds-on-surface-variant)] transition-colors hover:text-[var(--ds-on-surface)]"
              >
                <X className="h-3.5 w-3.5" />
                {t('clear')}
              </button>
            )}
          </div>

          <div className="grid gap-3">
            <div className="flex flex-col gap-2">
              <label htmlFor="cityFilter" className="ds-label-sm text-[var(--ds-on-surface-variant)]">
                {tCatalog('cityLabel')}
              </label>
              <div className="relative">
                <input
                  id="cityFilter"
                  type="text"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder={tCatalog('cityPlaceholder')}
                  className="h-10 w-full rounded-[var(--ds-radius-functional)] border border-[var(--ds-outline-variant)] bg-[var(--ds-surface)] pl-10 pr-3 text-sm text-[var(--ds-on-surface)] outline-none transition-colors placeholder:text-[var(--ds-on-surface-variant)] focus:border-[var(--ds-primary-border-strong)]"
                />
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ds-on-surface-variant)]" />
              </div>
            </div>

            <DatePickerField
              id="dateFrom"
              label={t('from')}
              value={fromDate}
              placeholder={t('placeholder')}
              open={openPicker === 'from'}
              onOpenChange={(nextOpen) => setOpenPicker(nextOpen ? 'from' : null)}
              disabled={fromDisabled}
              locale={locale}
              onChange={(nextDate) => {
                const safeDate = clampToTodayOrLater(nextDate);
                setFromDate(safeDate);
                if (safeDate && toDate && safeDate > toDate) {
                  setToDate(undefined);
                }
              }}
            />

            <DatePickerField
              id="dateTo"
              label={t('to')}
              value={toDate}
              placeholder={t('placeholder')}
              open={openPicker === 'to'}
              onOpenChange={(nextOpen) => setOpenPicker(nextOpen ? 'to' : null)}
              disabled={toDisabled}
              locale={locale}
              onChange={(nextDate) => setToDate(clampToTodayOrLater(nextDate))}
            />
          </div>

          <button
            type="button"
            onClick={() => router.push(buildCatalogUrl(city, fromDate, toDate))}
            className="mt-4 w-full rounded-[var(--ds-radius-pill)] px-4 py-2 ds-label-sm ds-accent-primary"
          >
            {t('apply')}
          </button>
        </div>
      )}

      {validationError ? (
        <p className="mt-3 ds-body-sm text-[var(--ds-error)]">{validationError}</p>
      ) : null}
    </div>
  );
}
