'use client';

import { AlertTriangle, ArrowLeft, LoaderCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@ds';
import {
  resolveWidgetConfig,
  ensureScript,
  ensureStylesheet,
  tryInitializeWidget,
  waitForWidgetRender,
  type WidgetStage,
} from '@/lib/ticketokWidget';

interface EmbedCheckoutProps {
  slug: string;
  searchParams: Record<string, string | string[] | undefined>;
}

function readSingleParam(value: string | string[] | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function EmbedCheckout({ slug, searchParams }: EmbedCheckoutProps) {
  const t = useTranslations('embedCheckout');
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [stage, setStage] = useState<WidgetStage>('validating');
  const [errorMessage, setErrorMessage] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const eventId = readSingleParam(searchParams.eventId);
  const bookingId = readSingleParam(searchParams.bookingId);
  const ticketId = readSingleParam(searchParams.ticketId) || '0';
  const mode = readSingleParam(searchParams.mode) || 'checkout';
  const isLaunchMode = mode === 'launch';
  const sourceEventIdRaw = readSingleParam(searchParams.sourceEventId);
  const sourceEventId = Number.parseInt(sourceEventIdRaw, 10);
  const widgetConfig = useMemo(() => resolveWidgetConfig(), []);

  const handleReturnToEvent = useCallback(() => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'ticketok-checkout-close' }, window.location.origin);
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = `/events/${encodeURIComponent(slug)}`;
  }, [slug]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    if (!Number.isFinite(sourceEventId) || sourceEventId <= 0) {
      setStage('error');
      setErrorMessage(t('invalidSourceEventId'));
      return;
    }

    if (eventId.length === 0 || (!isLaunchMode && bookingId.length === 0)) {
      setStage('error');
      setErrorMessage(t('missingResumeContext'));
      return;
    }

    const mountNode = mountRef.current;
    if (!mountNode) {
      setStage('error');
      setErrorMessage(t('widgetInitFailed'));
      return;
    }

    let cancelled = false;

    const boot = async () => {
      try {
        setStage('loading-assets');
        try {
          await Promise.all([
            ...widgetConfig.cssUrls.map((url) => ensureStylesheet(url)),
            ...widgetConfig.scriptUrls.map((url) => ensureScript(url)),
          ]);
        } catch (error) {
          throw new Error(
            error instanceof Error && error.message.trim().length > 0
              ? error.message
              : t('assetLoadFailed'),
          );
        }

        if (cancelled) {
          return;
        }

        setStage('initializing');
        try {
          const initializedViaApi = tryInitializeWidget({
            mountNode,
            sourceEventId,
            bookingId: bookingId || undefined,
            ticketId,
          });
          if (!initializedViaApi) {
            const rendered = await waitForWidgetRender(mountNode);
            if (!rendered) {
              throw new Error(t('widgetRenderTimeout'));
            }
          }
        } catch (error) {
          throw new Error(
            error instanceof Error && error.message.trim().length > 0
              ? error.message
              : t('widgetInitFailed'),
          );
        }

        if (cancelled) {
          return;
        }

        setStage('ready');
      } catch (error) {
        if (cancelled) {
          return;
        }

        const fallbackMessage =
          error instanceof Error && error.message.trim().length > 0
            ? error.message
            : t('widgetInitFailed');
        setStage('error');
        setErrorMessage(fallbackMessage);
      }
    };

    void boot();

    return () => {
      cancelled = true;
      mountNode.innerHTML = '';
    };
  }, [bookingId, eventId, isLaunchMode, isMounted, sourceEventId, t, ticketId, widgetConfig]);

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(223,205,114,0.18),_transparent_42%),linear-gradient(180deg,_rgba(20,20,18,0.98),_rgba(8,8,7,1))] text-[var(--ds-on-surface)]">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-stretch px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex w-full flex-col overflow-hidden rounded-[var(--ds-radius-structural)] border border-[var(--ds-ghost-border)] bg-[color-mix(in_srgb,var(--ds-surface)_92%,transparent)] shadow-[var(--ds-shadow-ambient-lg)]">
          <div className="border-b border-[var(--ds-ghost-border)] px-5 py-4 sm:px-6">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--ds-on-surface-variant)]">
              Ticketok
            </p>
            <h1 className="ds-heading-md tracking-tight">{t('title')}</h1>
            <p className="mt-2 text-sm text-[var(--ds-on-surface-variant)]">
              {t('description', { slug })}
            </p>
          </div>

          <div className="flex min-h-[min(78vh,720px)] flex-1 flex-col">
            {stage === 'error' ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-10 text-center">
                <div className="rounded-full border border-red-200 bg-red-50 p-3 text-red-700">
                  <AlertTriangle size={28} />
                </div>
                <div className="space-y-2">
                  <h2 className="ds-heading-sm">{t('errorTitle')}</h2>
                  <p className="mx-auto max-w-xl text-sm text-[var(--ds-on-surface-variant)]">
                    {errorMessage}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  icon={<ArrowLeft size={16} aria-hidden="true" />}
                  iconPosition="start"
                  onClick={handleReturnToEvent}
                >
                  {t('returnToEvent')}
                </Button>
              </div>
            ) : (
              <>
                {stage !== 'ready' ? (
                  <div className="flex items-center gap-3 border-b border-[var(--ds-ghost-border)] px-5 py-3 text-sm text-[var(--ds-on-surface-variant)] sm:px-6">
                    <LoaderCircle size={16} className="animate-spin text-[var(--ds-primary)]" />
                    <span>
                      {stage === 'validating'
                        ? t('validating')
                        : stage === 'loading-assets'
                          ? t('loadingAssets')
                          : t('initializing')}
                    </span>
                  </div>
                ) : null}
                <div className="relative flex-1 overflow-auto">
                  <div
                    ref={mountRef}
                    className="min-h-full w-full"
                    data-event-id={Number.isFinite(sourceEventId) ? String(sourceEventId) : undefined}
                    data-ticket-id={ticketId}
                    data-booking-id={!isLaunchMode && bookingId ? bookingId : undefined}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
