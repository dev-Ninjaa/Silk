'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Note, Block, Asset } from '@/app/types';
import { TipTapNoteEditor } from '@/editor';
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
  const dragDepthRef = useRef(0);

  const resetDragState = () => {
    // Overlay was persisting because dragleave doesn't always fire on nested
    // child transitions or when drop is handled by inner node views.
    // We reset depth + state on any terminal drag event.
    dragDepthRef.current = 0;
    setIsDragOver(false);
  };

  const isAssetDrag = (e: React.DragEvent) => {
    const types = Array.from(e.dataTransfer?.types || []);
    return types.includes('itemType') || types.includes('itemtype');
  };

  useEffect(() => {
    // Safety net: ensure global dragend/drop always clear overlay
    const onDragEnd = () => resetDragState();
    const onDrop = () => resetDragState();
    window.addEventListener('dragend', onDragEnd);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragend', onDragEnd);
      window.removeEventListener('drop', onDrop);
    };
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    if (!isAssetDrag(e)) return;
    // Do not prevent default here. Let the editor's internal drop handler
    // run so the asset node is inserted and then persisted via onUpdate.
    resetDragState();
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isAssetDrag(e)) return;
    e.preventDefault();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    if (!isAssetDrag(e)) return;
    e.preventDefault();
    // Use a depth counter because dragenter/dragleave fires for child nodes.
    dragDepthRef.current += 1;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!isAssetDrag(e)) return;
    e.preventDefault();
    const related = e.relatedTarget as Node | null;
    if (related && e.currentTarget.contains(related)) {
      return;
    }
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) {
      setIsDragOver(false);
    }
  };

  if (!isReadMode) {
    // Edit mode - use TipTap editor with title input
    return (
      <div
        onDropCapture={handleDrop}
        onDragOverCapture={handleDragOver}
        onDragEnterCapture={handleDragEnter}
        onDragLeaveCapture={handleDragLeave}
        className={`relative w-full ${isDragOver ? 'ring-2 ring-stone-400 ring-inset' : ''}`}
      >
        {/* Title Input */}
        <div className="mb-8 group px-4 sm:px-6 md:px-8 lg:px-12 py-4 md:py-6">
          <input
            type="text"
            placeholder="Untitled"
            value={note.title}
            onChange={(e) => onUpdateTitle(note.id, e.target.value)}
            className="w-full text-5xl font-bold text-gray-800 placeholder-gray-300 outline-none bg-transparent text-center"
          />
        </div>

        {/* TipTap Editor for Blocks */}
        <TipTapNoteEditor
          note={note}
          allNotes={allNotes}
          assets={assets}
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

/**
 * TableRenderer - Renders table data in read mode
 */
interface TableData {
  rows: Array<{ cells: string[] }>;
  headerRowIndex?: number;
}

const TableRenderer: React.FC<{ tableData: TableData }> = ({ tableData }) => {
  if (!tableData.rows || tableData.rows.length === 0) {
    return null;
  }

  const headerRowIndex = tableData.headerRowIndex ?? 0;

  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <tbody>
          {tableData.rows.map((row, rowIdx) => (
            <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {row.cells.map((cellContent, cellIdx) => {
                const isHeader = rowIdx === headerRowIndex;
                const CellTag = isHeader ? 'th' : 'td';

                return (
                  <CellTag
                    key={cellIdx}
                    className={`border border-gray-300 px-4 py-2 text-sm ${
                      isHeader
                        ? 'bg-gray-100 font-semibold text-gray-900'
                        : 'text-gray-700'
                    }`}
                  >
                    {cellContent}
                  </CellTag>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
      case 'table': return 'my-4 w-full overflow-x-auto';
      default: return 'text-base my-1 text-gray-700 leading-relaxed';
    }
  };

  if (block.type === 'divider') {
    return <hr className="w-full my-4 border-t border-gray-200" />;
  }

  // Handle table blocks
  if (block.type === 'table') {
    try {
      const tableData = JSON.parse(block.content);
      return <TableRenderer tableData={tableData} />;
    } catch (err) {
      console.error('[ReadMode] Failed to parse table data', err);
      // Fallback for corrupted table data
      return (
        <div className="my-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
          ⚠️ Unable to display table
        </div>
      );
    }
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
          marks={block.marks}
          links={block.links}
          textAlign={block.textAlign}
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
            marks={block.marks}
            links={block.links}
            textAlign={block.textAlign}
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
          marks={block.marks}
          links={block.links}
          textAlign={block.textAlign}
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
