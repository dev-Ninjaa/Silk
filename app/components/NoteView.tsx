'use client';

import React, { useState } from 'react';
import { Note, Block, Asset } from '@/app/types';
import { Editor } from '@/editor';
import { RichContentRenderer } from './RichContentRenderer';

interface NoteViewProps {
  note: Note;
  allNotes?: { id: string; title: string; isDeleted?: boolean }[];
  assets?: Asset[]; // Add assets prop
  isReadMode?: boolean;
  onUpdateTitle: (noteId: string, title: string) => void;
  onUpdateBlocks: (noteId: string, blocks: Block[]) => void;
  onOpenNote?: (noteId: string) => void;
}

/**
 * NoteView - Wrapper around Editor with read/edit mode toggle
 * 
 * - Edit mode: Uses existing Editor component (unchanged)
 * - Read mode: Renders content with RichContentRenderer for rich media
 */
export const NoteView: React.FC<NoteViewProps> = ({
  note,
  allNotes,
  assets = [],
  isReadMode = false,
  onUpdateTitle,
  onUpdateBlocks,
  onOpenNote
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const assetId = e.dataTransfer.getData('text/plain');
    const itemType = e.dataTransfer.getData('itemType');

    // Only handle asset drops for image/video/audio
    if (itemType === 'asset' && assetId.startsWith('asset-')) {
      const asset = assets.find(a => a.id === assetId);
      if (asset && ['image', 'video', 'audio'].includes(asset.type)) {
        // Insert asset reference at the end of the note
        const assetReference = `{{asset:${assetId}}}`;
        const newBlock = {
          id: Math.random().toString(36).substring(2, 11),
          type: 'text' as const,
          content: assetReference
        };
        onUpdateBlocks(note.id, [...note.blocks, newBlock]);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const itemType = e.dataTransfer.types.includes('itemtype') || e.dataTransfer.types.includes('itemType');
    if (itemType) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  if (!isReadMode) {
    // Edit mode - use existing editor
    return (
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative w-full ${isDragOver ? 'ring-2 ring-stone-400 ring-inset' : ''}`}
      >
        <Editor
          note={note}
          allNotes={allNotes}
          onUpdateTitle={onUpdateTitle}
          onUpdateBlocks={onUpdateBlocks}
          onOpenNote={onOpenNote}
        />
        {isDragOver && (
          <div className="fixed inset-0 bg-stone-900/5 pointer-events-none flex items-center justify-center z-40">
            <div className="bg-white px-4 sm:px-6 py-3 rounded-lg shadow-lg border-2 border-stone-400 border-dashed">
              <p className="text-stone-700 font-medium text-sm sm:text-base">Drop media here to insert</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Read mode - render with rich content support
  return (
    <>
      <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 md:py-12 lg:py-16 pb-32 md:pb-48">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 break-words">
            {note.title}
          </h1>
        </div>

        <div className="flex flex-col gap-1">
          {note.blocks.map((block) => (
            <ReadModeBlock
              key={block.id}
              block={block}
              assets={assets}
              onOpenNote={onOpenNote}
            />
          ))}
        </div>
      </div>
    </>
  );
};

interface ReadModeBlockProps {
  block: Block;
  assets?: Asset[];
  onOpenNote?: (noteId: string) => void;
}

const ReadModeBlock: React.FC<ReadModeBlockProps> = ({ block, assets = [], onOpenNote }) => {
  const getStyles = () => {
    switch (block.type) {
      case 'h1': return 'text-4xl font-bold mt-6 mb-2 text-gray-900';
      case 'h2': return 'text-3xl font-semibold mt-5 mb-2 text-gray-800';
      case 'h3': return 'text-2xl font-semibold mt-4 mb-2 text-gray-800';
      case 'quote': return 'border-l-4 border-gray-900 pl-4 py-1 my-2 text-xl italic font-serif text-gray-700';
      case 'code': return 'bg-gray-100 p-4 rounded-md font-mono text-sm my-2 text-gray-800 whitespace-pre-wrap';
      case 'todo': return 'flex items-start gap-2';
      case 'bullet-list': return 'flex items-start gap-2';
      case 'numbered-list': return 'flex items-start gap-2';
      default: return 'text-base my-1 text-gray-700 leading-relaxed';
    }
  };

  if (block.type === 'divider') {
    return <hr className="w-full my-4 border-t border-gray-200" />;
  }

  // Render content with mentions
  const renderContent = () => {
    if (!block.mentions || block.mentions.length === 0) {
      // No mentions - use rich content renderer
      return (
        <RichContentRenderer
          content={block.content}
          assets={assets}
          onAssetClick={onOpenNote}
        />
      );
    }

    // Has mentions - render them inline, then apply rich content to text parts
    const content = block.content;
    const mentions = [...block.mentions].sort((a, b) => a.start - b.start);
    const fragments: React.ReactNode[] = [];
    let lastIndex = 0;

    mentions.forEach((mention, idx) => {
      // Text before mention
      if (mention.start > lastIndex) {
        const textContent = content.slice(lastIndex, mention.start);
        fragments.push(
          <RichContentRenderer
            key={`text-${idx}`}
            content={textContent}
            assets={assets}
            onAssetClick={onOpenNote}
          />
        );
      }

      // Mention
      fragments.push(
        <a
          key={`mention-${idx}`}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (onOpenNote) {
              onOpenNote(mention.noteId);
            }
          }}
          className="text-blue-600 font-medium hover:text-blue-800 hover:underline cursor-pointer"
        >
          {mention.title}
        </a>
      );

      lastIndex = mention.end;
    });

    // Text after last mention
    if (lastIndex < content.length) {
      const textContent = content.slice(lastIndex);
      fragments.push(
        <RichContentRenderer
          key="text-end"
          content={textContent}
          assets={assets}
          onAssetClick={onOpenNote}
        />
      );
    }

    return <>{fragments}</>;
  };

  const content = renderContent();

  if (block.type === 'bullet-list') {
    return (
      <div className={getStyles()}>
        <span className="text-2xl leading-6 text-gray-800">•</span>
        <div className="flex-1 text-base text-gray-700 leading-relaxed">
          {content}
        </div>
      </div>
    );
  }

  if (block.type === 'numbered-list') {
    return (
      <div className={getStyles()}>
        <span className="font-medium text-gray-600">1.</span>
        <div className="flex-1 text-base text-gray-700 leading-relaxed">
          {content}
        </div>
      </div>
    );
  }

  if (block.type === 'todo') {
    return (
      <div className={getStyles()}>
        <input
          type="checkbox"
          checked={block.checked || false}
          readOnly
          className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600"
        />
        <div className={`flex-1 text-base text-gray-700 leading-relaxed ${block.checked ? 'line-through' : ''}`}>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={getStyles()}>
      {content}
    </div>
  );
};
