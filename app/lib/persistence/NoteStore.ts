import { Note } from '@/app/types';

export interface NoteStore {
  loadNotes(): Promise<Note[]>;
  saveNotes(notes: Note[]): Promise<void>;
}
