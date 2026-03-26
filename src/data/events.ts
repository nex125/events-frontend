import type { Event } from '@/types/event';

export const events: Event[] = [
  {
    id: '1',
    slug: 'nocturne-elite',
    title: 'Nocturne Elite',
    subtitle: 'Три эксклюзивных вечера в зале Obsidian Hall',
    description:
      'Лучший звук и уникальная атмосфера. Три эксклюзивных вечера в зале Obsidian Hall с участием лучших исполнителей неоклассики.',
    longDescription:
      'Испытайте пересечение истории и футуризма. Nocturne Elite привносит фирменную технологию пространственного звука, превращая концертный зал в храм частоты. Три вечера, три уникальные программы — от камерных сонат до масштабных оркестровых произведений. Каждый концерт — отдельная история, рассказанная языком звука и света.',
    datetimeUtc: '2026-05-15T16:00:00Z',
    location: 'Минск, Беларусь',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&q=80',
    category: 'Классика',
    tags: ['неоклассика', 'оркестр', 'премиум'],
    duration: '140 минут',
    ageRestriction: '12+',
    importantInfo:
      'Вход строго за 45 минут до начала. Возрастное ограничение: 12+. Запрещена профессиональная фотосъемка. Билеты не подлежат возврату.',
    isMock: false,
    isFeatured: true,
  },
  {
    id: '2',
    slug: 'resonance-minsk',
    title: 'Resonance Minsk',
    subtitle: 'Электронная музыка в индустриальном пространстве',
    description:
      'Современные ритмы и глубокий техно-саунд в уникальном индустриальном пространстве Минска.',
    longDescription:
      'Resonance Minsk — это больше, чем концерт. Это иммерсивное путешествие в мир электронной музыки, где каждый звук обретает физическую форму. Уникальная световая инсталляция, пространственный звук и лайнап из ведущих европейских артистов создают атмосферу, которую невозможно повторить.',
    datetimeUtc: '2026-06-21T18:00:00Z',
    location: 'Минск, Беларусь',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80',
    category: 'Электроника',
    tags: ['техно', 'электроника', 'рейв'],
    duration: '6 часов',
    ageRestriction: '18+',
    importantInfo:
      'Дресс-код: свободный. Вход с 20:00. Возрастное ограничение: 18+. На территории работает бар и фудкорт.',
    isMock: false,
    isFeatured: true,
  },
  {
    id: '3',
    slug: 'avant-garde-evening',
    title: 'Авангардный вечер',
    subtitle: 'Современное искусство встречает живую музыку',
    description:
      'Вечер современного искусства с живой музыкой, перформансами и интерактивными инсталляциями.',
    longDescription:
      'Авангардный вечер объединяет современное визуальное искусство и живую музыку в едином пространстве. Интерактивные инсталляции, перформансы и концертная программа — всё это создаёт уникальный опыт на стыке дисциплин.',
    datetimeUtc: '2026-07-08T15:30:00Z',
    location: 'Минск, Беларусь',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80',
    category: 'Искусство',
    tags: ['перформанс', 'инсталляция', 'живая музыка'],
    duration: '4 часа',
    ageRestriction: '16+',
    isMock: false,
    isFeatured: true,
  },
  {
    id: '4',
    slug: 'winter-season-placeholder',
    title: 'Зимний сезон',
    subtitle: 'Анонс в ноябре',
    description: 'Скоро в продаже. Следите за обновлениями.',
    datetimeUtc: '2026-12-01T16:00:00Z',
    location: 'Минск, Беларусь',
    image: '',
    category: 'Классика',
    tags: [],
    isMock: true,
  },
  {
    id: '5',
    slug: 'closed-show-placeholder',
    title: 'Закрытый показ',
    subtitle: 'Только по приглашениям',
    description: 'Эксклюзивное мероприятие для участников Inner Circle.',
    datetimeUtc: '2026-11-15T17:00:00Z',
    location: 'Минск, Беларусь',
    image: '',
    category: 'Мода',
    tags: [],
    isMock: true,
  },
  {
    id: '6',
    slug: 'new-year-special-placeholder',
    title: 'Новогодний спецвыпуск',
    subtitle: 'Декабрь 2026',
    description: 'Праздничная программа. Подробности скоро.',
    datetimeUtc: '2026-12-31T19:00:00Z',
    location: 'Минск, Беларусь',
    image: '',
    category: 'Вечера',
    tags: [],
    isMock: true,
  },
];

export function getEventBySlug(slug: string): Event | undefined {
  return events.find((e) => e.slug === slug);
}

export function getFeaturedEvents(): Event[] {
  return events.filter((e) => e.isFeatured && !e.isMock);
}

export function getRealEvents(): Event[] {
  return events.filter((e) => !e.isMock);
}

export function getAllEvents(): Event[] {
  return events;
}
