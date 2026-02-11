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

export interface Mark {
  type: 'bold' | 'italic' | 'underline' | 'strike' | 'code' | 'superscript' | 'subscript' | 'highlight' | 'color';
  start: number;
  end: number;
  attrs?: {
    color?: string;
    backgroundColor?: string;
  };
}

export interface LinkMark {
  href: string;
  start: number;
  end: number;
  title?: string;
}

export interface InlineEmoji {
  start: number;
  end: number;
  attrs: Record<string, any>;
  text?: string;
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
  isOpen?: boolean;
  mentions?: NoteMention[];
  marks?: Mark[];
  links?: LinkMark[];
  emojis?: InlineEmoji[];
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  media?: MediaContent;
  math?: MathContent;
}

export type MenuGroup = 'Style' | 'Insert' | 'Upload' | 'Other'

export interface MenuItem {
  id: BlockType;
  label: string;
  icon: LucideIcon;
  shortcut?: string;
  description?: string;
  group?: MenuGroup;
}

export interface Coordinates {
  x: number;
  y: number;
}

export type CursorPosition = 'start' | 'end' | number;

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
