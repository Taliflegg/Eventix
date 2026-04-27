export type EventTemplateType = 'party' | 'birth' | 'army';

export interface EventTemplate {
  title: string;
  description: string;
  location: string;
  datetime: string;
  language: string;
  mealType: string;
  expectedCount: number;
  isLimited: boolean;
}

export const eventTemplates: Record<EventTemplateType, EventTemplate> = {
  party: {
    title: 'Party Example',
    description: 'A fun party event template.',
    location: 'Club XYZ',
    datetime: '2025-08-01T20:00',
    language: 'en',
    mealType: 'bbq',
    expectedCount: 50,
    isLimited: false,
  },
  birth: {
    title: 'Birth Example',
    description: 'A birth celebration template.',
    location: 'Home',
    datetime: '2025-09-10T18:00',
    language: 'en',
    mealType: 'dairy',
    expectedCount: 20,
    isLimited: false,
  },
  army: {
    title: 'Army Example',
    description: 'Army event template.',
    location: 'Base Alpha',
    datetime: '2025-07-20T19:00',
    language: 'en',
    mealType: 'meat',
    expectedCount: 100,
    isLimited: true,
  },
//   chabat: {
//     title: 'Chabat Example',
//     description: 'Chabat dinner template.',
//     location: 'Synagogue',
//     datetime: '2025-07-18T21:00',
//     language: 'he',
//     mealType: 'kosher',
//     expectedCount: 30,
//     isLimited: false,
//   },
};