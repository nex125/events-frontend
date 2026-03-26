import type { SeatCategory } from '@/types/event';

const mockSeatData: Record<string, SeatCategory[]> = {
  'nocturne-elite': [
    { name: 'VIP Партер', zone: 'Зона A', price: 450, currency: 'BYN', available: 8, total: 30 },
    { name: 'Партер', zone: 'Зона B', price: 280, currency: 'BYN', available: 24, total: 60 },
    { name: 'Балкон', zone: 'Зона C', price: 150, currency: 'BYN', available: 42, total: 80 },
  ],
  'resonance-minsk': [
    { name: 'Front Stage', zone: 'Зона A', price: 180, currency: 'BYN', available: 15, total: 50 },
    { name: 'Main Floor', zone: 'Зона B', price: 120, currency: 'BYN', available: 87, total: 200 },
    { name: 'Balcony Lounge', zone: 'Зона C', price: 90, currency: 'BYN', available: 34, total: 60 },
  ],
  'avant-garde-evening': [
    { name: 'Премиум', zone: 'Зона A', price: 200, currency: 'BYN', available: 12, total: 20 },
    { name: 'Стандарт', zone: 'Зона B', price: 100, currency: 'BYN', available: 45, total: 80 },
  ],
};

export async function fetchSeatInfo(eventSlug: string): Promise<SeatCategory[]> {
  await new Promise((r) => setTimeout(r, 100));
  return mockSeatData[eventSlug] ?? [];
}
