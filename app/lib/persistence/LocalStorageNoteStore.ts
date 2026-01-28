import { Note } from '@/app/types';
import { NoteStore } from './NoteStore';

const STORAGE_KEY = 'pulm-notes';

export class LocalStorageNoteStore implements NoteStore {
  async loadNotes(): Promise<Note[]> {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);
      
      return parsed.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
        lastOpenedAt: note.lastOpenedAt ? new Date(note.lastOpenedAt) : undefined,
        deletedAt: note.deletedAt ? new Date(note.deletedAt) : undefined
      }));
    } catch (error) {
      console.error('Failed to load notes from localStorage:', error);
      return [];
    }
  }

  async saveNotes(notes: Note[]): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const serialized = JSON.stringify(notes);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      console.error('Failed to save notes to localStorage:', error);
    }
  }
}
