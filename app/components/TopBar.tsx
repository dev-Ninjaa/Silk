'use client';

import React from 'react';
import { Pin } from 'lucide-react';
import { ViewMode } from '@/app/types';

interface TopBarProps {
  viewMode?: ViewMode;
  categoryName?: string;
  subCategoryName?: string;
  noteName?: string;
  isPinned?: boolean;
  onTogglePin?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  viewMode,
  categoryName,
  subCategoryName,
  noteName,
  isPinned = false,
  onTogglePin
}) => {
  const getBreadcrumb = () => {
    if (!viewMode) return null;

    const parts: { text: string; muted?: boolean }[] = [
      { text: 'pulm', muted: true }
    ];

    switch (viewMode) {
      case 'home':
        parts.push({ text: 'all' });
        break;
      case 'recent':
        parts.push({ text: 'recent' });
        break;
      case 'pins':
        parts.push({ text: 'pins' });
        break;
      case 'bin':
        parts.push({ text: 'bin' });
        break;
      case 'library':
        parts.push({ text: 'library' });
        if (categoryName) {
          parts.push({ text: categoryName });
        }
        if (subCategoryName) {
          parts.push({ text: subCategoryName });
        }
        break;
      default:
        return null;
    }

    return (
      <div className="flex items-center gap-2 text-sm">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-stone-300">/</span>}
            <span className={part.muted ? 'text-stone-400' : 'text-stone-700'}>
              {part.text}
            </span>
          </React.Fragment>
        ))}
      </div>
    );
  };

  if (viewMode === 'settings' || viewMode === 'search') {
    return null;
  }

  return (
    <div className="h-12 border-b border-stone-200 bg-white flex items-center justify-between px-6">
      {getBreadcrumb()}
      
      {onTogglePin && (
        <button
          onClick={onTogglePin}
          className={`p-1.5 rounded-lg transition-colors ${
            isPinned 
              ? 'text-stone-700 bg-stone-100 hover:bg-stone-200' 
              : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
          }`}
          title={isPinned ? 'Unpin note' : 'Pin note'}
        >
          <Pin size={16} />
        </button>
      )}
    </div>
  );
};
