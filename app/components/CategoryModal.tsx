'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Folder, BookOpen, Briefcase, Heart, Star, Lightbulb, Coffee, Music } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, color: string, icon?: string) => void;
  initialData?: {
    name: string;
    color: string;
    icon?: string;
  };
  mode?: 'create' | 'edit';
}

const PRESET_COLORS = [
  '#a8a29e', // stone
  '#94a3b8', // slate
  '#a3a3a3', // neutral
  '#9ca3af', // gray
  '#93c5fd', // blue
  '#c4b5fd', // violet
  '#d8b4fe', // purple
  '#f9a8d4', // pink
  '#fda4af', // rose
  '#fca5a5', // red
  '#fdba74', // orange
  '#fcd34d', // amber
];

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

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode = 'create'
}) => {
  const title = mode === 'edit' ? 'Edit Category' : 'New Category';
  const buttonText = mode === 'edit' ? 'Save' : 'Create';
  const [name, setName] = useState(initialData?.name || '');
  const [selectedColor, setSelectedColor] = useState(initialData?.color || PRESET_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState<string | undefined>(initialData?.icon);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setSelectedColor(initialData?.color || PRESET_COLORS[0]);
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
      onSave(name.trim(), selectedColor, selectedIcon);
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
      
      <div 
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[85vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-200 flex-shrink-0">
          <h2 className="text-base sm:text-lg font-semibold text-stone-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X size={18} className="text-stone-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-stone-700 mb-2">
              Category Name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Personal, Work, Ideas"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-stone-300 rounded-lg outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-stone-700 mb-2 sm:mb-3">
              Color
            </label>
            <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-full aspect-square rounded-lg transition-all ${
                    selectedColor === color
                      ? 'ring-2 ring-stone-900 ring-offset-2 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
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

          <div className="flex items-center gap-2 pt-2">
            <div 
              className="w-6 sm:w-8 h-6 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: selectedColor }}
            >
              {selectedIcon && (() => {
                const iconData = PRESET_ICONS.find(i => i.id === selectedIcon);
                if (iconData) {
                  const Icon = iconData.Icon;
                  return <Icon size={14} className="text-white sm:w-4 sm:h-4" />;
                }
                return null;
              })()}
            </div>
            <span className="text-xs sm:text-sm text-stone-600">Preview</span>
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
