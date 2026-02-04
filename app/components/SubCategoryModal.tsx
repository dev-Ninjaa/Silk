'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Folder, BookOpen, Briefcase, Heart, Star, Lightbulb, Coffee, Music } from 'lucide-react';

interface SubCategoryModalProps {
  isOpen: boolean;
  categoryName: string;
  onClose: () => void;
  onSave: (name: string, icon?: string) => void;
  initialData?: {
    name: string;
    icon?: string;
  };
  mode?: 'create' | 'edit';
}

const PRESET_ICONS = [
  { id: 'folder', Icon: Folder },
  { id: 'book', Icon: BookOpen },
  { id: 'briefcase', Icon: Briefcase },
  { id: 'heart', Icon: Heart },
  { id: 'star', Icon: Star },
  { id: 'lightbulb', Icon: Lightbulb },
  { id: 'coffee', Icon: Coffee },
  { id: 'music', Icon: Music },
];

export const SubCategoryModal: React.FC<SubCategoryModalProps> = ({
  isOpen,
  categoryName,
  onClose,
  onSave,
  initialData,
  mode = 'create'
}) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const title = mode === 'edit' ? 'Edit Sub-Category' : 'New Sub-Category';
  const buttonText = mode === 'edit' ? 'Save' : 'Create';

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setSelectedIcon(initialData?.icon);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), selectedIcon);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div 
        className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-200 flex-shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-stone-900">{title}</h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">in {categoryName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X size={18} className="text-stone-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-stone-700 mb-2">
              Sub-Category Name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Machine Learning, Frontend, Recipes"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-stone-300 rounded-lg outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-stone-700 mb-2 sm:mb-3">
              Icon (Optional)
            </label>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {PRESET_ICONS.map(({ id, Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedIcon(selectedIcon === id ? undefined : id)}
                  className={`aspect-square rounded-lg flex items-center justify-center transition-all ${
                    selectedIcon === id
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <Icon size={16} className="sm:w-5 sm:h-5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-stone-50 border-t border-stone-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};
