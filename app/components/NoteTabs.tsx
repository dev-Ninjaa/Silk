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

export const NoteTabs: React.FC<NoteTabsProps> = ({
  openNotes,
  currentNoteId,
  onSelectNote,
  onCloseTab
}) => {
  if (openNotes.length === 0) {
    return null;
  }

  return (
    <>
      <style jsx>{`
        .tabs-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="flex items-end w-full">
        <div 
          className="tabs-container flex items-end gap-0 relative overflow-x-auto overflow-y-hidden"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          } as React.CSSProperties}
        >
        {openNotes.map((note) => {
          const isActive = note.id === currentNoteId;

          return (
            <button
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className={`
                group relative 
                flex items-center gap-2.5 
                px-5 py-2.5
                text-sm font-medium tracking-tight
                transition-all duration-200 ease-out
                rounded-t-2xl
                ${isActive 
                  ? 'z-20 bg-white text-blue-700 shadow-sm' 
                  : 'z-10 bg-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-800'}
                ${isActive ? '-mb-[2px] pb-[12px] pt-[10px]' : 'pb-2.5 mb-0 mt-1'}
              `}
              style={{
                WebkitFontSmoothing: 'antialiased',
              }}
            >
              <span className={`truncate max-w-[120px] md:max-w-[200px] ${isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`}>
                {note.title || 'Untitled'}
              </span>

              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(note.id);
                }}
                className={`
                  flex items-center justify-center
                  w-4 h-4 rounded-full
                  transition-all duration-200
                  cursor-pointer
                  ${isActive 
                    ? 'opacity-60 hover:opacity-100 hover:bg-blue-100' 
                    : 'opacity-40 hover:opacity-100 hover:bg-stone-300'}
                `}
                title="Close tab"
              >
                <X size={12} strokeWidth={2.5} />
              </span>

              {/* Flare Effects for Active Tab */}
              {isActive && (
                <>
                  {/* Left Flare */}
                  <div className="absolute bottom-0 -left-4 w-4 h-4 pointer-events-none">
                    <div className="w-full h-full bg-transparent rounded-br-2xl shadow-[8px_0_0_0_white]"></div>
                  </div>
                  
                  {/* Right Flare */}
                  <div className="absolute bottom-0 -right-4 w-4 h-4 pointer-events-none">
                    <div className="w-full h-full bg-transparent rounded-bl-2xl shadow-[-8px_0_0_0_white]"></div>
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
    </>
  );
};
