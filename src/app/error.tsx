'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@ds';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');

  useEffect(() => {
    console.error('[page error]', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <h2 className="ds-heading-lg mb-4">{t('title')}</h2>
      <p className="ds-body-md text-[var(--ds-on-surface-variant)] mb-8 max-w-md">
        {t('description')}
      </p>
      <Button variant="primary" size="lg" onClick={reset}>
        {t('retry')}
      </Button>
    </div>
  );
}
