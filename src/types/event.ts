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
  datetimeEndUtc?: string;
  displayDateShort?: string;
  displayDateLong?: string;
  displayTime?: string;
  displayScheduleShort?: string;
  displayScheduleLong?: string;
  displayEndDateShort?: string;
  displayEndDateLong?: string;
  displayEndTime?: string;
  location: string;
  image: string;
  videoUrl?: string;
  category: string;
  organizerId?: string;
  organizerName?: string;
  organizerDescription?: string | null;
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
