// The learning path. "minLevel" decides which units are unlocked for a new player.
export const LEVEL_RANK = { beginner: 0, some: 1, advanced: 2 }

export const UNITS = [
  {
    id: 'alphabet',
    title: 'Alphabet',
    blurb: 'Fingerspell A to Z',
    minLevel: 'beginner',
    lessons: ['A-E', 'F-J', 'K-O', 'P-T', 'U-Z'],
  },
  {
    id: 'numbers',
    title: 'Numbers',
    blurb: 'Count from 0 to 9',
    minLevel: 'beginner',
    lessons: ['0-3', '4-6', '7-9'],
  },
  {
    id: 'words',
    title: 'Words',
    blurb: 'Greetings and everyday words',
    minLevel: 'some',
    lessons: ['Hello and bye', 'Family', 'Food', 'Feelings'],
  },
  {
    id: 'sentences',
    title: 'Sentences',
    blurb: 'Full conversations',
    minLevel: 'advanced',
    lessons: ['Introduce yourself', 'Ask a question', 'Small talk'],
  },
]

export const isUnitUnlocked = (unit, level) =>
  LEVEL_RANK[level ?? 'beginner'] >= LEVEL_RANK[unit.minLevel]

export const lessonId = (unit, i) => `${unit.id}-${i}`