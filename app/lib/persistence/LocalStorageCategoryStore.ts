import { Category } from '@/app/types';
import { CategoryStore } from './CategoryStore';

const STORAGE_KEY = 'ditto-categories';

export class LocalStorageCategoryStore implements CategoryStore {
  async loadCategories(): Promise<Category[]> {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);
      
      return parsed.map((category: any) => ({
        ...category,
        createdAt: new Date(category.createdAt),
        updatedAt: new Date(category.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to load categories from localStorage:', error);
      return [];
    }
  }

  async saveCategories(categories: Category[]): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const serialized = JSON.stringify(categories);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      console.error('Failed to save categories to localStorage:', error);
    }
  }
}
