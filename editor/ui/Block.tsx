import React, { useRef, useEffect } from 'react';
import { Block as BlockType } from '../schema/types';
import { ChevronRight, GripVertical } from 'lucide-react';

interface BlockProps {
  block: BlockType;
  isFocused: boolean;
  updateBlock: (id: string, content: string) => void;
  onKeyDown: (e: React.KeyboardEvent, id: string) => void;
  onFocus: (id: string) => void;
  onClick: (id: string) => void;
}

export const Block: React.FC<BlockProps> = ({ 
  block, 
  isFocused, 
  updateBlock, 
  onKeyDown, 
  onFocus,
  onClick
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFocused && contentRef.current) {
      contentRef.current.focus();
    }
  }, [isFocused]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.innerText;
    if (text !== block.content) {
      updateBlock(block.id, text);
    }
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
        >
        </div>
      )}
    </div>
  );
};
