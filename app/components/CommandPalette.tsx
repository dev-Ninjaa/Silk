'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Note, Category } from '@/app/types';
import { Search, FileText } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  notes: Note[];
  categories: Category[];
  onClose: () => void;
  onSelectNote: (noteId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  notes,
  categories,
  onClose,
  onSelectNote
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeNotes = notes.filter(n => !n.isDeleted);

  const filteredNotes = searchQuery.trim()
    ? activeNotes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredNotes.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
      } else if (e.key === 'Enter' && filteredNotes.length > 0) {
        e.preventDefault();
        handleSelectNote(filteredNotes[selectedIndex].id);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredNotes, selectedIndex]);

  const handleSelectNote = (noteId: string) => {
    onSelectNote(noteId);
    onClose();
  };

  const getCategoryForNote = (note: Note): Category | undefined => {
    return categories.find(c => c.id === note.categoryId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-32">
      <div 
        className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[520px] mx-4 overflow-hidden">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-11 pr-4 py-3.5 text-sm border-b border-stone-200 outline-none"
          />
        </div>

        {searchQuery.trim() && (
          <div className="max-h-[400px] overflow-y-auto">
            {filteredNotes.length > 0 ? (
              <div className="py-2">
                {filteredNotes.map((note, index) => {
                  const category = getCategoryForNote(note);
                  const isSelected = index === selectedIndex;
                  
                  return (
                    <div
                      key={note.id}
                      onClick={() => handleSelectNote(note.id)}
                      className={`px-4 py-2.5 cursor-pointer transition-colors ${
                        isSelected ? 'bg-stone-100' : 'hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-stone-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-stone-900 truncate">
                            {note.title}
                          </div>
                          {category && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div 
                                className="w-1.5 h-1.5 rounded-full" 
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="text-xs text-stone-500">{category.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-stone-500">
                No notes found
              </div>
            )}
          </div>
        )}

        {!searchQuery.trim() && (
          <div className="px-4 py-8 text-center text-sm text-stone-400">
            Type to search notes
          </div>
        )}
      </div>
    </div>
  );
};
