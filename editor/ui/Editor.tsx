import React, { useState, useEffect } from 'react';
import { Block, BlockType, Coordinates, Note } from '../schema/types';
import { generateId } from '../core/utils';
import { Block as BlockComponent } from './Block';
import { SlashMenu } from './SlashMenu';
import { MentionMenu } from './MentionMenu';

interface EditorProps {
  note: Note;
  allNotes?: { id: string; title: string; isDeleted?: boolean }[];
  onUpdateTitle: (noteId: string, title: string) => void;
  onUpdateBlocks: (noteId: string, blocks: Block[]) => void;
  onOpenNote?: (noteId: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ note, allNotes = [], onUpdateTitle, onUpdateBlocks, onOpenNote }) => {
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<Coordinates>({ x: 0, y: 0 });
  const [menuTriggerIdx, setMenuTriggerIdx] = useState<number>(-1);

  const [mentionMenuOpen, setMentionMenuOpen] = useState(false);
  const [mentionMenuPosition, setMentionMenuPosition] = useState<Coordinates>({ x: 0, y: 0 });
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartPos, setMentionStartPos] = useState(0);

  const availableNotes = allNotes.filter(n => n.id !== note.id && !n.isDeleted);

  const addBlock = (currentId: string) => {
    const newBlock: Block = { id: generateId(), type: 'text', content: '' };
    const currentIndex = note.blocks.findIndex(b => b.id === currentId);
    const newBlocks = [...note.blocks];
    newBlocks.splice(currentIndex + 1, 0, newBlock);
    onUpdateBlocks(note.id, newBlocks);
    setFocusedBlockId(newBlock.id);
  };

  const updateBlock = (id: string, content: string) => {
    const currentBlock = note.blocks.find(b => b.id === id);

    
    let cleanedMentions = currentBlock?.mentions || [];
    if (cleanedMentions.length > 0) {
      cleanedMentions = cleanedMentions.filter(mention => {
        const mentionTextInContent = content.slice(mention.start, mention.end);
        return mentionTextInContent === mention.title;
      });
    }

    const updatedBlocks = note.blocks.map(b => {
      if (b.id === id) {
        return { ...b, content, mentions: cleanedMentions };
      }
      return b;
    });
    onUpdateBlocks(note.id, updatedBlocks);

 
    if (!mentionMenuOpen && focusedBlockId === id) {
      const lastAtIndex = content.lastIndexOf('@');
      if (lastAtIndex !== -1) {
        const textAfterAt = content.slice(lastAtIndex + 1);
 
        if (!textAfterAt.includes(' ') && textAfterAt.length >= 0) {
          setMentionQuery(textAfterAt);
          setMentionStartPos(lastAtIndex);

          setTimeout(() => {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              const rect = range.getBoundingClientRect();
              const editorRect = document.querySelector('.max-w-3xl')?.getBoundingClientRect();

              if (editorRect) {
                setMentionMenuPosition({
                  x: rect.left - editorRect.left,
                  y: rect.top - editorRect.top
                });
                setMentionMenuOpen(true);
              }
            }
          }, 0);
          return; 
        }
      }
    }
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
    // Handle mention menu separately
    if (mentionMenuOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMentionMenuOpen(false);
      }
      
      return;
    }

    
    if (menuOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
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
          const blockRect = (e.target as HTMLElement).getBoundingClientRect();

          setMenuPosition({
            x: rect.left - blockRect.left,
            y: rect.top - blockRect.top
          });
          setMenuOpen(true);
        }
      }, 0);
      return;
    }

    
    if (e.key === 'Enter') {
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
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
         
      if (target.closest('.mention-menu') || target.closest('.slash-menu')) {
        return;
      }
      setMenuOpen(false);
      setMentionMenuOpen(false);
    };
    if (menuOpen || mentionMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen, mentionMenuOpen]);

  const handleMentionSelect = (noteId: string, title: string) => {
    if (!focusedBlockId) return;

    const currentBlock = note.blocks.find(b => b.id === focusedBlockId);
    if (!currentBlock) return;


    const beforeMention = currentBlock.content.slice(0, mentionStartPos);
    const afterMention = currentBlock.content.slice(mentionStartPos + 1 + mentionQuery.length);
    const mentionText = '@' + title;
    const newContent = beforeMention + mentionText + afterMention;

   
    const mention = {
      noteId,
      title: mentionText,
      start: mentionStartPos,
      end: mentionStartPos + mentionText.length
    };

    const updatedBlocks = note.blocks.map(b => {
      if (b.id === focusedBlockId) {
        const existingMentions = b.mentions || [];
        return {
          ...b,
          content: newContent,
          mentions: [...existingMentions, mention]
        };
      }
      return b;
    });

    onUpdateBlocks(note.id, updatedBlocks);
    setMentionMenuOpen(false);
  };

  const handleMentionClick = (noteId: string) => {
    if (onOpenNote) {
      onOpenNote(noteId);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-12 py-16 pb-48 relative">
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
            onMentionClick={handleMentionClick}
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

      {mentionMenuOpen && (
        <MentionMenu
          position={mentionMenuPosition}
          notes={availableNotes}
          query={mentionQuery}
          onSelect={handleMentionSelect}
          onClose={() => setMentionMenuOpen(false)}
        />
      )}

      <div className="fixed bottom-4 right-4 text-gray-400 text-xs font-mono">
        Type '/' for commands, '@' to mention notes
      </div>
    </div>
  );
};
