import { DailyReflection } from '@/app/types';

export interface ReflectionStore {
  loadReflections(): Promise<DailyReflection[]>;
  saveReflections(reflections: DailyReflection[]): Promise<void>;
}
