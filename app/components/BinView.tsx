'use client';

import React, { useState } from 'react';
import { Note, Category, Asset } from '@/app/types';
import { BinContextMenu } from './BinContextMenu';
import { NoteCard } from './NoteCard';
import { File, Link as LinkIcon, Image, FileCode, FileVideo, FileAudio, FileArchive, FileText } from 'lucide-react';

interface BinViewProps {
  notes: Note[];
  assets: Asset[];
  categories: Category[];
  onRestore: (noteId: string) => void;
  onDeleteForever: (noteId: string) => void;
  onRestoreAsset: (assetId: string) => void;
  onDeleteAssetForever: (assetId: string) => void;
}

export const BinView: React.FC<BinViewProps> = ({ 
  notes,
  assets,
  categories, 
  onRestore, 
  onDeleteForever,
  onRestoreAsset,
  onDeleteAssetForever
}) => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    noteId: string;
  } | null>(null);
  const [assetContextMenu, setAssetContextMenu] = useState<{
    x: number;
    y: number;
    assetId: string;
  } | null>(null);

  const deletedNotes = notes.filter(n => n.isDeleted);
  const deletedAssets = assets.filter(a => a.isDeleted);

  const getCategoryForNote = (note: Note): Category | undefined => {
    return categories.find(c => c.id === note.categoryId);
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'docx':
        return FileText;
      case 'link':
        return LinkIcon;
      case 'image':
        return Image;
      case 'video':
        return FileVideo;
      case 'audio':
        return FileAudio;
      case 'archive':
      case 'zip':
        return FileArchive;
      case 'markdown':
      case 'text':
      case 'code':
        return FileCode;
      default:
        return File;
    }
  };

  const handleContextMenu = (e: React.MouseEvent, noteId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      noteId
    });
  };

  const handleAssetContextMenu = (e: React.MouseEvent, assetId: string) => {
    e.preventDefault();
    setAssetContextMenu({
      x: e.clientX,
      y: e.clientY,
      assetId
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 md:mb-8">Bin</h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
          {deletedNotes.map((note) => {
            const category = getCategoryForNote(note);
            
            return (
              <NoteCard
                key={note.id}
                note={note}
                category={category}
                onContextMenu={(e) => handleContextMenu(e, note.id)}
                showDeletedDate={true}
              />
            );
          })}

          {deletedAssets.map((asset) => {
            const AssetIcon = getAssetIcon(asset.type);
            return (
              <div
                key={asset.id}
                className="aspect-[3.8/5] rounded-[12px] sm:rounded-[14px] p-3 sm:p-4 md:p-5 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer bg-stone-100"
                onContextMenu={(e) => handleAssetContextMenu(e, asset.id)}
              >
                <div>
                  <div className="flex items-start gap-1.5 sm:gap-2 mb-2 sm:mb-3 text-[10px] sm:text-[11px] font-medium tracking-wide">
                    <span className="px-1.5 py-0.5 bg-stone-900/5 rounded text-stone-600">
                      {asset.deletedAt?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="py-0.5 text-stone-500 truncate uppercase">{asset.type}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <AssetIcon size={20} className="text-stone-400 flex-shrink-0" />
                  </div>
                  
                  <h3 className="text-sm text-stone-700 leading-tight line-clamp-3">
                    {asset.name}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
        
        {deletedNotes.length === 0 && deletedAssets.length === 0 && (
          <div className="text-center py-12 text-stone-500">
            <p>Bin is empty.</p>
          </div>
        )}
      </div>

      {contextMenu && (
        <BinContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onRestore={() => {
            onRestore(contextMenu.noteId);
            setContextMenu(null);
          }}
          onDeleteForever={() => {
            onDeleteForever(contextMenu.noteId);
            setContextMenu(null);
          }}
          onClose={() => setContextMenu(null)}
        />
      )}

      {assetContextMenu && (
        <BinContextMenu
          x={assetContextMenu.x}
          y={assetContextMenu.y}
          onRestore={() => {
            onRestoreAsset(assetContextMenu.assetId);
            setAssetContextMenu(null);
          }}
          onDeleteForever={() => {
            onDeleteAssetForever(assetContextMenu.assetId);
            setAssetContextMenu(null);
          }}
          onClose={() => setAssetContextMenu(null)}
        />
      )}
    </div>
  );
};
