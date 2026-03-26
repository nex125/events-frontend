export interface Event {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  longDescription?: string;
  datetimeUtc: string;
  location: string;
  image: string;
  category: string;
  tags: string[];
  duration?: string;
  ageRestriction?: string;
  importantInfo?: string;
  isMock: boolean;
  isFeatured?: boolean;
}

export interface SeatCategory {
  name: string;
  zone: string;
  price: number;
  currency: 'BYN';
  available: number;
  total: number;
}
