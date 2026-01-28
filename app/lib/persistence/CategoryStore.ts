import { Category } from '@/app/types';

export interface CategoryStore {
  loadCategories(): Promise<Category[]>;
  saveCategories(categories: Category[]): Promise<void>;
}
