import React, { useState, useEffect } from 'react';
import { Block, BlockType, Coordinates, Note } from '../schema/types';
import { generateId } from '../core/utils';
import { Block as BlockComponent } from './Block';
import { SlashMenu } from './SlashMenu';

interface EditorProps {
  note: Note;
  onUpdateTitle: (noteId: string, title: string) => void;
  onUpdateBlocks: (noteId: string, blocks: Block[]) => void;
}

export const Editor: React.FC<EditorProps> = ({ note, onUpdateTitle, onUpdateBlocks }) => {
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<Coordinates>({ x: 0, y: 0 });
  const [menuTriggerIdx, setMenuTriggerIdx] = useState<number>(-1);

  const addBlock = (currentId: string) => {
    const newBlock: Block = { id: generateId(), type: 'text', content: '' };
    const currentIndex = note.blocks.findIndex(b => b.id === currentId);
    const newBlocks = [...note.blocks];
    newBlocks.splice(currentIndex + 1, 0, newBlock);
    onUpdateBlocks(note.id, newBlocks);
    setFocusedBlockId(newBlock.id);
  };

  const updateBlock = (id: string, content: string) => {
    const updatedBlocks = note.blocks.map(b => b.id === id ? { ...b, content } : b);
    onUpdateBlocks(note.id, updatedBlocks);
  };

  const changeBlockType = (type: BlockType) => {
    if (!focusedBlockId) return;

    const updatedBlocks = note.blocks.map(b => {
      if (b.id === focusedBlockId) {
        const cleanContent = b.content.endsWith('/') ? b.content.slice(0, -1) : b.content;
        return { ...b, type, content: cleanContent };
      }
      return b;
    });
    
    onUpdateBlocks(note.id, updatedBlocks);
    setMenuOpen(false);
    
    if (type === 'divider') {
        addBlock(focusedBlockId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (menuOpen) {
       if (e.key === 'Escape') {
         setMenuOpen(false);
       }
       return; 
    }

    if (e.key === '/') {
        setTimeout(() => {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                
                setMenuPosition({
                    x: rect.left,
                    y: rect.bottom + 5
                });
                setMenuOpen(true);
            }
        }, 0);
    } else if (e.key === 'Enter') {
      if (!e.shiftKey) {
        e.preventDefault();
        addBlock(id);
      }
    } else if (e.key === 'Backspace') {
      const currentBlock = note.blocks.find(b => b.id === id);
      if (currentBlock && currentBlock.content === '' && note.blocks.length > 1) {
        e.preventDefault();
        const index = note.blocks.findIndex(b => b.id === id);
        if (index > 0) {
          const prevBlock = note.blocks[index - 1];
          setFocusedBlockId(prevBlock.id);
          onUpdateBlocks(note.id, note.blocks.filter(b => b.id !== id));
        }
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setMenuOpen(false);
    if (menuOpen) {
        window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="max-w-3xl mx-auto px-12 py-16 pb-48">
      <div className="mb-8 group">
        <input
          type="text"
          placeholder="Untitled"
          value={note.title}
          onChange={(e) => onUpdateTitle(note.id, e.target.value)}
          className="w-full text-5xl font-bold text-gray-800 placeholder-gray-300 outline-none bg-transparent"
        />
      </div>

      <div className="flex flex-col gap-1">
        {note.blocks.map((block) => (
          <BlockComponent
            key={block.id}
            block={block}
            isFocused={focusedBlockId === block.id}
            updateBlock={updateBlock}
            onKeyDown={handleKeyDown}
            onFocus={setFocusedBlockId}
            onClick={setFocusedBlockId}
          />
        ))}
      </div>

      {menuOpen && (
        <SlashMenu 
          position={menuPosition} 
          onSelect={changeBlockType} 
          onClose={() => setMenuOpen(false)} 
        />
      )}
      
      <div className="fixed bottom-4 right-4 text-gray-400 text-xs font-mono">
        Type '/' to trigger menu
      </div>
    </div>
  );
};
