'use client';

import React from 'react';
import { Note, Category } from '@/app/types';
import { Pin } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  category?: Category;
  onContextMenu: (e: React.MouseEvent) => void;
  onClick?: () => void;
  showDeletedDate?: boolean;
}

const CARD_COLORS = [
  '#E3E0D9', // Warm beige
  '#D9E3E0', // Sage green
  '#E0D9E3', // Lavender
  '#E3DDD9', // Warm gray
  '#D9E0E3', // Sky blue
  '#E3E0DC', // Cream
  '#DDE3D9', // Mint
  '#E3D9DD', // Rose
];

export const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  category, 
  onContextMenu,
  onClick,
  showDeletedDate = false
}) => {
  const getPreviewText = (): string => {
    const textBlock = note.blocks.find(b => b.type === 'text' && b.content);
    return textBlock?.content || '';
  };

  const getCardColor = (): string => {
    // Use note ID to consistently assign a color
    const hash = note.id.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return CARD_COLORS[Math.abs(hash) % CARD_COLORS.length];
  };

  const preview = getPreviewText();
  const displayDate = showDeletedDate ? note.deletedAt : note.updatedAt;

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className="aspect-[3.8/5] rounded-[12px] sm:rounded-[14px] p-3 sm:p-4 md:p-5 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group relative overflow-hidden"
      style={{ backgroundColor: getCardColor() }}
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/40"></div>
      
      <div>
        <div className="flex items-start gap-1.5 sm:gap-2 mb-2 sm:mb-3 text-[10px] sm:text-[11px] font-medium tracking-wide">
          <span className="px-1 sm:px-1.5 py-0.5 bg-stone-900/5 rounded text-stone-600 whitespace-nowrap flex-shrink-0">
            {displayDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          {category && (
            <span className="py-0.5 text-stone-500 truncate text-[9px] sm:text-[11px]">{category.name}</span>
          )}
          {note.isPinned && (
            <Pin size={9} className="text-stone-400 ml-auto flex-shrink-0 sm:w-[10px] sm:h-[10px]" />
          )}
        </div>
        
        <h3 className="font-serif text-[18px] sm:text-[20px] md:text-[22px] text-stone-900 leading-[1.15] mb-1 sm:mb-1.5 line-clamp-3">
          {note.title}
        </h3>
        
        {preview && (
          <p className="text-[12px] sm:text-[13px] text-stone-500 line-clamp-2">
            {preview}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-1 text-[11px] sm:text-[12px] text-stone-400">
        {category && (
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: category.color }}
          />
        )}
      </div>
    </div>
  );
};
