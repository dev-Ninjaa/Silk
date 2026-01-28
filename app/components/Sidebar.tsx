'use client';

import React, { useState } from 'react';
import { Category, Note, ViewMode } from '@/app/types';
import { FileText, Plus, FolderPlus, Home, Clock, Pin, Library, Settings, Trash2, Search } from 'lucide-react';

interface SidebarProps {
  viewMode: ViewMode;
  categories: Category[];
  notes: Note[];
  currentNoteId: string | null;
  selectedCategoryId: string | null;
  onSelectNote: (noteId: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onCreateCategory: (name: string) => void;
  onCreateNote: (categoryId: string) => void;
  onChangeView: (mode: ViewMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  viewMode,
  categories, 
  notes, 
  currentNoteId, 
  selectedCategoryId,
  onSelectNote,
  onSelectCategory,
  onCreateCategory,
  onCreateNote,
  onChangeView
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(categories.map(c => c.id)));
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isHoveringSettings, setIsHoveringSettings] = useState(false);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getNotesForCategory = (categoryId: string) => {
    return notes.filter(note => note.categoryId === categoryId && !note.isDeleted);
  };

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      onCreateCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsCreatingCategory(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateCategory();
    } else if (e.key === 'Escape') {
      setIsCreatingCategory(false);
      setNewCategoryName('');
    }
  };

  return (
    <div className="w-64 h-screen bg-stone-100 flex flex-col border-r border-stone-200">
      <div className="p-4 space-y-1">
        <button
          onClick={() => onChangeView('home')}
          className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm font-medium ${
            viewMode === 'home' 
              ? 'bg-stone-200 text-stone-900' 
              : 'text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Home size={16} />
          <span>All Notes</span>
        </button>
        
        <button
          onClick={() => onChangeView('recent')}
          className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm font-medium ${
            viewMode === 'recent' 
              ? 'bg-stone-200 text-stone-900' 
              : 'text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Clock size={16} />
          <span>Recent</span>
        </button>
        
        <button
          onClick={() => onChangeView('pins')}
          className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm font-medium ${
            viewMode === 'pins' 
              ? 'bg-stone-200 text-stone-900' 
              : 'text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Pin size={16} />
          <span>Pins</span>
        </button>
        
        <button
          onClick={() => onChangeView('library')}
          className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm font-medium ${
            viewMode === 'library' 
              ? 'bg-stone-200 text-stone-900' 
              : 'text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Library size={16} />
          <span>Library</span>
        </button>
      </div>

      {viewMode === 'library' && (
        <>
          <div className="px-4 pt-2 pb-3">
            {isCreatingCategory ? (
              <div className="px-2 py-1.5">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleCreateCategory}
                  placeholder="Category name"
                  className="w-full px-2 py-1 text-sm bg-white border border-stone-300 rounded outline-none focus:border-stone-400"
                  autoFocus
                />
              </div>
            ) : (
              <button
                onClick={() => setIsCreatingCategory(true)}
                className="flex items-center gap-2 text-stone-600 text-sm font-medium px-2 py-1.5 hover:bg-stone-200 rounded cursor-pointer w-full"
              >
                <FolderPlus size={16} />
                <span>New category</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-4">
            <div className="space-y-0.5">
              {categories.map((category) => {
                const isCategoryExpanded = expandedCategories.has(category.id);
                const categoryNotes = getNotesForCategory(category.id);
                const isSelected = selectedCategoryId === category.id;
                
                return (
                  <div key={category.id}>
                    <div 
                      className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer group ${
                        isSelected ? 'bg-stone-200' : 'hover:bg-stone-200'
                      }`}
                      onClick={() => {
                        toggleCategory(category.id);
                        onSelectCategory(category.id);
                      }}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-stone-700 text-sm font-medium truncate">
                          {category.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-stone-400 flex-shrink-0">
                          {categoryNotes.length}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCreateNote(category.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-stone-300 rounded"
                          title="New note"
                        >
                          <Plus size={14} className="text-stone-600" />
                        </button>
                      </div>
                    </div>

                    {isCategoryExpanded && categoryNotes.length > 0 && (
                      <div className="ml-4 space-y-0.5 mt-0.5">
                        {categoryNotes.map((note) => (
                          <div
                            key={note.id}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer ${
                              currentNoteId === note.id
                                ? 'bg-stone-300 text-stone-900'
                                : 'hover:bg-stone-200 text-stone-600'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectNote(note.id);
                            }}
                          >
                            <FileText size={14} className="flex-shrink-0" />
                            <span className="text-xs truncate">{note.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {viewMode !== 'library' && (
        <div className="flex-1" />
      )}

      <div 
        className="p-4 mt-auto"
        onMouseEnter={() => setIsHoveringSettings(true)}
        onMouseLeave={() => setIsHoveringSettings(false)}
      >
        {isHoveringSettings && (
          <div className="space-y-1 mb-1">
            <button
              onClick={() => onChangeView('search')}
              className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm font-medium ${
                viewMode === 'search' 
                  ? 'bg-stone-200 text-stone-900' 
                  : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Search size={16} />
              <span>Search</span>
            </button>
            
            <button
              onClick={() => onChangeView('bin')}
              className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm font-medium ${
                viewMode === 'bin' 
                  ? 'bg-stone-200 text-stone-900' 
                  : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Trash2 size={16} />
              <span>Bin</span>
            </button>
          </div>
        )}
        
        <button
          onClick={() => onChangeView('settings')}
          className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm font-medium ${
            viewMode === 'settings' 
              ? 'bg-stone-200 text-stone-900' 
              : 'text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};
