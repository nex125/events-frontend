'use client';

import { useEffect } from 'react';
import { Button } from '@ds';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[page error]', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <h2 className="ds-heading-lg mb-4">Что-то пошло не так</h2>
      <p className="ds-body-md text-[var(--ds-on-surface-variant)] mb-8 max-w-md">
        Не удалось загрузить страницу. Проверьте, что API-сервер доступен, и
        попробуйте ещё раз.
      </p>
      <Button variant="primary" size="lg" onClick={reset}>
        Попробовать снова
      </Button>
    </div>
  );
}
