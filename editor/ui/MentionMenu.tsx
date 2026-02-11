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

  // Track whether the user has interacted with the menu via keyboard navigation
  const keyboardNav = useRef(false);

  useEffect(() => {
    // Reset navigation state when query or notes change
    keyboardNav.current = false;
  }, [query, notes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only intercept keys we act on; prefer `e.key` and `e.code` for modern handling.
      const key = e.key
      const code = (e as any).code as string | undefined

      if (key === 'ArrowDown' || code === 'ArrowDown') {
        if (filteredNotes.length === 0) return
        e.preventDefault();
        e.stopPropagation();
        keyboardNav.current = true;
        setSelectedIndex((prev) => (prev + 1) % filteredNotes.length);
      } else if (key === 'ArrowUp' || code === 'ArrowUp') {
        if (filteredNotes.length === 0) return
        e.preventDefault();
        e.stopPropagation();
        keyboardNav.current = true;
        setSelectedIndex((prev) => (prev - 1 + filteredNotes.length) % filteredNotes.length);
      } else if (key === 'Enter' || code === 'Enter' || code === 'NumpadEnter') {
        // When the mention menu is open, Enter should select the highlighted item.
        // Default to the first item if none was navigated explicitly yet. Allow
        // Shift+Enter to insert a newline in the editor.
        if (e.shiftKey) {
          return
        }

        const note = filteredNotes[selectedIndex] || filteredNotes[0]
        if (note) {
          e.preventDefault();
          e.stopPropagation();
          onSelect(note.id, note.title);
          keyboardNav.current = false;
        }
      } else if (key === 'Escape' || key === 'Esc' || code === 'Escape') {
        // Normalize Escape across browsers and ensure editor doesn't also handle it
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    // Add in capture phase so we receive the key event before other handlers
    // that may stop propagation in bubbling phase (editor internals sometimes do).
    document.addEventListener('keydown', handleKeyDown, true as AddEventListenerOptions | boolean);
    return () => document.removeEventListener('keydown', handleKeyDown, true as EventListenerOptions | boolean);
  }, [selectedIndex, filteredNotes, onSelect, onClose]);

  // Scroll selected item into view and manage hover-based cancel/close timers
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return

    const selectedElement = menu.children[selectedIndex + 1] as HTMLElement;
    if (selectedElement) {
      if (selectedElement.offsetTop < menu.scrollTop) {
        menu.scrollTop = selectedElement.offsetTop;
      } else if (selectedElement.offsetTop + selectedElement.offsetHeight > menu.scrollTop + menu.offsetHeight) {
        menu.scrollTop = selectedElement.offsetTop + selectedElement.offsetHeight - menu.offsetHeight;
      }
    }
  }, [selectedIndex]);

  // Manage hover interactions: cancel scheduled cleanup when entering, and schedule a
  // delayed close on mouse leave so the menu doesn't disappear immediately.
  const closeTimer = useRef<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const cancelScheduledCleanup = () => {
    const menu = menuRef.current
    const container = menu?.parentElement as HTMLElement | null
    if (!container) return
    const id = (container as any).__mentionCleanupId as number | undefined
    if (id) {
      try {
        clearTimeout(id)
      } catch (err) {
        // ignore
      }
      try { delete (container as any).__mentionCleanupId } catch (e) { }
    }
  }

  const handleMouseEnter = () => {
    // Highlight first item when entering the menu area
    setSelectedIndex((prev) => (typeof prev === 'number' ? prev : 0) ?? 0)
    // Cancel any scheduled cleanup triggered by the plugin
    cancelScheduledCleanup()
    // If we had scheduled a local close via mouseleave, cancel it
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const handleMouseLeave = () => {
    // Give a small grace period before calling onClose so small mouse slips don't close the menu.
    if (closeTimer.current) return
    const id = (setTimeout(() => {
      closeTimer.current = null
      onClose()
    }, 200) as unknown) as number
    closeTimer.current = id
  };


  const style = noTransform
    ? { top: position.y, left: position.x, transform: 'none' }
    : { top: position.y, left: position.x, transform: 'translateY(-100%) translateY(-10px)' };

  if (filteredNotes.length === 0) {
    return (
      <div
        // Prevent mousedown from stealing focus from the editor so the suggestion
        // plugin doesn't close when the user tries to interact with the menu.
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onClick={() => {
                onSelect(note.id, note.title)
                onClose()
              }}
              onMouseEnter={() => { setSelectedIndex(index); setHoveredIndex(index) }}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`group flex items-center gap-3 px-3 py-1.5 mx-1 rounded text-sm transition-colors duration-150 cursor-pointer ${isSelected || hoveredIndex === index
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:bg-blue-500 hover:text-white'
                }`}
            >
              <div className={`p-1 rounded border ${(isSelected || hoveredIndex === index) ? 'bg-transparent border-white/20' : 'bg-white border-gray-200'} ${!(isSelected || hoveredIndex === index) ? 'group-hover:bg-transparent group-hover:border-white/20' : ''}`}>
                <FileText size={16} className={(isSelected || hoveredIndex === index) ? 'text-white' : 'text-gray-600 group-hover:text-white'} />
              </div>

              <span className="font-medium truncate">{note.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
