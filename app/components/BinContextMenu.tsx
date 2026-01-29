'use client';

import React, { useEffect, useRef } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';

interface BinContextMenuProps {
  x: number;
  y: number;
  onRestore: () => void;
  onDeleteForever: () => void;
  onClose: () => void;
}

export const BinContextMenu: React.FC<BinContextMenuProps> = ({
  x,
  y,
  onRestore,
  onDeleteForever,
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
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-stone-200 py-1 min-w-[180px]"
      style={{ left: x, top: y }}
    >
      <button
        onClick={() => {
          onRestore();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-100"
      >
        <RotateCcw size={14} />
        <span>Restore</span>
      </button>
      <button
        onClick={() => {
          onDeleteForever();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-100"
      >
        <Trash2 size={14} />
        <span>Delete Forever</span>
      </button>
    </div>
  );
};
