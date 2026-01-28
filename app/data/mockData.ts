import { Topic } from '@/app/types';

export const mockTopics: Topic[] = [
  {
    id: '1',
    name: 'Economics',
    color: '#9333ea',
    noteCount: 18,
    subtopics: []
  },
  {
    id: '2',
    name: 'Psychology',
    color: '#eab308',
    noteCount: 22,
    subtopics: []
  },
  {
    id: '3',
    name: 'Computer Science',
    color: '#3b82f6',
    noteCount: 58,
    subtopics: [
      { id: '3-1', name: 'Knowledge graphs', topicId: '3', noteCount: 2 },
      { id: '3-2', name: 'Machine learning', topicId: '3', noteCount: 39 },
      { id: '3-3', name: 'Cyber security', topicId: '3', noteCount: 1 }
    ]
  },
  {
    id: '4',
    name: 'AI',
    color: '#84cc16',
    noteCount: 26,
    subtopics: [
      { id: '4-1', name: 'Agents', topicId: '4', noteCount: 0 },
      { id: '4-2', name: 'Vision', topicId: '4', noteCount: 1 },
      { id: '4-3', name: 'LLMs', topicId: '4', noteCount: 27 },
      { id: '4-4', name: 'Transformers', topicId: '4', noteCount: 1 }
    ]
  },
  {
    id: '5',
    name: 'Bioinformatics',
    color: '#f97316',
    noteCount: 8,
    subtopics: [
      { id: '5-1', name: 'Biotech', topicId: '5', noteCount: 3 },
      { id: '5-2', name: 'Virtual cells', topicId: '5', noteCount: 4 }
    ]
  },
  {
    id: '6',
    name: 'Neuroscience',
    color: '#c084fc',
    noteCount: 3,
    subtopics: []
  },
  {
    id: '7',
    name: 'Webpages',
    color: '#1f2937',
    noteCount: 12,
    subtopics: []
  },
  {
    id: '8',
    name: 'Biology',
    color: '#22c55e',
    noteCount: 15,
    subtopics: []
  },
  {
    id: '9',
    name: 'Sort',
    color: '#eab308',
    noteCount: 36,
    subtopics: []
  },
  {
    id: '10',
    name: 'Creativity',
    color: '#78350f',
    noteCount: 18,
    subtopics: []
  },
  {
    id: '11',
    name: 'Physics',
    color: '#7c3aed',
    noteCount: 4,
    subtopics: []
  },
  {
    id: '12',
    name: 'Hardware',
    color: '#a78bfa',
    noteCount: 2,
    subtopics: []
  },
  {
    id: '13',
    name: 'Probability',
    color: '#c084fc',
    noteCount: 2,
    subtopics: []
  }
];
