'use client';

import React, { useEffect, useRef } from 'react';
import { Trash2, Edit3 } from 'lucide-react';

interface SubCategoryContextMenuProps {
  x: number;
  y: number;
  canDelete: boolean;
  onDelete: () => void;
  onRename: () => void;
  onClose: () => void;
}

export const SubCategoryContextMenu: React.FC<SubCategoryContextMenuProps> = ({
  x,
  y,
  canDelete,
  onDelete,
  onRename,
  onClose
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Delay adding the click listener to avoid immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);
    
    document.addEventListener('keydown', handleEscape);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-stone-200 py-1 min-w-[160px]"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <button
        onClick={() => {
          onRename();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-100"
      >
        <Edit3 size={14} />
        <span>Rename</span>
      </button>
      <button
        onClick={() => {
          if (canDelete) {
            onDelete();
            onClose();
          }
        }}
        disabled={!canDelete}
        className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${
          canDelete
            ? 'text-red-600 hover:bg-red-50'
            : 'text-stone-400 cursor-not-allowed'
        }`}
        title={!canDelete ? 'Remove all notes first' : ''}
      >
        <Trash2 size={14} />
        <span>Delete</span>
      </button>
    </div>
  );
};
