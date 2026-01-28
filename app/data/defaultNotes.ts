import { Note } from '@/app/types';

const generateId = () => Math.random().toString(36).substring(2, 11);

export const defaultNotes: Note[] = [
  {
    id: 'note-welcome',
    title: 'Welcome to Ditto',
    blocks: [
      { id: generateId(), type: 'h1', content: 'Welcome to Ditto' },
      { id: generateId(), type: 'text', content: 'This is your personal note-taking space. Start by creating a new note or exploring the categories on the left.' }
    ],
    categoryId: 'cat-1',
    createdAt: new Date('2025-01-01T00:00:00'),
    updatedAt: new Date('2025-01-01T00:00:00')
  }
];
