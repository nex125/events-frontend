'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[global error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-dvh flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <h1 className="mb-4 text-2xl font-semibold">Something went wrong</h1>
            <p className="mb-8 text-sm opacity-80">
              An unexpected error occurred while loading the page.
            </p>
            <button
              type="button"
              onClick={reset}
              className="inline-flex rounded-full border px-5 py-2"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
