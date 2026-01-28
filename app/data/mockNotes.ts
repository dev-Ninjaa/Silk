import { Note } from '@/app/types';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const mockNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Introduction to Neural Networks',
    blocks: [
      { id: generateId(), type: 'text', content: 'Neural networks are computing systems inspired by biological neural networks.' }
    ],
    topicId: '3',
    subtopicId: '3-2',
    createdAt: new Date('2025-01-15T10:00:00'),
    updatedAt: new Date('2025-01-15T10:00:00')
  },
  {
    id: 'note-2',
    title: 'Transformer Architecture',
    blocks: [
      { id: generateId(), type: 'h1', content: 'Transformer Architecture' },
      { id: generateId(), type: 'text', content: 'The transformer architecture revolutionized natural language processing.' }
    ],
    topicId: '4',
    subtopicId: '4-4',
    createdAt: new Date('2025-01-20T14:30:00'),
    updatedAt: new Date('2025-01-20T14:30:00')
  },
  {
    id: 'note-3',
    title: 'Deep Learning Basics',
    blocks: [
      { id: generateId(), type: 'text', content: 'Deep learning is a subset of machine learning based on artificial neural networks.' }
    ],
    topicId: '3',
    subtopicId: '3-2',
    createdAt: new Date('2025-01-28T09:00:00'),
    updatedAt: new Date('2025-01-28T09:00:00')
  },
  {
    id: 'note-4',
    title: 'Attention Mechanisms',
    blocks: [
      { id: generateId(), type: 'h2', content: 'Attention Mechanisms' },
      { id: generateId(), type: 'text', content: 'Attention allows models to focus on relevant parts of the input.' }
    ],
    topicId: '4',
    subtopicId: '4-3',
    createdAt: new Date('2025-01-22T11:00:00'),
    updatedAt: new Date('2025-01-22T11:00:00')
  },
  {
    id: 'note-5',
    title: 'Computer Vision Overview',
    blocks: [
      { id: generateId(), type: 'text', content: 'Computer vision enables machines to interpret visual information.' }
    ],
    topicId: '4',
    subtopicId: '4-2',
    createdAt: new Date('2025-01-18T15:30:00'),
    updatedAt: new Date('2025-01-18T15:30:00')
  },
  {
    id: 'note-6',
    title: 'Graph Theory Fundamentals',
    blocks: [
      { id: generateId(), type: 'text', content: 'Graphs consist of nodes and edges representing relationships.' }
    ],
    topicId: '3',
    subtopicId: '3-1',
    createdAt: new Date('2025-01-10T08:00:00'),
    updatedAt: new Date('2025-01-10T08:00:00')
  },
  {
    id: 'note-7',
    title: 'Semantic Networks',
    blocks: [
      { id: generateId(), type: 'text', content: 'Semantic networks represent knowledge as interconnected concepts.' }
    ],
    topicId: '3',
    subtopicId: '3-1',
    createdAt: new Date('2025-01-12T14:00:00'),
    updatedAt: new Date('2025-01-12T14:00:00')
  },
  {
    id: 'note-8',
    title: 'Encryption Basics',
    blocks: [
      { id: generateId(), type: 'text', content: 'Encryption protects data by converting it into unreadable format.' }
    ],
    topicId: '3',
    subtopicId: '3-3',
    createdAt: new Date('2025-01-25T10:30:00'),
    updatedAt: new Date('2025-01-25T10:30:00')
  }
];

