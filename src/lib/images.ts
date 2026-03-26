const EVENT_IMAGE_FALLBACK = '/images/event-placeholder.svg';

export function getEventImageSrc(src?: string): string {
  return src && src.trim().length > 0 ? src : EVENT_IMAGE_FALLBACK;
}
