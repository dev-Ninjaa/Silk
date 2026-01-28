'use client';

import React, { useState } from 'react';
import { Note, Category } from '@/app/types';
import { BinContextMenu } from './BinContextMenu';

interface BinViewProps {
  notes: Note[];
  categories: Category[];
  onRestore: (noteId: string) => void;
  onDeleteForever: (noteId: string) => void;
}

export const BinView: React.FC<BinViewProps> = ({ 
  notes, 
  categories, 
  onRestore, 
  onDeleteForever 
}) => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    noteId: string;
  } | null>(null);

  const deletedNotes = notes.filter(n => n.isDeleted);

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
      <div className="max-w-4xl mx-auto px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Bin</h1>
        
        <div className="space-y-2">
          {deletedNotes.map((note) => {
            const category = getCategoryForNote(note);
            
            return (
              <div
                key={note.id}
                onContextMenu={(e) => handleContextMenu(e, note.id)}
                className="p-4 rounded-lg border border-stone-200 hover:border-stone-300 hover:bg-stone-50 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-gray-900 truncate">
                      {note.title}
                    </h3>
                    {category && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-xs text-stone-600">{category.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-stone-400 ml-4">
                    {note.deletedAt?.toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {deletedNotes.length === 0 && (
          <div className="text-center py-12 text-stone-500">
            <p>Bin is empty.</p>
          </div>
        )}
      </div>

      {contextMenu && (
        <BinContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onRestore={() => {
            onRestore(contextMenu.noteId);
            setContextMenu(null);
          }}
          onDeleteForever={() => {
            onDeleteForever(contextMenu.noteId);
            setContextMenu(null);
          }}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
