'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Note } from '@/app/types';

interface NoteTabsProps {
  openNotes: Note[];
  currentNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onCloseTab: (noteId: string) => void;
}

const TAB_COLORS = [
  'bg-blue-100 hover:bg-blue-200 text-blue-900',
  'bg-purple-100 hover:bg-purple-200 text-purple-900',
  'bg-pink-100 hover:bg-pink-200 text-pink-900',
  'bg-orange-100 hover:bg-orange-200 text-orange-900',
  'bg-green-100 hover:bg-green-200 text-green-900',
  'bg-yellow-100 hover:bg-yellow-200 text-yellow-900',
  'bg-red-100 hover:bg-red-200 text-red-900',
  'bg-indigo-100 hover:bg-indigo-200 text-indigo-900',
];

export const NoteTabs: React.FC<NoteTabsProps> = ({
  openNotes,
  currentNoteId,
  onSelectNote,
  onCloseTab
}) => {
  if (openNotes.length === 0) {
    return null;
  }

  const getTabColor = (index: number) => {
    return TAB_COLORS[index % TAB_COLORS.length];
  };

  return (
    <div className="border-b border-stone-200 bg-gradient-to-r from-stone-50 via-stone-50 to-white sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        {openNotes.map((note, index) => {
          const isActive = note.id === currentNoteId;
          const colorClass = getTabColor(index);
          
          return (
            <div
              key={note.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all cursor-pointer group font-medium text-sm whitespace-nowrap border border-transparent ${
                colorClass
              } ${isActive ? 'ring-2 ring-offset-1 ring-stone-300 shadow-md' : 'shadow-sm'}`}
              onClick={() => onSelectNote(note.id)}
            >
              <span className="truncate max-w-[150px] md:max-w-[250px]">
                {note.title || 'Untitled'}
              </span>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(note.id);
                }}
                className="flex-shrink-0 p-0.5 rounded-full hover:bg-black/10 transition-colors opacity-0 group-hover:opacity-100"
                title="Close tab"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
