'use client';

export type WidgetStage = 'validating' | 'loading-assets' | 'initializing' | 'ready' | 'error';

export type WidgetConfig = {
  scriptUrls: string[];
  cssUrls: string[];
};

export type WidgetInitPayload = {
  mountNode: HTMLElement;
  sourceEventId: number;
  bookingId?: string;
  ticketId?: string;
};

type WidgetApi = {
  mount?: (payload: WidgetInitPayload) => unknown;
  init?: (payload: WidgetInitPayload) => unknown;
  open?: (payload: WidgetInitPayload) => unknown;
};

declare global {
  interface Window {
    TicketokWidget?: WidgetApi;
    ticketokWidget?: WidgetApi;
    openModal?: (trigger: HTMLElement) => unknown;
  }
}

const DEFAULT_WIDGET_SCRIPT_URL = 'https://widget.ticketok.by/3.0.0/main.min.js';
const DEFAULT_WIDGET_CSS_URL = 'https://widget.ticketok.by/3.0.0/main.min.css';
const DEFAULT_GATEWAY_SCRIPT_URL = 'https://js.bepaid.by/widget/be_gateway.js';

function stripWrappingQuotes(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length >= 2) {
    const first = trimmed[0];
    const last = trimmed[trimmed.length - 1];
    if ((first === '"' && last === '"') || (first === '\'' && last === '\'')) {
      return trimmed.slice(1, -1).trim();
    }
  }

  return trimmed;
}

function normalizeExtractedUrl(value: string): string {
  return stripWrappingQuotes(value).replace(/^['"]+|['"]+$/g, '').trim();
}

function extractUrls(raw: string, tagName: 'script' | 'link'): string[] {
  const trimmed = stripWrappingQuotes(raw);
  if (trimmed.length === 0) {
    return [];
  }

  const attributeName = tagName === 'script' ? 'src' : 'href';
  const pattern = new RegExp(`${attributeName}=["']?([^"'\\s>]+)`, 'gi');
  const matches = Array.from(trimmed.matchAll(pattern))
    .map((match) => normalizeExtractedUrl(match[1] ?? ''))
    .filter((value) => value.length > 0);

  if (matches.length > 0) {
    return matches;
  }

  return trimmed
    .split(/[\s,]+/)
    .map((value) => normalizeExtractedUrl(value))
    .filter((value) => /^https?:\/\//i.test(value));
}

function dedupeUrls(urls: string[]): string[] {
  return Array.from(new Set(urls.filter((url) => url.trim().length > 0)));
}

export function resolveWidgetConfig(): WidgetConfig {
  const configuredScriptUrls = extractUrls(
    process.env.NEXT_PUBLIC_TICKETOK_WIDGET_SCRIPT_URL?.trim() ?? '',
    'script',
  );
  const configuredCssUrls = extractUrls(
    process.env.NEXT_PUBLIC_TICKETOK_WIDGET_CSS_URL?.trim() ?? '',
    'link',
  );

  const scriptUrls = dedupeUrls([
    DEFAULT_GATEWAY_SCRIPT_URL,
    ...configuredScriptUrls,
    DEFAULT_WIDGET_SCRIPT_URL,
  ]);
  const cssUrls = dedupeUrls([...configuredCssUrls, DEFAULT_WIDGET_CSS_URL]);

  return {
    scriptUrls,
    cssUrls,
  };
}

function getTicketokWidgetApi(): WidgetApi | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.TicketokWidget ?? window.ticketokWidget ?? null;
}

export function ensureStylesheet(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLLinkElement>(`link[data-ticketok-widget-css="${href}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }

      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Failed to load stylesheet: ${href}`)), { once: true });
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.ticketokWidgetCss = href;
    link.addEventListener(
      'load',
      () => {
        link.dataset.loaded = 'true';
        resolve();
      },
      { once: true },
    );
    link.addEventListener('error', () => reject(new Error(`Failed to load stylesheet: ${href}`)), { once: true });
    document.head.appendChild(link);
  });
}

export function ensureScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-ticketok-widget-script="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }

      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.ticketokWidgetScript = src;
    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true';
        resolve();
      },
      { once: true },
    );
    script.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)), { once: true });
    document.body.appendChild(script);
  });
}

function prepareMountNode(payload: WidgetInitPayload): void {
  const mountNode = payload.mountNode;
  mountNode.innerHTML = '';
  mountNode.dataset.eventId = String(payload.sourceEventId);
  mountNode.dataset.ticketId = payload.ticketId?.trim() || '0';
  if (payload.bookingId?.trim()) {
    mountNode.dataset.bookingId = payload.bookingId;
  } else {
    delete mountNode.dataset.bookingId;
  }
}

export function tryOpenModal(payload: WidgetInitPayload): boolean {
  if (typeof window === 'undefined' || typeof window.openModal !== 'function') {
    return false;
  }

  prepareMountNode(payload);

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.hidden = true;
  trigger.dataset.eventId = String(payload.sourceEventId);
  trigger.dataset.ticketId = payload.ticketId?.trim() || '0';
  if (payload.bookingId?.trim()) {
    trigger.dataset.bookingId = payload.bookingId;
  }

  payload.mountNode.appendChild(trigger);
  window.openModal(trigger);
  return true;
}

export function tryInitializeWidget(payload: WidgetInitPayload): boolean {
  if (tryOpenModal(payload)) {
    return true;
  }

  const api = getTicketokWidgetApi();
  prepareMountNode(payload);

  if (!api) {
    return false;
  }

  if (typeof api.mount === 'function') {
    api.mount(payload);
    return true;
  }

  if (typeof api.init === 'function') {
    api.init(payload);
    return true;
  }

  if (typeof api.open === 'function') {
    api.open(payload);
    return true;
  }

  return false;
}

function detectRenderedWidget(mountNode: HTMLElement): boolean {
  if (mountNode.childElementCount > 0) {
    return true;
  }

  return Boolean(
    document.querySelector('iframe[src*="ticketok"]') ||
    document.querySelector('iframe[src*="bepaid"]') ||
    document.querySelector('form[action*="bepaid"]') ||
    document.querySelector('[class*="ticketok"]'),
  );
}

export function waitForWidgetRender(mountNode: HTMLElement, timeoutMs = 5000): Promise<boolean> {
  if (detectRenderedWidget(mountNode)) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (!detectRenderedWidget(mountNode)) {
        return;
      }

      window.clearTimeout(timeoutId);
      observer.disconnect();
      resolve(true);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    const timeoutId = window.setTimeout(() => {
      observer.disconnect();
      resolve(detectRenderedWidget(mountNode));
    }, timeoutMs);
  });
}
