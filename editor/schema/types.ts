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

export interface NoteMention {
  noteId: string;
  title: string;
  start: number;
  end: number;
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
  isOpen?: boolean;
  mentions?: NoteMention[];
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

export interface Note {
  id: string;
  title: string;
  blocks: Block[];
  topicId: string;
  subtopicId?: string;
  createdAt: Date;
  updatedAt: Date;
}
