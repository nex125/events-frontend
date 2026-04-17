const DEFAULT_REVALIDATE_SECONDS = 60;

declare const process: {
  env: {
    CONTENT_REVALIDATE_SECONDS?: string;
  };
};

function resolveRevalidateSeconds(): number {
  const raw = process.env.CONTENT_REVALIDATE_SECONDS?.trim();
  if (!raw) {
    return DEFAULT_REVALIDATE_SECONDS;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return DEFAULT_REVALIDATE_SECONDS;
  }

  return Math.floor(parsed);
}

export function buildContentFetchInit(signal: AbortSignal): RequestInit {
  const revalidateSeconds = resolveRevalidateSeconds();

  if (revalidateSeconds === 0) {
    return {
      cache: 'no-store',
      signal,
    };
  }

  return {
    next: { revalidate: revalidateSeconds },
    signal,
  };
}
