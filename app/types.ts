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
  | 'table'
  | 'image'
  | 'video'
  | 'audio'
  | 'asset'
  | 'math'
  | 'mention'
  | 'emoji';

export interface MediaContent {
  type: 'image' | 'video' | 'audio';
  src: string;
  alt?: string;
  caption?: string;
  assetId?: string;
}

export interface MathContent {
  expression: string;
  format: 'latex' | 'inline';
}

export interface NoteMention {
  noteId: string;
  title: string;
  start: number;
  end: number;
}

export interface AssetMention {
  assetId: string;
  name: string;
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
  assetMentions?: AssetMention[];
  media?: MediaContent;
  math?: MathContent;
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
  icon?: string;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
  icon?: string;
  createdAt: Date;
}

export interface Note {
  id: string;
  title: string;
  blocks: Block[];
  categoryId: string;
  subCategoryId?: string;
  isPinned?: boolean;
  isDefault?: boolean;
  lastOpenedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
}

export type AssetType = 'pdf' | 'docx' | 'markdown' | 'image' | 'text' | 'link' | 'video' | 'audio';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  categoryId: string;
  subCategoryId?: string;
  isDefault?: boolean;
  source: 
    | { kind: 'file'; dataUrl: string }
    | { kind: 'link'; url: string };
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
