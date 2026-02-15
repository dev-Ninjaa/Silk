import { describe, it, expect } from 'vitest';
import { createNoteStore, createCategoryStore } from '../storeFactory';

describe('Store Factory', () => {
  it('should always create Tauri stores (SQLite database)', () => {
    const noteStore = createNoteStore();
    const categoryStore = createCategoryStore();
    
    expect(noteStore.constructor.name).toBe('TauriNoteStore');
    expect(categoryStore.constructor.name).toBe('TauriCategoryStore');
  });
});
