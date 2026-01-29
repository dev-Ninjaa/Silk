'use client';

import React, { useEffect, useRef } from 'react';
import { ExternalLink, Trash2, Pin, PinOff } from 'lucide-react';

interface NoteContextMenuProps {
  x: number;
  y: number;
  isPinned?: boolean;
  onOpen: () => void;
  onDelete: () => void;
  onTogglePin?: () => void;
  onClose: () => void;
}

export const NoteContextMenu: React.FC<NoteContextMenuProps> = ({
  x,
  y,
  isPinned = false,
  onOpen,
  onDelete,
  onTogglePin,
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
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-stone-200 py-1 min-w-[160px]"
      style={{ left: x, top: y }}
    >
      <button
        onClick={() => {
          onOpen();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-100"
      >
        <ExternalLink size={14} />
        <span>Open</span>
      </button>
      {onTogglePin && (
        <button
          onClick={() => {
            onTogglePin();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-100"
        >
          {isPinned ? <PinOff size={14} /> : <Pin size={14} />}
          <span>{isPinned ? 'Unpin' : 'Pin'}</span>
        </button>
      )}
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
      >
        <Trash2 size={14} />
        <span>Delete</span>
      </button>
    </div>
  );
};
