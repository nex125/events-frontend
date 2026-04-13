export interface Event {
  id: string;
  venueId?: string;
  venueEventId?: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  longDescription?: string;
  datetimeUtc: string;
  location: string;
  image: string;
  videoUrl?: string;
  category: string;
  tags: string[];
  duration?: string;
  ageRestriction?: string;
  importantInfo?: string;
  isFeatured?: boolean;
}

export interface SeatCategory {
  name: string;
  color: string;
  price: number;
  currency: 'BYN';
  available: number;
  total: number;
}
