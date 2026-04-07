import type { Event, SeatCategory } from '@/types/event';

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8080/api/v1/public';

declare const process:
  {
    env: {
      NEXT_PUBLIC_API_BASE_URL?: string;
      API_BASE_URL?: string;
    };
  };

function normalize(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function getBrowserApiBaseUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    DEFAULT_API_BASE_URL;

  try {
    const url = new URL(configured);
    const isLoopbackHost =
      url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const isCurrentLoopback =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (isLoopbackHost && isCurrentLoopback) {
      url.hostname = window.location.hostname;
    }

    return normalize(url.toString());
  } catch {
    return normalize(configured);
  }
}

function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return getBrowserApiBaseUrl();
  }

  const configured =
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    DEFAULT_API_BASE_URL;

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
  const response = await fetch(`${getApiBaseUrl()}${path}`, init);

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
  return apiFetch<ListEventsResponse>(`/events${suffix}`, init);
}

export async function getEventBySlug(
  slug: string,
  init?: RequestInit,
): Promise<Event> {
  return apiFetch<Event>(`/events/${encodeURIComponent(slug)}`, init);
}

export async function getSeatCategoriesByEventSlug(
  slug: string,
  init?: RequestInit,
): Promise<SeatCategory[]> {
  return apiFetch<SeatCategory[]>(
    `/events/${encodeURIComponent(slug)}/seat-categories`,
    init,
  );
}

export async function getEventCategories(init?: RequestInit): Promise<string[]> {
  return apiFetch<string[]>('/events/categories', init);
}

export interface NewsletterSubscribeBody {
  email: string;
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
