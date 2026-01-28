import { DailyReflection } from '@/app/types';
import { ReflectionStore } from './ReflectionStore';

const STORAGE_KEY = 'ditto-reflections';

export class LocalStorageReflectionStore implements ReflectionStore {
  async loadReflections(): Promise<DailyReflection[]> {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return [];
      }

      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load reflections from localStorage:', error);
      return [];
    }
  }

  async saveReflections(reflections: DailyReflection[]): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const serialized = JSON.stringify(reflections);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      console.error('Failed to save reflections to localStorage:', error);
    }
  }
}
