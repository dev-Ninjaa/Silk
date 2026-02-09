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
  Minus,
  FileText,
  AtSign,
  Smile
} from 'lucide-react';
import { MenuItem, BlockType, Coordinates } from '../schema/types';

export const MENU_ITEMS: MenuItem[] = [
  { id: 'text', label: 'Text', icon: Type, group: 'Style' },
  { id: 'h1', label: 'Heading 1', icon: Heading1, group: 'Style' },
  { id: 'h2', label: 'Heading 2', icon: Heading2, group: 'Style' },
  { id: 'h3', label: 'Heading 3', icon: Heading3, group: 'Style' },
  { id: 'bullet-list', label: 'Bullet List', icon: List, group: 'Style' },
  { id: 'numbered-list', label: 'Numbered List', icon: ListOrdered, group: 'Style' },
  { id: 'todo', label: 'To-do List', icon: CheckSquare, group: 'Style' },
  { id: 'quote', label: 'Blockquote', icon: Quote, group: 'Style' },
  { id: 'code', label: 'Code Block', icon: Code, group: 'Style' },
  { id: 'divider', label: 'Divider', icon: Minus, group: 'Insert' },
  { id: 'table', label: 'Table', icon: TableIcon, group: 'Insert' },
  { id: 'emoji', label: 'Emoji', icon: Smile, group: 'Insert' },
  { id: 'mention', label: 'Mention', icon: AtSign, group: 'Insert' },
  { id: 'image', label: 'Image', icon: FileText, group: 'Upload' },
];

interface SlashMenuProps {
  position: Coordinates;
  onSelect: (type: BlockType) => void;
  onClose: () => void;
  // Optional controlled props used by TipTap Suggestion renderer
  items?: MenuItem[];
  query?: string | null;
}

export const SlashMenu: React.FC<SlashMenuProps> = ({ position, onSelect, onClose, items, query: controlledQuery }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [internalQuery, setInternalQuery] = useState('')
  const menuRef = useRef<HTMLDivElement>(null);

  // Determine items and query (controlled by Suggestion or local state)
  const q = (controlledQuery !== undefined && controlledQuery !== null) ? controlledQuery : internalQuery
  const sourceItems = items ?? MENU_ITEMS
  const filteredItems = sourceItems.filter((it) => it.label.toLowerCase().includes((q || '').toLowerCase()))

  const grouped: Record<string, MenuItem[]> = {};
  for (const item of filteredItems) {
    const g = item.group ?? 'Other'
    if (!grouped[g]) grouped[g] = []
    grouped[g].push(item)
  }

  // Auto-focus menu when it appears to intercept keyboard events
  useEffect(() => {
    if (menuRef.current) {
      menuRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const menu = menuRef.current;
    if (menu) {
      const selectedElement = menu.querySelector('[data-selected="true"]') as HTMLElement | null;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [selectedIndex, controlledQuery, internalQuery]);

  return (
    <div
      ref={menuRef}
      tabIndex={-1}
      className="slash-menu absolute z-50 w-44 bg-white rounded-md shadow-lg overflow-hidden flex flex-col max-h-[320px] outline-none"
      style={{
        top: position.y,
        left: position.x
      }}
      onKeyDown={(e) => {
        // Prevent keyboard events from bubbling to parent
        e.stopPropagation();

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (filteredItems.length > 0) {
            setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
          }
          return
        }

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (filteredItems.length > 0) {
            setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
          }
          return
        }

        if (e.key === 'Enter') {
          e.preventDefault();
          if (filteredItems.length > 0 && filteredItems[selectedIndex]) {
            onSelect(filteredItems[selectedIndex].id);
          }
          return
        }

        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
          return
        }

        // handle printable characters and Backspace for filtering in uncontrolled mode
        if (!items) {
          if (e.key === 'Backspace') {
            e.preventDefault();
            setInternalQuery((q) => q.slice(0, -1));
            setSelectedIndex(0);
            return
          }

          if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
            e.preventDefault();
            setInternalQuery((q) => (q + e.key).slice(0, 64));
            setSelectedIndex(0);
            return
          }
        }
      }}
    >
      {/* header placeholder removed to keep UI compact */}
      

      <div 
        className="flex flex-col divide-y divide-gray-100 overflow-y-auto" 
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          WebkitScrollbar: { display: 'none' } as any
        }}
      >
        {Object.keys(grouped).map((section) => (
          <div key={section} className="py-1 px-0">
            <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">{section}</div>
            <div className="flex flex-col py-0">
              {grouped[section].map((item, idx) => {
                const baseIndex = Object.values(grouped).slice(0, Object.keys(grouped).indexOf(section)).reduce((acc, arr) => acc + arr.length, 0)
                const isSelected = (baseIndex + idx) === selectedIndex
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    onMouseEnter={() => setSelectedIndex(baseIndex + idx)}
                    data-selected={isSelected}
                    className={`flex items-center gap-2 px-2 py-1 mx-1 rounded text-sm transition-colors duration-150 ${isSelected
                        ? 'bg-sky-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <div className={`p-0.5 rounded ${isSelected ? 'bg-white/20' : 'bg-transparent'}`}>
                      <item.icon size={14} className={isSelected ? 'text-white' : 'text-gray-500'} />
                    </div>

                    <div className="flex flex-col items-start text-left">
                      <span className="font-medium truncate">{item.label}</span>
                      {item.description && <span className="text-xs text-gray-400 truncate">{item.description}</span>}
                    </div>

                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
