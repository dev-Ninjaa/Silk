import React, { useEffect, useRef, useState } from 'react';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  ChevronRight,
  Table as TableIcon,
  Quote,
  Code,
  Minus
} from 'lucide-react';
import { MenuItem, BlockType, Coordinates } from '../schema/types';

const MENU_ITEMS: MenuItem[] = [
  { id: 'text', label: 'Plain Text', icon: Type },
  { id: 'h1', label: 'Heading 1', icon: Heading1, shortcut: '#' },
  { id: 'h2', label: 'Heading 2', icon: Heading2, shortcut: '##' },
  { id: 'h3', label: 'Heading 3', icon: Heading3, shortcut: '###' },
  { id: 'bullet-list', label: 'Bulleted List', icon: List, shortcut: '-' },
  { id: 'numbered-list', label: 'Numbered List', icon: ListOrdered, shortcut: '1.' },
  { id: 'todo', label: 'To-Do List', icon: CheckSquare, shortcut: '[]' },
  { id: 'toggle', label: 'Toggle List', icon: ChevronRight, shortcut: '>' },
  { id: 'table', label: 'Table', icon: TableIcon },
  { id: 'quote', label: 'Blockquote', icon: Quote, shortcut: '|' },
  { id: 'code', label: 'Code Block', icon: Code, shortcut: '```' },
  { id: 'divider', label: 'Divider', icon: Minus, shortcut: '---' },
];

interface SlashMenuProps {
  position: Coordinates;
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

export const SlashMenu: React.FC<SlashMenuProps> = ({ position, onSelect, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Auto-focus menu when it appears to intercept keyboard events
  useEffect(() => {
    if (menuRef.current) {
      menuRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent any keyboard events from bubbling when menu is open
      e.stopPropagation();
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % MENU_ITEMS.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + MENU_ITEMS.length) % MENU_ITEMS.length);
          break;
        case 'Enter':
          e.preventDefault();
          onSelect(MENU_ITEMS[selectedIndex].id);
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        default:
          e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, onSelect, onClose]);

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

  return (
    <div
      ref={menuRef}
      tabIndex={-1}
      className="slash-menu absolute z-50 w-80 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[380px]"
      style={{
        top: position.y,
        left: position.x
      }}
      onKeyDown={(e) => {
        // Prevent keyboard events from bubbling to parent
        e.stopPropagation();
      }}
    >
      <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider bg-white sticky top-0 z-10">
        Commands
      </div>

      <div className="flex flex-col py-1">
        {MENU_ITEMS.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`flex items-center gap-2 px-2 py-1 mx-0.5 rounded text-xs transition-colors duration-150 ${isSelected
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <div className={`p-0.5 rounded ${isSelected ? 'bg-white/20' : 'bg-transparent'
                }`}>
                <item.icon size={14} className={isSelected ? 'text-white' : 'text-gray-600'} />
              </div>

              <span className="font-medium truncate">{item.label}</span>

              {item.shortcut && (
                <div className={`text-[9px] px-1 rounded ml-auto whitespace-nowrap ${isSelected
                    ? 'text-blue-100'
                    : 'text-gray-400'
                  }`}>
                  {item.shortcut}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
