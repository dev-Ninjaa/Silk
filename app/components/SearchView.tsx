'use client';

import React, { useState } from 'react';
import { Note, Category } from '@/app/types';
import { Search } from 'lucide-react';

interface SearchViewProps {
  notes: Note[];
  categories: Category[];
  onSelectNote: (noteId: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ 
  notes, 
  categories, 
  onSelectNote 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const activeNotes = notes.filter(n => !n.isDeleted);

  const filteredNotes = searchQuery.trim()
    ? activeNotes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const getCategoryForNote = (note: Note): Category | undefined => {
    return categories.find(c => c.id === note.categoryId);
  };

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 md:mb-8">Search</h1>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by title..."
            className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg outline-none focus:border-stone-400 text-sm"
            autoFocus
          />
        </div>
        
        <div className="space-y-2">
          {filteredNotes.map((note) => {
            const category = getCategoryForNote(note);
            
            return (
              <div
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className="p-3 sm:p-4 rounded-lg border border-stone-200 hover:border-stone-300 hover:bg-stone-50 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
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
                </div>
              </div>
            );
          })}
        </div>
        
        {searchQuery.trim() && filteredNotes.length === 0 && (
          <div className="text-center py-12 text-stone-500">
            <p>No notes found matching "{searchQuery}"</p>
          </div>
        )}
        
        {!searchQuery.trim() && (
          <div className="text-center py-12 text-stone-500">
            <p>Enter a search term to find notes</p>
          </div>
        )}
      </div>
    </div>
  );
};
