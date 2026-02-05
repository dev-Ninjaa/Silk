import React, { useRef, useEffect, useCallback } from 'react';
import { Block as BlockType, CursorPosition } from '../schema/types';
import { ChevronRight, GripVertical } from 'lucide-react';
interface BlockProps {
  block: BlockType;
  isFocused: boolean;
  cursorPosition?: CursorPosition | null;
  updateBlock: (id: string, content: string) => void;
  onKeyDown: (e: React.KeyboardEvent, id: string) => void;
  onFocus: (id: string, position?: CursorPosition) => void;
  onClick: (id: string, position?: CursorPosition) => void;
  onMentionClick?: (noteId: string) => void;
  setBlockRef?: (id: string, el: HTMLDivElement | null) => void;
}

export const Block: React.FC<BlockProps> = ({
  block,
  isFocused,
  cursorPosition,
  updateBlock,
  onKeyDown,
  onFocus,
  onClick,
  onMentionClick,
  setBlockRef
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const isTypingRef = useRef(false);
  const prevMentionsLengthRef = useRef(block.mentions?.length || 0);
  const lastCursorPositionRef = useRef<CursorPosition | null>(null);
  const blockIdRef = useRef(block.id);

  // Register ref with parent
  useEffect(() => {
    blockIdRef.current = block.id;

    if (setBlockRef && contentRef.current) {
      setBlockRef(block.id, contentRef.current);
    }
  }, [block.id, setBlockRef]);

  // Cleanup ref on unmount
  useEffect(() => {
    const capturedBlockId = blockIdRef.current;
    return () => {
      if (setBlockRef) {
        setBlockRef(capturedBlockId, null);
      }
    };
  }, [setBlockRef]);

  // Set initial content on mount
  useEffect(() => {
    if (contentRef.current && block.content) {
      contentRef.current.textContent = block.content;
    }
  }, []); // Only run on mount

  // Track if we've already focused to avoid re-positioning cursor
  const hasPositionedCursorRef = useRef(false);
  const prevFocusedRef = useRef(isFocused);

  // Reset cursor positioning flag when losing focus
  useEffect(() => {
    if (!isFocused) {
      hasPositionedCursorRef.current = false;
    }
  }, [isFocused]);

  // Reset cursor positioning state when cursorPosition is cleared
  useEffect(() => {
    if (cursorPosition === null || cursorPosition === undefined) {
      hasPositionedCursorRef.current = false;
    }
  }, [cursorPosition]);

  // Handle focus and cursor positioning
  useEffect(() => {
    if (isFocused && contentRef.current) {
      // Only focus and position cursor when focus changes from false to true
      // OR when cursorPosition explicitly changes to a non-null value
      const justGotFocus = !prevFocusedRef.current && isFocused;
      
      if (justGotFocus) {
        contentRef.current.focus();
        hasPositionedCursorRef.current = false;
      }
      
      // Only set cursor position if:
      // 1. cursorPosition is explicitly set (not null)
      // 2. AND we haven't already positioned for this focus session
      if (cursorPosition !== null && cursorPosition !== undefined && !hasPositionedCursorRef.current) {
        // Small delay to ensure focus is complete and check if still focused
        requestAnimationFrame(() => {
          if (contentRef.current && document.activeElement === contentRef.current) {
            setCursorPosition(cursorPosition);
            hasPositionedCursorRef.current = true;
            lastCursorPositionRef.current = cursorPosition;
          }
        });
      }
    }
    
    prevFocusedRef.current = isFocused;
  }, [isFocused, cursorPosition]);

  const setCursorPosition = (position: CursorPosition) => {
    if (!contentRef.current) return;

    const element = contentRef.current;
    const sel = window.getSelection();
    if (!sel) return;

    const range = document.createRange();
    const totalLength = element.textContent?.length || 0;

    if (position === 'start' || totalLength === 0) {
      range.selectNodeContents(element);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      return;
    }
    
    if (position === 'end') {
      range.selectNodeContents(element);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      return;
    }
    
    if (typeof position === 'number') {
      const targetOffset = Math.min(Math.max(0, position), totalLength);
      
      // Use TreeWalker to find the position in text nodes
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
      let currentOffset = 0;
      let node: Node | null;
      // Track the last valid text node seen for fallback positioning
      let lastNode: Node | null = null;
      
      while ((node = walker.nextNode())) {
        const nodeLength = node.textContent?.length || 0;
        lastNode = node;
        
        // Handle boundary case: if exactly at node boundary, prefer start of next node
        // This ensures cursor placement between nodes is consistent and predictable
        if (currentOffset + nodeLength === targetOffset) {
          // Peek at next node without permanently advancing walker
          const savedNode = walker.currentNode;
          const nextNode = walker.nextNode();
          if (nextNode) {
            range.setStart(nextNode, 0);
            range.setEnd(nextNode, 0);
            sel.removeAllRanges();
            sel.addRange(range);
            return;
          }
          // Reset walker if no next node found, continue with current node
          walker.currentNode = savedNode;
        }
        
        if (currentOffset + nodeLength >= targetOffset) {
          const offsetInNode = targetOffset - currentOffset;
          range.setStart(node, offsetInNode);
          range.setEnd(node, offsetInNode);
          sel.removeAllRanges();
          sel.addRange(range);
          return;
        }
        currentOffset += nodeLength;
      }
      
      // Fallback: place at end of last valid text node or end of element
      if (lastNode) {
        const nodeLength = lastNode.textContent?.length || 0;
        range.setStart(lastNode, nodeLength);
        range.setEnd(lastNode, nodeLength);
        sel.removeAllRanges();
        sel.addRange(range);
      } else {
        range.selectNodeContents(element);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  };

  // Render mentions when they change OR when unfocused
  useEffect(() => {
    if (!contentRef.current) return;

    const currentMentionsLength = block.mentions?.length || 0;
    const prevMentionsLength = prevMentionsLengthRef.current;

    // Only re-render if:
    // 1. We're not focused (display mode)
    // 2. OR a new mention was just added (mentions length increased)
    if (!isFocused) {
      renderContentWithMentions();
    } else if (currentMentionsLength > prevMentionsLength) {
      // A new mention was added - render it and place cursor at end
      renderContentWithMentions();
      requestAnimationFrame(() => {
        setCursorPosition('end');
      });
    }

    prevMentionsLengthRef.current = currentMentionsLength;
  }, [block.content, block.mentions, isFocused]);

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    isTypingRef.current = true;
    const text = e.currentTarget.innerText;
    
    updateBlock(block.id, text);
    
    // Reset typing flag after state update
    requestAnimationFrame(() => {
      isTypingRef.current = false;
    });
  }, [block.id, updateBlock]);

  const renderContentWithMentions = () => {
    if (!contentRef.current) return;

    if (!block.mentions || block.mentions.length === 0) {
      contentRef.current.textContent = block.content;
      return;
    }

    const content = block.content;
    const mentions = [...block.mentions].sort((a, b) => a.start - b.start);
    const fragments: (string | { type: 'mention'; noteId: string; title: string })[] = [];
    let lastIndex = 0;

    mentions.forEach(mention => {
      if (mention.start > lastIndex) {
        fragments.push(content.slice(lastIndex, mention.start));
      }
      fragments.push({ type: 'mention', noteId: mention.noteId, title: mention.title });
      lastIndex = mention.end;
    });

    if (lastIndex < content.length) {
      fragments.push(content.slice(lastIndex));
    }

    contentRef.current.innerHTML = '';
    fragments.forEach(fragment => {
      if (typeof fragment === 'string') {
        contentRef.current!.appendChild(document.createTextNode(fragment));
      } else {
        const span = document.createElement('span');
        span.textContent = fragment.title;
        span.style.color = '#2563eb';
        span.style.fontWeight = '500';
        span.style.cursor = 'pointer';
        span.style.textDecoration = 'none';
        span.contentEditable = 'false';
        span.dataset.noteId = fragment.noteId;

        span.onmouseenter = () => {
          span.style.color = '#1d4ed8';
          span.style.textDecoration = 'underline';
        };

        span.onmouseleave = () => {
          span.style.color = '#2563eb';
          span.style.textDecoration = 'none';
        };

        span.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (onMentionClick) {
            onMentionClick(fragment.noteId);
          }
        };

        contentRef.current!.appendChild(span);
      }
    });
  };

  const getStyles = () => {
    switch (block.type) {
      case 'h1': return 'text-4xl font-bold mt-6 mb-2 text-gray-900';
      case 'h2': return 'text-3xl font-semibold mt-5 mb-2 text-gray-800';
      case 'h3': return 'text-2xl font-semibold mt-4 mb-2 text-gray-800';
      case 'quote': return 'border-l-4 border-gray-900 pl-4 py-1 my-2 text-xl italic font-serif text-gray-700';
      case 'code': return 'bg-gray-100 p-4 rounded-md font-mono text-sm my-2 text-gray-800';
      case 'todo': return '';
      default: return 'text-base my-1 text-gray-700 leading-relaxed';
    }
  };

  const getPlaceholder = () => {
    if (block.type === 'h1') return 'Heading 1';
    if (block.type === 'h2') return 'Heading 2';
    if (block.type === 'h3') return 'Heading 3';
    return "Write or type / for commands...";
  };

  return (
    <div className="group relative flex items-start -ml-8 pl-8 py-0.5" onClick={() => onClick(block.id)}>

      <div className="absolute left-0 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-gray-300">
        <GripVertical size={18} />
      </div>

      {block.type === 'bullet-list' && (
        <span className="mr-2 text-2xl leading-6 text-gray-800">•</span>
      )}

      {block.type === 'numbered-list' && (
        <span className="mr-2 font-medium text-gray-600 select-none">1.</span>
      )}

      {block.type === 'todo' && (
        <div className="mr-2 mt-1">
          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        </div>
      )}

      {block.type === 'toggle' && (
        <span className="mr-2 mt-1 text-gray-500">
          <ChevronRight size={16} />
        </span>
      )}

      {block.type === 'divider' ? (
        <hr className="w-full my-4 border-t border-gray-200" />
      ) : (
        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={(e) => onKeyDown(e, block.id)}
          onFocus={() => onFocus(block.id)}
          data-placeholder={getPlaceholder()}
          className={`
            w-full outline-none empty-node break-words
            ${getStyles()}
            ${block.type === 'todo' ? 'line-through-peer-checked' : ''}
          `}
        />
      )}
    </div>
  );
};
