import React, { useEffect, useRef, useState } from 'react';
import { FileText } from 'lucide-react';
import { Coordinates } from '../schema/types';

interface Note {
  id: string;
  title: string;
}

interface MentionMenuProps {
  position: Coordinates;
  notes: Note[];
  query: string;
  onSelect: (noteId: string, title: string) => void;
  onClose: () => void;
  noTransform?: boolean; // when true, menu will be positioned by parent container and won't apply its translate transform
}

export const MentionMenu: React.FC<MentionMenuProps> = ({
  position,
  notes,
  query,
  onSelect,
  onClose,
  noTransform,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation();

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredNotes.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredNotes.length) % filteredNotes.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredNotes[selectedIndex]) {
            onSelect(filteredNotes[selectedIndex].id, filteredNotes[selectedIndex].title);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredNotes, onSelect, onClose]);

  useEffect(() => {
    const menu = menuRef.current;
    if (menu) {
      const selectedElement = menu.children[selectedIndex + 1] as HTMLElement;
      if (selectedElement) {
        if (selectedElement.offsetTop < menu.scrollTop) {
          menu.scrollTop = selectedElement.offsetTop;
        } else if (selectedElement.offsetTop + selectedElement.offsetHeight > menu.scrollTop + menu.offsetHeight) {
          menu.scrollTop = selectedElement.offsetTop + selectedElement.offsetHeight - menu.offsetHeight;
        }
      }
    }
  }, [selectedIndex]);

  const style = noTransform
    ? { top: position.y, left: position.x, transform: 'none' }
    : { top: position.y, left: position.x, transform: 'translateY(-100%) translateY(-10px)' };

  if (filteredNotes.length === 0) {
    return (
      <div
        className="mention-menu absolute z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
        style={style}
      >
        <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider bg-white">
          Link to Note
        </div>
        <div className="px-3 py-4 text-sm text-gray-400">
          No notes found
        </div>
      </div>
    );
  }

  return (
    <div
      ref={menuRef}
      className="mention-menu absolute z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col max-h-[380px] overflow-y-auto"
      style={style}
    >
      <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider bg-white sticky top-0 z-10">
        Link to Note
      </div>

      <div className="flex flex-col pb-2">
        {filteredNotes.map((note, index) => {
          const isSelected = index === selectedIndex;
          return (
            <button
              key={note.id}
              onClick={() => onSelect(note.id, note.title)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`flex items-center gap-3 px-3 py-1.5 mx-1 rounded text-sm transition-colors duration-150 ${isSelected
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <div className={`p-1 rounded border ${isSelected ? 'bg-transparent border-white/20' : 'bg-white border-gray-200'
                }`}>
                <FileText size={16} className={isSelected ? 'text-white' : 'text-gray-600'} />
              </div>

              <span className="font-medium truncate">{note.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
