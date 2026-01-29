'use client';

import React, { useState } from 'react';
import { Note, Category } from '@/app/types';
import { NoteContextMenu } from './NoteContextMenu';
import { NoteCard } from './NoteCard';

interface RecentViewProps {
  notes: Note[];
  categories: Category[];
  onSelectNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
}

export const RecentView: React.FC<RecentViewProps> = ({ 
  notes, 
  categories, 
  onSelectNote,
  onDeleteNote,
  onTogglePin
}) => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    noteId: string;
  } | null>(null);

  const activeNotes = notes.filter(n => !n.isDeleted);
  
  const recentNotes = activeNotes
    .filter(n => n.lastOpenedAt)
    .sort((a, b) => {
      const dateA = a.lastOpenedAt?.getTime() || 0;
      const dateB = b.lastOpenedAt?.getTime() || 0;
      return dateB - dateA;
    })
    .slice(0, 20);

  const getCategoryForNote = (note: Note): Category | undefined => {
    return categories.find(c => c.id === note.categoryId);
  };

  const handleContextMenu = (e: React.MouseEvent, noteId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      noteId
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Recent</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {recentNotes.map((note) => {
            const category = getCategoryForNote(note);
            
            return (
              <NoteCard
                key={note.id}
                note={note}
                category={category}
                onClick={() => onSelectNote(note.id)}
                onContextMenu={(e) => handleContextMenu(e, note.id)}
              />
            );
          })}
        </div>
        
        {recentNotes.length === 0 && (
          <div className="text-center py-12 text-stone-500">
            <p>No recent notes. Open a note to see it here.</p>
          </div>
        )}
      </div>

      {contextMenu && (
        <NoteContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isPinned={notes.find(n => n.id === contextMenu.noteId)?.isPinned}
          onOpen={() => {
            onSelectNote(contextMenu.noteId);
            setContextMenu(null);
          }}
          onDelete={() => {
            onDeleteNote(contextMenu.noteId);
            setContextMenu(null);
          }}
          onTogglePin={() => {
            onTogglePin(contextMenu.noteId);
            setContextMenu(null);
          }}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
