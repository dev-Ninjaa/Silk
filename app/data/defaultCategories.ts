import { Category } from '@/app/types';

export const defaultCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Personal',
    color: '#3b82f6',
    createdAt: new Date('2025-01-01T00:00:00'),
    updatedAt: new Date('2025-01-01T00:00:00')
  },
  {
    id: 'cat-2',
    name: 'Work',
    color: '#8b5cf6',
    createdAt: new Date('2025-01-01T00:00:00'),
    updatedAt: new Date('2025-01-01T00:00:00')
  },
  {
    id: 'cat-3',
    name: 'Learning',
    color: '#10b981',
    createdAt: new Date('2025-01-01T00:00:00'),
    updatedAt: new Date('2025-01-01T00:00:00')
  }
];
