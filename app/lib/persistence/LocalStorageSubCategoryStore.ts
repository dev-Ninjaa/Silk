import { SubCategory } from '@/app/types';
import { SubCategoryStore } from './SubCategoryStore';

const STORAGE_KEY = 'pulm-subcategories';

export class LocalStorageSubCategoryStore implements SubCategoryStore {
  async loadSubCategories(): Promise<SubCategory[]> {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);
      
      return parsed.map((subCategory: any) => ({
        ...subCategory,
        createdAt: new Date(subCategory.createdAt)
      }));
    } catch (error) {
      console.error('Failed to load sub-categories from localStorage:', error);
      return [];
    }
  }

  async saveSubCategories(subCategories: SubCategory[]): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const serialized = JSON.stringify(subCategories);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      console.error('Failed to save sub-categories to localStorage:', error);
    }
  }
}
