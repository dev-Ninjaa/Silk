'use client';

import React, { useEffect, useRef } from 'react';
import { Eye, Trash2 } from 'lucide-react';

interface AssetContextMenuProps {
  x: number;
  y: number;
  isInDefaultCategory?: boolean;
  onOpen: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export const AssetContextMenu: React.FC<AssetContextMenuProps> = ({
  x,
  y,
  isInDefaultCategory = false,
  onOpen,
  onDelete,
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

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-stone-200 py-1 min-w-[160px]"
      style={{ left: x, top: y }}
    >
      <button
        onClick={onOpen}
        className="w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-100 flex items-center gap-2"
      >
        <Eye size={14} />
        Open
      </button>
      {!isInDefaultCategory && (
        <button
          onClick={onDelete}
          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
        >
          <Trash2 size={14} />
          Delete
        </button>
      )}
      {isInDefaultCategory && (
        <div className="px-3 py-2 text-xs text-stone-500 text-center border-t border-stone-100">
          Assets in default category cannot be deleted
        </div>
      )}
    </div>
  );
};
