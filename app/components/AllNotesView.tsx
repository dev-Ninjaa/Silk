'use client';

import React, { useState } from 'react';
import { Note, Category } from '@/app/types';
import { NoteContextMenu } from './NoteContextMenu';

interface AllNotesViewProps {
  notes: Note[];
  categories: Category[];
  onSelectNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
}

export const AllNotesView: React.FC<AllNotesViewProps> = ({ 
  notes, 
  categories, 
  onSelectNote,
  onDeleteNote
}) => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    noteId: string;
  } | null>(null);
  const getCategoryForNote = (note: Note): Category | undefined => {
    return categories.find(c => c.id === note.categoryId);
  };

  const getPreviewText = (note: Note): string => {
    const textBlock = note.blocks.find(b => b.type === 'text' && b.content);
    return textBlock?.content || '';
  };

  const handleContextMenu = (e: React.MouseEvent, noteId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      noteId
    });
  };

  const activeNotes = notes.filter(n => !n.isDeleted);

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-6xl mx-auto px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">All Notes</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeNotes.map((note) => {
            const category = getCategoryForNote(note);
            const preview = getPreviewText(note);
            
            return (
              <div
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                onContextMenu={(e) => handleContextMenu(e, note.id)}
                className="p-4 rounded-lg border border-stone-200 hover:border-stone-300 hover:shadow-sm cursor-pointer transition-all bg-white"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-semibold text-gray-900 truncate flex-1">
                    {note.title}
                  </h3>
                </div>
                
                {category && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-xs text-stone-600">{category.name}</span>
                  </div>
                )}
                
                {preview && (
                  <p className="text-sm text-stone-600 line-clamp-2">
                    {preview}
                  </p>
                )}
                
                <div className="mt-3 text-xs text-stone-400">
                  {note.updatedAt.toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
        
        {activeNotes.length === 0 && (
          <div className="text-center py-12 text-stone-500">
            <p>No notes yet. Create your first note from the Library.</p>
          </div>
        )}
      </div>

      {contextMenu && (
        <NoteContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onOpen={() => {
            onSelectNote(contextMenu.noteId);
            setContextMenu(null);
          }}
          onDelete={() => {
            onDeleteNote(contextMenu.noteId);
            setContextMenu(null);
          }}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
