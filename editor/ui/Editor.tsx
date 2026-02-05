import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Block, BlockType, Coordinates, Note, CursorPosition } from '../schema/types';
import { generateId } from '../core/utils';
import { Block as BlockComponent } from './Block';
import { SlashMenu } from './SlashMenu';
import { MentionMenu } from './MentionMenu';

// Constants for cursor positioning
const LINE_HEIGHT_MULTIPLIER = 1.8;
const LINE_DETECTION_PADDING = 5;
const DEFAULT_FONT_SIZE = 24;
const DEFAULT_LINE_HEIGHT_RATIO = 1.5;
const MIN_LINE_HEIGHT_PADDING_RATIO = 0.25;
const MIN_LINE_HEIGHT_PADDING = 4;

interface EditorProps {
  note: Note;
  allNotes?: { id: string; title: string; isDeleted?: boolean }[];
  onUpdateTitle: (noteId: string, title: string) => void;
  onUpdateBlocks: (noteId: string, blocks: Block[]) => void;
  onOpenNote?: (noteId: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ note, allNotes = [], onUpdateTitle, onUpdateBlocks, onOpenNote }) => {
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition | null>(null);
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const setBlockRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) {
      blockRefs.current.set(id, el);
    } else {
      blockRefs.current.delete(id);
    }
  }, []);

  // Helper to get line height from element
  const getLineHeight = (element: HTMLElement): number => {
    const computedStyle = window.getComputedStyle(element);
    let lineHeight = parseFloat(computedStyle.lineHeight);
    if (isNaN(lineHeight)) {
      const fontSize = parseFloat(computedStyle.fontSize);
      lineHeight = (!isNaN(fontSize) ? fontSize : DEFAULT_FONT_SIZE) * DEFAULT_LINE_HEIGHT_RATIO;
    }
    return lineHeight;
  };

  const focusBlock = useCallback((blockId: string, position?: CursorPosition) => {
    setFocusedBlockId(blockId);
    // Update cursor position when explicitly provided (including null to clear)
    if (position !== undefined) {
      setCursorPosition(position);
    }
  }, []);

  // Ensure blockRefs only contains refs for blocks that currently exist in note.blocks
  useEffect(() => {
    const validIds = new Set(note.blocks.map((block) => block.id));
    const refs = blockRefs.current;

    for (const id of refs.keys()) {
      if (!validIds.has(id)) {
        refs.delete(id);
      }
    }
  }, [note.blocks]);

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
    focusBlock(newBlock.id, 'start');
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

    const currentIndex = note.blocks.findIndex(b => b.id === id);
    const currentBlock = note.blocks[currentIndex];
    const blockEl = blockRefs.current.get(id);

    // Helper to validate selection is within the block element
    const isSelectionInBlock = (selection: Selection | null): boolean => {
      if (!selection || selection.rangeCount === 0 || !blockEl) return false;
      const range = selection.getRangeAt(0);
      return blockEl.contains(range.startContainer);
    };

    // Helper to get cursor offset from start of element
    const getCursorOffset = (): number => {
      const selection = window.getSelection();
      if (!selection || !isSelectionInBlock(selection)) return 0;
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(blockEl);
      preCaretRange.setEnd(range.startContainer, range.startOffset);
      return preCaretRange.toString().length;
    };

    // Helper to check if cursor is at start
    const isCursorAtStart = (): boolean => {
      return getCursorOffset() === 0;
    };

    // Helper to check if cursor is at end
    const isCursorAtEnd = (): boolean => {
      if (!blockEl) return false;
      return getCursorOffset() >= (blockEl.textContent?.length || 0);
    };

    // Helper to get cursor rect reliably
    const getCursorRect = (): DOMRect | null => {
      const selection = window.getSelection();
      if (!selection || !isSelectionInBlock(selection)) return null;
      const range = selection.getRangeAt(0);
      
      // Try getClientRects first
      const rects = range.getClientRects();
      if (rects.length > 0) {
        return rects[0];
      }
      
      // Fallback: insert a temporary span to get position, using a cloned range
      const tempRange = range.cloneRange();
      const span = document.createElement('span');
      span.textContent = '\u200B'; // Zero-width space
      tempRange.insertNode(span);
      const rect = span.getBoundingClientRect();
      span.parentNode?.removeChild(span);
      
      // Do not modify the actual selection; we only needed the geometry
      if (typeof tempRange.detach === 'function') {
        tempRange.detach();
      }
      
      return rect;
    };

    // Handle arrow key navigation between blocks
    if (e.key === 'ArrowUp' && currentIndex > 0 && blockEl) {
      const cursorRect = getCursorRect();
      if (cursorRect) {
        const blockRect = blockEl.getBoundingClientRect();
        const lineHeight = getLineHeight(blockEl);

        const isEmpty = (blockEl.textContent?.length || 0) === 0;
        const isSingleLine = blockRect.height < lineHeight * LINE_HEIGHT_MULTIPLIER;
        const isAtFirstLine = cursorRect.top < blockRect.top + lineHeight + LINE_DETECTION_PADDING;

        if (isEmpty || isSingleLine || isAtFirstLine) {
          e.preventDefault();
          const prevBlock = note.blocks[currentIndex - 1];
          const prevBlockEl = blockRefs.current.get(prevBlock.id);

          if (prevBlockEl) {
            const cursorX = cursorRect.left;
            
            // Directly manipulate DOM without triggering React cursor positioning
            prevBlockEl.focus();
            setFocusedBlockId(prevBlock.id);
            setCursorPosition(null); // null means "don't position cursor via React"
            
            // Position cursor immediately after focus
            positionCursorAtX(prevBlockEl, cursorX, 'last');
          }
        }
      }
      return;
    }

    if (e.key === 'ArrowDown' && currentIndex < note.blocks.length - 1 && blockEl) {
      const cursorRect = getCursorRect();
      if (cursorRect) {
        const blockRect = blockEl.getBoundingClientRect();
        const lineHeight = getLineHeight(blockEl);

        const isEmpty = (blockEl.textContent?.length || 0) === 0;
        const isSingleLine = blockRect.height < lineHeight * LINE_HEIGHT_MULTIPLIER;
        const isAtLastLine = cursorRect.bottom > blockRect.bottom - lineHeight - LINE_DETECTION_PADDING;

        if (isEmpty || isSingleLine || isAtLastLine) {
          e.preventDefault();
          const nextBlock = note.blocks[currentIndex + 1];
          const nextBlockEl = blockRefs.current.get(nextBlock.id);

          if (nextBlockEl) {
            const cursorX = cursorRect.left;
            
            // Directly manipulate DOM without triggering React cursor positioning
            nextBlockEl.focus();
            setFocusedBlockId(nextBlock.id);
            setCursorPosition(null); // null means "don't position cursor via React"
            
            // Position cursor immediately after focus
            positionCursorAtX(nextBlockEl, cursorX, 'first');
          }
        }
      }
      return;
    }

    if (e.key === 'ArrowLeft' && currentIndex > 0 && blockEl) {
      if (isCursorAtStart()) {
        e.preventDefault();
        const prevBlock = note.blocks[currentIndex - 1];
        focusBlock(prevBlock.id, 'end');
      }
      return;
    }

    if (e.key === 'ArrowRight' && currentIndex < note.blocks.length - 1 && blockEl) {
      if (isCursorAtEnd()) {
        e.preventDefault();
        const nextBlock = note.blocks[currentIndex + 1];
        focusBlock(nextBlock.id, 'start');
      }
      return;
    }

    if (e.key === '/') {
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const editorRect = document.querySelector('.max-w-3xl')?.getBoundingClientRect();

          if (editorRect) {
            setMenuPosition({
              x: rect.left - editorRect.left,
              y: rect.bottom - editorRect.top + 10
            });
            setMenuOpen(true);
          }
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
      if (currentBlock && currentBlock.content === '' && note.blocks.length > 1) {
        e.preventDefault();
        if (currentIndex > 0) {
          const prevBlock = note.blocks[currentIndex - 1];
          const newBlocks = note.blocks.filter(b => b.id !== id);
          onUpdateBlocks(note.id, newBlocks);
          focusBlock(prevBlock.id, 'end');
        } else if (currentIndex === 0 && note.blocks.length > 1) {
          // If deleting first block, focus the next one
          const nextBlock = note.blocks[1];
          const newBlocks = note.blocks.filter(b => b.id !== id);
          onUpdateBlocks(note.id, newBlocks);
          focusBlock(nextBlock.id, 'start');
        }
      } else if (currentBlock && currentIndex > 0 && isCursorAtStart()) {
        // Cursor at start - merge with previous block
        e.preventDefault();
        const prevBlock = note.blocks[currentIndex - 1];
        
        // Merge content (ensure both values are strings)
        const prevContent = prevBlock.content || '';
        const currentContent = currentBlock.content || '';
        const mergedContent = prevContent + currentContent;
        const newBlocks = note.blocks
          .map(b => b.id === prevBlock.id ? { ...b, content: mergedContent } : b)
          .filter(b => b.id !== id);
        
        onUpdateBlocks(note.id, newBlocks);
        // Place cursor at the end of the merged previous block to avoid relying on string length
        focusBlock(prevBlock.id, 'end');
      }
    }
  };


  const positionCursorAtX = (element: HTMLDivElement, targetX: number, line: 'first' | 'last') => {
    const sel = window.getSelection();
    if (!sel) return;

    const textContent = element.textContent || '';
    
    // Handle empty elements
    if (textContent.length === 0) {
      const range = document.createRange();
      range.selectNodeContents(element);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      return;
    }

    // Get element metrics
    const elementRect = element.getBoundingClientRect();
    const lineHeight = getLineHeight(element);
    // Make padding proportional to line height to handle large fonts/zoom
    const padding = Math.max(MIN_LINE_HEIGHT_PADDING, lineHeight * MIN_LINE_HEIGHT_PADDING_RATIO);

    // Determine target Y range based on first/last line
    const targetYMin = line === 'first' ? elementRect.top - padding : elementRect.bottom - lineHeight - padding;
    const targetYMax = line === 'first' ? elementRect.top + lineHeight + padding : elementRect.bottom + padding;

    // Walk through all text nodes to find best position
    // Skip text nodes inside contentEditable='false' elements (like mention spans)
    const acceptNode = (node: Node): number => {
      let parent = node.parentElement;
      while (parent && parent !== element) {
        if (parent.contentEditable === 'false') {
          return NodeFilter.FILTER_REJECT;
        }
        parent = parent.parentElement;
      }
      return NodeFilter.FILTER_ACCEPT;
    };

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, { acceptNode });
    const range = document.createRange();
    
    let bestNode: Node | null = null;
    let bestOffset = 0;
    let bestDistance = Infinity;
    let fallbackNode: Node | null = null;
    let fallbackOffset = 0;

    let node: Node | null;
    while ((node = walker.nextNode())) {
      const text = node.textContent || '';
      
      // Store first/last node for fallback
      if (line === 'first' && !fallbackNode) {
        fallbackNode = node;
        fallbackOffset = 0;
      }
      if (line === 'last') {
        fallbackNode = node;
        fallbackOffset = text.length;
      }

      // Use binary search approach for better performance with large text
      let left = 0;
      let right = text.length;
      
      // First, check if any position in this node is on the target line
      range.setStart(node, 0);
      range.setEnd(node, 0);
      const startRect = range.getBoundingClientRect();
      const isStartOnTargetLine = startRect.top >= targetYMin && startRect.bottom <= targetYMax;
      
      if (isStartOnTargetLine || text.length < 50) {
        // For short text or if we know we're on target line, check all positions
        for (let i = 0; i <= text.length; i++) {
          range.setStart(node, i);
          range.setEnd(node, i);
          const rect = range.getBoundingClientRect();

          // Check if on target line
          const isOnTargetLine = rect.top >= targetYMin && rect.bottom <= targetYMax;

          if (isOnTargetLine) {
            const distance = Math.abs(rect.left - targetX);
            if (distance < bestDistance) {
              bestDistance = distance;
              bestNode = node;
              bestOffset = i;
            }
          }
        }
      } else {
        // For longer text not on target line, skip detailed checking
        continue;
      }
    }

    // Use best match or fallback
    const finalNode = bestNode || fallbackNode;
    const finalOffset = bestNode ? bestOffset : fallbackOffset;

    if (finalNode) {
      range.setStart(finalNode, finalOffset);
      range.setEnd(finalNode, finalOffset);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      // Ultimate fallback
      range.selectNodeContents(element);
      range.collapse(line === 'first');
      sel.removeAllRanges();
      sel.addRange(range);
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
    
    // Position cursor after mention is rendered (consistent with other cursor positioning)
    const cursorPosAfterMention = mentionStartPos + mentionText.length;
    requestAnimationFrame(() => {
      focusBlock(focusedBlockId, cursorPosAfterMention);
    });
  };

  const handleMentionClick = (noteId: string) => {
    if (onOpenNote) {
      onOpenNote(noteId);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-16 py-12 pb-48 relative">
      <div className="mb-8 group">
        <input
          type="text"
          placeholder="Untitled"
          value={note.title}
          onChange={(e) => onUpdateTitle(note.id, e.target.value)}
          className="w-full text-5xl font-bold text-gray-800 placeholder-gray-300 outline-none bg-transparent text-center"
        />
      </div>

      <div className="flex flex-col gap-1">
        {note.blocks.map((block) => (
          <BlockComponent
            key={block.id}
            block={block}
            isFocused={focusedBlockId === block.id}
            cursorPosition={focusedBlockId === block.id ? cursorPosition : null}
            updateBlock={updateBlock}
            onKeyDown={handleKeyDown}
            onFocus={focusBlock}
            onClick={focusBlock}
            onMentionClick={handleMentionClick}
            setBlockRef={setBlockRef}
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


    </div>
  );
};
