import { LucideIcon } from 'lucide-react';

export type BlockType = 
  | 'text' 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'bullet-list' 
  | 'numbered-list' 
  | 'todo' 
  | 'toggle' 
  | 'quote' 
  | 'code' 
  | 'divider' 
  | 'table';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
  isOpen?: boolean;
}

export interface MenuItem {
  id: BlockType;
  label: string;
  icon: LucideIcon;
  shortcut?: string;
  description?: string;
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  blocks: Block[];
  categoryId: string;
  isPinned?: boolean;
  lastOpenedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
}

export type ViewMode = 'home' | 'library' | 'recent' | 'pins' | 'settings' | 'bin' | 'search';

export interface DailyReflection {
  date: string; // YYYY-MM-DD
  text?: string;
  noteIds: string[];
}

