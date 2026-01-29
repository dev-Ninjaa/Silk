import { SubCategory } from '@/app/types';

export interface SubCategoryStore {
  loadSubCategories(): Promise<SubCategory[]>;
  saveSubCategories(subCategories: SubCategory[]): Promise<void>;
}
