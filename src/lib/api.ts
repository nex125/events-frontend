import type { Event, SeatCategory } from '@/types/event';
import type { generateVenue } from '@/types/venue';

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8080/api';

declare const process:
  {
    env: {
      NEXT_PUBLIC_API_BASE_URL?: string;
      API_BASE_URL?: string;
      NEXT_PUBLIC_TICKETING_API_BASE_URL?: string;
      TICKETING_API_BASE_URL?: string;
      NEXT_PUBLIC_BO_SERVICE_BASE_URL?: string;
      BO_SERVICE_BASE_URL?: string;
      NEXT_PUBLIC_MERCURE_PUBLIC_URL?: string;
      MERCURE_PUBLIC_URL?: string;
    };
  };

function normalize(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function hasUsableValue(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0 && !value.includes('${');
}

function remapLoopbackToCurrentOrigin(configured: string): string {
  try {
    const url = new URL(configured);
    const isLoopbackHost =
      url.hostname === 'localhost' || url.hostname === '127.0.0.1';

    if (!isLoopbackHost) {
      return normalize(url.toString());
    }

    url.protocol = window.location.protocol;
    url.hostname = window.location.hostname;
    url.port = window.location.port;

    return normalize(url.toString());
  } catch {
    return normalize(configured);
  }
}

function getBrowserApiBaseUrl(): string {
  const configured = hasUsableValue(process.env.NEXT_PUBLIC_API_BASE_URL)
    ? process.env.NEXT_PUBLIC_API_BASE_URL
    : DEFAULT_API_BASE_URL;

  return remapLoopbackToCurrentOrigin(configured);
}

function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return getBrowserApiBaseUrl();
  }

  const configured =
    (hasUsableValue(process.env.API_BASE_URL) && process.env.API_BASE_URL) ||
    (hasUsableValue(process.env.NEXT_PUBLIC_API_BASE_URL) && process.env.NEXT_PUBLIC_API_BASE_URL) ||
    DEFAULT_API_BASE_URL;

  return normalize(configured);
}

const DEFAULT_TICKETING_API_BASE_URL = 'http://127.0.0.1:8080';

function getBrowserTicketingApiBaseUrl(): string {
  const configured = hasUsableValue(process.env.NEXT_PUBLIC_TICKETING_API_BASE_URL)
    ? process.env.NEXT_PUBLIC_TICKETING_API_BASE_URL
    : DEFAULT_TICKETING_API_BASE_URL;

  return remapLoopbackToCurrentOrigin(configured);
}

function getTicketingApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return getBrowserTicketingApiBaseUrl();
  }

  const configured =
    (hasUsableValue(process.env.TICKETING_API_BASE_URL) && process.env.TICKETING_API_BASE_URL) ||
    (hasUsableValue(process.env.NEXT_PUBLIC_TICKETING_API_BASE_URL) && process.env.NEXT_PUBLIC_TICKETING_API_BASE_URL) ||
    DEFAULT_TICKETING_API_BASE_URL;

  return normalize(configured);
}

const DEFAULT_BO_SERVICE_BASE_URL = '/bo';

function getBrowserBoServiceBaseUrl(): string {
  const configured = hasUsableValue(process.env.NEXT_PUBLIC_BO_SERVICE_BASE_URL)
    ? process.env.NEXT_PUBLIC_BO_SERVICE_BASE_URL
    : DEFAULT_BO_SERVICE_BASE_URL;

  if (configured.startsWith('/')) {
    return normalize(`${window.location.origin}${configured}`);
  }

  return remapLoopbackToCurrentOrigin(configured);
}

function getBoServiceBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return getBrowserBoServiceBaseUrl();
  }

  const configured =
    (hasUsableValue(process.env.BO_SERVICE_BASE_URL) && process.env.BO_SERVICE_BASE_URL) ||
    (hasUsableValue(process.env.NEXT_PUBLIC_BO_SERVICE_BASE_URL) && process.env.NEXT_PUBLIC_BO_SERVICE_BASE_URL) ||
    'http://bo-service:5175';

  return normalize(configured);
}

const DEFAULT_MERCURE_PUBLIC_URL = 'http://127.0.0.1:3026/.well-known/mercure';

function getBrowserMercurePublicUrl(): string {
  const configured = hasUsableValue(process.env.NEXT_PUBLIC_MERCURE_PUBLIC_URL)
    ? process.env.NEXT_PUBLIC_MERCURE_PUBLIC_URL
    : DEFAULT_MERCURE_PUBLIC_URL;

  try {
    const url = new URL(configured);
    const isLoopbackHost =
      url.hostname === 'localhost' || url.hostname === '127.0.0.1';

    if (isLoopbackHost) {
      url.protocol = window.location.protocol;
      url.hostname = window.location.hostname;
      url.port = window.location.port;
    }

    const currentPort = window.location.port;
    const isSamePortAsFrontend =
      currentPort.length > 0 &&
      (url.port.length > 0 ? url.port === currentPort : currentPort === '80');
    const isMercurePath = url.pathname.endsWith('/.well-known/mercure');

    // Guard against local Docker misconfiguration where frontend port is used as Mercure hub port.
    if (isLoopbackHost && isSamePortAsFrontend && isMercurePath) {
      url.port = '3026';
    }

    return normalize(url.toString());
  } catch {
    return normalize(configured);
  }
}

function getMercurePublicUrl(): string {
  if (typeof window !== 'undefined') {
    return getBrowserMercurePublicUrl();
  }

  const configured =
    (hasUsableValue(process.env.MERCURE_PUBLIC_URL) && process.env.MERCURE_PUBLIC_URL) ||
    (hasUsableValue(process.env.NEXT_PUBLIC_MERCURE_PUBLIC_URL) && process.env.NEXT_PUBLIC_MERCURE_PUBLIC_URL) ||
    DEFAULT_MERCURE_PUBLIC_URL;

  return normalize(configured);
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId: string;
}

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;
  readonly requestId?: string;

  constructor({
    status,
    code,
    message,
    details,
    requestId,
  }: {
    status: number;
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  }) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

async function parseJsonSafely<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = /^https?:\/\//.test(path) ? path : `${getApiBaseUrl()}${path}`;
  const response = await fetch(url, init);

  if (!response.ok) {
    const apiError = await parseJsonSafely<ApiError>(response);
    const message =
      apiError?.error.message ??
      `Request failed with status ${response.status}.`;

    throw new ApiRequestError({
      status: response.status,
      code: apiError?.error.code ?? 'HTTP_ERROR',
      message,
      details: apiError?.error.details,
      requestId: apiError?.requestId,
    });
  }

  const payload = await parseJsonSafely<T>(response);
  if (payload === null) {
    throw new ApiRequestError({
      status: response.status,
      code: 'INVALID_JSON',
      message: 'Server returned an invalid JSON response.',
    });
  }

  return payload;
}

export type EventStatus = 'draft' | 'published' | 'archived';
export type EventSort = 'date_desc' | 'date_asc' | 'featured';

export interface ListEventsParams {
  q?: string;
  category?: string;
  featured?: boolean;
  status?: EventStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sort?: EventSort;
}

export interface ListEventsResponse {
  data: Event[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function listEvents(
  params: ListEventsParams = {},
  init?: RequestInit,
): Promise<ListEventsResponse> {
  const query = new URLSearchParams();

  if (params.q) query.set('q', params.q);
  if (params.category) query.set('category', params.category);
  if (typeof params.featured === 'boolean') {
    query.set('featured', String(params.featured));
  }
  if (params.status) query.set('status', params.status);
  if (params.dateFrom) query.set('dateFrom', params.dateFrom);
  if (params.dateTo) query.set('dateTo', params.dateTo);
  if (typeof params.page === 'number') query.set('page', String(params.page));
  if (typeof params.limit === 'number') query.set('limit', String(params.limit));
  if (params.sort) query.set('sort', params.sort);

  const queryString = query.toString();
  const suffix = queryString ? `?${queryString}` : '';
  return apiFetch<ListEventsResponse>(`/public-events${suffix}`, init);
}

export async function getEventBySlug(
  slug: string,
  init?: RequestInit,
): Promise<Event> {
  return apiFetch<Event>(`/public-events/${encodeURIComponent(slug)}`, init);
}

export async function getSeatCategoriesByEventSlug(
  slug: string,
  init?: RequestInit,
): Promise<SeatCategory[]> {
  return apiFetch<SeatCategory[]>(
    `/public-events/${encodeURIComponent(slug)}/seat-categories`,
    init,
  );
}

export async function getEventCategories(init?: RequestInit): Promise<string[]> {
  return apiFetch<string[]>('/public-events/categories', init);
}

export async function getVenueEventGrid(
  venueEventId: string,
  init?: RequestInit,
): Promise<ReturnType<typeof generateVenue>> {
  return apiFetch<ReturnType<typeof generateVenue>>(
    `${getTicketingApiBaseUrl()}/api/venues/${encodeURIComponent(venueEventId)}/grid`,
    init,
  );
}

export interface NewsletterSubscribeBody {
  email: string;
}

export interface VirtualQueueCheckResponse {
  allowed: boolean;
  status: 'waiting' | 'allowed';
  waitMs: number;
  remainingMs: number;
  key: string;
  stickySession?: boolean;
}

export interface ProceedCartResponse {
  bookingId: string;
  status: string;
}

export async function checkVirtualQueue(
  payload: {
    clientId?: string;
    eventId?: string;
    queueKey?: string;
  },
  init?: RequestInit,
): Promise<VirtualQueueCheckResponse> {
  return apiFetch<VirtualQueueCheckResponse>(`${getBoServiceBaseUrl()}/api/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(payload),
    ...init,
  });
}

export async function proceedCart(
  payload: {
    userId: string;
    venueId: string;
    seats: string[];
  },
  init?: RequestInit,
): Promise<ProceedCartResponse> {
  return apiFetch<ProceedCartResponse>(`${getBoServiceBaseUrl()}/api/cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(payload),
    ...init,
  });
}

export interface NewsletterSubscribeResponse {
  email: string;
  status: 'created' | 'existing' | 'reactivated';
}

export async function subscribeToNewsletter(
  body: NewsletterSubscribeBody,
  options?: {
    headers?: HeadersInit;
    locale?: string;
    signal?: AbortSignal;
  },
): Promise<NewsletterSubscribeResponse> {
  const headers = new Headers(options?.headers);
  headers.set('Content-Type', 'application/json');
  if (options?.locale) {
    headers.set('Accept-Language', options.locale);
  }

  return apiFetch<NewsletterSubscribeResponse>('/newsletter/subscriptions', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: options?.signal,
  });
}

export async function lockSeat(
  seatId: string,
  userId: string,
  venueId: string,
  init?: RequestInit,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(
    `${getTicketingApiBaseUrl()}/api/seats/${encodeURIComponent(seatId)}/lock`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      body: JSON.stringify({ userId, venueId }),
      ...init,
    },
  );
}

export async function releaseSeat(
  seatId: string,
  userId: string,
  venueId: string,
  init?: RequestInit,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(
    `${getTicketingApiBaseUrl()}/api/seats/${encodeURIComponent(seatId)}/release`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      body: JSON.stringify({ userId, venueId }),
      ...init,
    },
  );
}

export function connectMercure(
  venueId: string,
  onSeatUpdate: (seatId: string, status: string, lockedBy: string | null) => void,
): EventSource {
  const topic = encodeURIComponent(`http://localhost/venues/${venueId}/seats`);
  const eventSource = new EventSource(`${getMercurePublicUrl()}?topic=${topic}`);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as {
        seatId?: string;
        status?: string;
        lockedBy?: string | null;
      };

      if (data.seatId && data.status) {
        onSeatUpdate(data.seatId, data.status, data.lockedBy ?? null);
      }
    } catch {
      // Ignore malformed Mercure events.
    }
  };

  eventSource.onerror = () => {
    if (eventSource.readyState !== EventSource.CLOSED) {
      console.error('Mercure EventSource connection lost');
    }
  };

  return eventSource;
}
