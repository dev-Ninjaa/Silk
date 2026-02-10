'use client';

import React, { useState, useEffect } from 'react';
import { Category, SubCategory, Note, Asset } from '@/app/types';
import { ChevronDown, ChevronRight, FileText, Plus, Pin, File, Link as LinkIcon, Image, FileCode, Folder, BookOpen, Briefcase, Heart, Star, Lightbulb, Coffee, Music, FileVideo, FileAudio, FileArchive } from 'lucide-react';
import { NoteContextMenu } from './NoteContextMenu';
import { CategoryContextMenu } from './CategoryContextMenu';
import { SubCategoryContextMenu } from './SubCategoryContextMenu';
import { AssetContextMenu } from './AssetContextMenu';

interface SecondarySidebarProps {
  categories: Category[];
  subCategories: SubCategory[];
  notes: Note[];
  assets: Asset[];
  selectedCategoryId: string | null;
  selectedSubCategoryId: string | null;
  currentNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onSelectSubCategory: (subCategoryId: string) => void;
  onCreateNote: (categoryId: string, subCategoryId?: string) => void;
  onCreateSubCategory: (categoryId: string, name: string, icon?: string) => void;
  onCreateCategory: (name: string, color: string, icon?: string) => void;
  onUpdateCategory: (categoryId: string, name: string, color: string, icon?: string) => void;
  onUpdateSubCategory: (subCategoryId: string, name: string, icon?: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onDeleteSubCategory: (subCategoryId: string) => void;
  onDeleteNote: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
  onMoveNote: (noteId: string, targetCategoryId: string, targetSubCategoryId?: string) => void;
  onMoveAsset: (assetId: string, targetCategoryId: string, targetSubCategoryId?: string) => void;
  onOpenFeedback: () => void;
  onOpenAsset: (assetId: string) => void;
  onDeleteAsset: (assetId: string) => void;
  onOpenAssetModal: (categoryId: string, subCategoryId?: string) => void;
  onOpenCategoryCreateModal: () => void;
  onOpenSubCategoryCreateModal: (categoryId: string) => void;
  onOpenCategoryEditModal: (categoryId: string) => void;
  onOpenSubCategoryEditModal: (subCategoryId: string) => void;
}

export const SecondarySidebar: React.FC<SecondarySidebarProps> = ({
  categories,
  subCategories,
  notes,
  assets,
  selectedCategoryId,
  selectedSubCategoryId,
  currentNoteId,
  onSelectNote,
  onSelectCategory,
  onSelectSubCategory,
  onCreateNote,
  onCreateSubCategory,
  onCreateCategory,
  onUpdateCategory,
  onUpdateSubCategory,
  onDeleteCategory,
  onDeleteSubCategory,
  onDeleteNote,
  onTogglePin,
  onMoveNote,
  onMoveAsset,
  onOpenFeedback,
  onOpenAsset,
  onDeleteAsset,
  onOpenAssetModal,
  onOpenCategoryCreateModal,
  onOpenSubCategoryCreateModal,
  onOpenCategoryEditModal,
  onOpenSubCategoryEditModal,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(categories.map(c => c.id)));
  const [dragOverTarget, setDragOverTarget] = useState<{ type: 'category' | 'subcategory', id: string } | null>(null);
  const [noteContextMenu, setNoteContextMenu] = useState<{
    x: number;
    y: number;
    noteId: string;
  } | null>(null);
  const [categoryContextMenu, setCategoryContextMenu] = useState<{
    x: number;
    y: number;
    categoryId: string;
  } | null>(null);
  const [subCategoryContextMenu, setSubCategoryContextMenu] = useState<{
    x: number;
    y: number;
    subCategoryId: string;
  } | null>(null);
  const [assetContextMenu, setAssetContextMenu] = useState<{
    x: number;
    y: number;
    assetId: string;
  } | null>(null);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getNotesForCategory = (categoryId: string, subCategoryId?: string) => {
    return notes.filter(note => 
      note.categoryId === categoryId && 
      !note.isDeleted &&
      (subCategoryId ? note.subCategoryId === subCategoryId : !note.subCategoryId)
    );
  };

  const getAssetsForCategory = (categoryId: string, subCategoryId?: string) => {
    return assets.filter(asset => 
      asset.categoryId === categoryId && 
      !asset.isDeleted &&
      (subCategoryId ? asset.subCategoryId === subCategoryId : !asset.subCategoryId)
    );
  };

  const getSubCategoriesForCategory = (categoryId: string) => {
    return subCategories.filter(sc => sc.categoryId === categoryId);
  };

  const handleNoteContextMenu = (e: React.MouseEvent, noteId: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Close other menus
    setCategoryContextMenu(null);
    setSubCategoryContextMenu(null);
    setAssetContextMenu(null);
    setNoteContextMenu({
      x: e.clientX,
      y: e.clientY,
      noteId
    });
  };

  const handleCategoryContextMenu = (e: React.MouseEvent, categoryId: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Close other menus
    setNoteContextMenu(null);
    setSubCategoryContextMenu(null);
    setAssetContextMenu(null);
    setCategoryContextMenu({
      x: e.clientX,
      y: e.clientY,
      categoryId
    });
  };

  const handleSubCategoryContextMenu = (e: React.MouseEvent, subCategoryId: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Close other menus
    setNoteContextMenu(null);
    setCategoryContextMenu(null);
    setAssetContextMenu(null);
    setSubCategoryContextMenu({
      x: e.clientX,
      y: e.clientY,
      subCategoryId
    });
  };

  const handleAssetContextMenu = (e: React.MouseEvent, assetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Close other menus
    setNoteContextMenu(null);
    setCategoryContextMenu(null);
    setSubCategoryContextMenu(null);
    setAssetContextMenu({
      x: e.clientX,
      y: e.clientY,
      assetId
    });
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return FileText; // PDF documents
      case 'docx':
      case 'doc':
        return FileText; // Word documents
      case 'link':
        return LinkIcon; // Links
      case 'image':
        return Image; // Images
      case 'markdown':
      case 'text':
        return FileCode; // Code/text files
      case 'video':
      case 'mp4':
      case 'webm':
      case 'mov':
        return FileVideo; // Video files
      case 'audio':
      case 'mp3':
      case 'wav':
      case 'm4a':
      case 'aac':
        return FileAudio; // Audio files
      case 'zip':
      case 'rar':
      case '7z':
        return FileArchive; // Archive files
      default:
        return File; // Generic file
    }
  };

  const canDeleteCategory = (categoryId: string): boolean => {
    const categoryNotes = notes.filter(n => n.categoryId === categoryId && !n.isDeleted);
    return categoryNotes.length === 0;
  };

  const canDeleteSubCategory = (subCategoryId: string): boolean => {
    const subCategoryNotes = notes.filter(n => n.subCategoryId === subCategoryId && !n.isDeleted);
    return subCategoryNotes.length === 0;
  };

  const handleDragStart = (e: React.DragEvent, noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note?.isDeleted) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', noteId);
    e.dataTransfer.setData('itemType', 'note');
  };

  const handleAssetDragStart = (e: React.DragEvent, assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (asset?.isDeleted) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', assetId);
    e.dataTransfer.setData('itemType', 'asset');
  };

  const handleDragOver = (e: React.DragEvent, targetType: 'category' | 'subcategory', targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTarget({ type: targetType, id: targetId });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget(null);
  };

  const handleDrop = (e: React.DragEvent, targetCategoryId: string, targetSubCategoryId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const itemId = e.dataTransfer.getData('text/plain');
    const itemType = e.dataTransfer.getData('itemType');
    
    if (itemType === 'asset') {
      const asset = assets.find(a => a.id === itemId);
      
      if (!asset || asset.isDeleted) {
        setDragOverTarget(null);
        return;
      }

      // Check if dropping on same location
      const isSameLocation = asset.categoryId === targetCategoryId && 
                            asset.subCategoryId === targetSubCategoryId;
      
      if (!isSameLocation) {
        // Validate target sub-category belongs to target category
        if (targetSubCategoryId) {
          const subCategory = subCategories.find(sc => sc.id === targetSubCategoryId);
          if (!subCategory || subCategory.categoryId !== targetCategoryId) {
            setDragOverTarget(null);
            return;
          }
        }
        
        onMoveAsset(itemId, targetCategoryId, targetSubCategoryId);
      }
    } else {
      // Handle note drag (existing logic)
      const note = notes.find(n => n.id === itemId);
      
      if (!note || note.isDeleted) {
        setDragOverTarget(null);
        return;
      }

      // Check if dropping on same location
      const isSameLocation = note.categoryId === targetCategoryId && 
                            note.subCategoryId === targetSubCategoryId;
      
      if (!isSameLocation) {
        // Validate target sub-category belongs to target category
        if (targetSubCategoryId) {
          const subCategory = subCategories.find(sc => sc.id === targetSubCategoryId);
          if (!subCategory || subCategory.categoryId !== targetCategoryId) {
            setDragOverTarget(null);
            return;
          }
        }
        
        onMoveNote(itemId, targetCategoryId, targetSubCategoryId);
      }
    }
    
    setDragOverTarget(null);
  };

  const getIconComponent = (iconId?: string, withBackground: boolean = true) => {
    if (!iconId) return null;
    const iconMap: Record<string, any> = {
      folder: Folder,
      book: BookOpen,
      briefcase: Briefcase,
      heart: Heart,
      star: Star,
      lightbulb: Lightbulb,
      coffee: Coffee,
      music: Music,
    };
    const Icon = iconMap[iconId];
    if (!Icon) return null;
    
    if (withBackground) {
      return <Icon size={12} className="text-white" />;
    }
    return <Icon size={11} className="text-stone-500" />;
  };

  return (
    <div className="w-full md:w-72 h-auto md:h-screen bg-white border-r border-stone-200 flex flex-col overflow-hidden">
      {/* Header with Title */}
      <div className="p-3 md:p-4 border-b border-stone-200 flex-shrink-0">
        <h2 className="text-base md:text-lg font-bold text-stone-900">Library</h2>
      </div>

      {/* Create New Category Button */}
      <div className="px-3 md:px-4 py-2 flex-shrink-0">
        <button
          onClick={onOpenCategoryCreateModal}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-600 hover:bg-stone-100 px-2 py-1.5 rounded transition-colors text-xs font-medium w-full"
        >
          <Folder size={14} className="flex-shrink-0" />
          <span>New category</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-3 md:px-4 pb-4">
        <div className="space-y-0.5">
          {categories.map((category) => {
            const isCategoryExpanded = expandedCategories.has(category.id);
            const categoryNotes = getNotesForCategory(category.id);
            const categorySubCategories = getSubCategoriesForCategory(category.id);
            const isSelected = selectedCategoryId === category.id && !selectedSubCategoryId;
            
            return (
              <div key={category.id}>
                <div 
                  className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer group transition-colors ${
                    isSelected ? 'bg-stone-200' : 'hover:bg-stone-200'
                  } ${
                    dragOverTarget?.type === 'category' && dragOverTarget.id === category.id 
                      ? 'bg-stone-200 ring-1 ring-stone-300' 
                      : ''
                  }`}
                  onClick={() => {
                    toggleCategory(category.id);
                    onSelectCategory(category.id);
                  }}
                  onContextMenu={(e) => handleCategoryContextMenu(e, category.id)}
                  onDragOver={(e) => handleDragOver(e, 'category', category.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, category.id)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div 
                      className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center" 
                      style={{ backgroundColor: category.color }}
                    >
                      {getIconComponent(category.icon)}
                    </div>
                    <span className="text-stone-700 text-sm font-medium truncate">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-stone-400 flex-shrink-0">
                      {categoryNotes.length}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateNote(category.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-stone-300 rounded transition-opacity"
                      title="New note"
                    >
                      <Plus size={14} className="text-stone-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAssetModal(category.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-stone-300 rounded transition-opacity"
                      title="Add asset"
                    >
                      <File size={14} className="text-stone-600" />
                    </button>
                  </div>
                </div>

                {isCategoryExpanded && (
                  <div className="ml-6 space-y-0.5 mt-0.5">
                    {categoryNotes.map((note) => (
                      <div
                        key={note.id}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                          currentNoteId === note.id
                            ? 'bg-stone-300 text-stone-900'
                            : 'hover:bg-stone-200 text-stone-600'
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, note.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectNote(note.id);
                        }}
                        onContextMenu={(e) => handleNoteContextMenu(e, note.id)}
                      >
                        <FileText size={13} className="flex-shrink-0" />
                        <span className="text-xs truncate">{note.title}</span>
                        {note.isPinned && (
                          <Pin size={10} className="flex-shrink-0 text-stone-400 ml-auto" />
                        )}
                      </div>
                    ))}

                    {getAssetsForCategory(category.id).map((asset) => {
                      const AssetIcon = getAssetIcon(asset.type);
                      return (
                        <div
                          key={asset.id}
                          className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors hover:bg-stone-200 text-stone-500 group"
                          draggable
                          onDragStart={(e) => handleAssetDragStart(e, asset.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAsset(asset.id);
                          }}
                          onContextMenu={(e) => handleAssetContextMenu(e, asset.id)}
                        >
                          <AssetIcon size={11} className="flex-shrink-0" />
                          <span className="text-[11px] truncate">{asset.name}</span>
                        </div>
                      );
                    })}

                    {categorySubCategories.map((subCategory) => {
                      const subCategoryNotes = getNotesForCategory(category.id, subCategory.id);
                      const subCategoryAssets = getAssetsForCategory(category.id, subCategory.id);
                      const isSubSelected = selectedSubCategoryId === subCategory.id;

                      return (
                        <div key={subCategory.id} className="space-y-0.5">
                          <div
                            className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer group transition-colors ${
                              isSubSelected ? 'bg-stone-200' : 'hover:bg-stone-200'
                            } ${
                              dragOverTarget?.type === 'subcategory' && dragOverTarget.id === subCategory.id 
                                ? 'bg-stone-200 ring-1 ring-stone-300' 
                                : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectSubCategory(subCategory.id);
                            }}
                            onContextMenu={(e) => handleSubCategoryContextMenu(e, subCategory.id)}
                            onDragOver={(e) => handleDragOver(e, 'subcategory', subCategory.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, category.id, subCategory.id)}
                          >
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              {subCategory.icon && (
                                <div className="flex-shrink-0">
                                  {getIconComponent(subCategory.icon, false)}
                                </div>
                              )}
                              <span className="text-stone-600 text-xs font-medium truncate">
                                {subCategory.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-stone-400 flex-shrink-0">
                                {subCategoryNotes.length}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onCreateNote(category.id, subCategory.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-stone-300 rounded transition-opacity"
                                title="New note"
                              >
                                <Plus size={12} className="text-stone-600" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenAssetModal(category.id, subCategory.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-stone-300 rounded transition-opacity"
                                title="Add asset"
                              >
                                <File size={12} className="text-stone-600" />
                              </button>
                            </div>
                          </div>

                          {subCategoryNotes.map((note) => (
                            <div
                              key={note.id}
                              className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer ml-4 transition-colors ${
                                currentNoteId === note.id
                                  ? 'bg-stone-300 text-stone-900'
                                  : 'hover:bg-stone-200 text-stone-600'
                              }`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, note.id)}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectNote(note.id);
                              }}
                              onContextMenu={(e) => handleNoteContextMenu(e, note.id)}
                            >
                              <FileText size={12} className="flex-shrink-0" />
                              <span className="text-xs truncate">{note.title}</span>
                              {note.isPinned && (
                                <Pin size={9} className="flex-shrink-0 text-stone-400 ml-auto" />
                              )}
                            </div>
                          ))}

                          {subCategoryAssets.map((asset) => {
                            const AssetIcon = getAssetIcon(asset.type);
                            return (
                              <div
                                key={asset.id}
                                className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer ml-4 transition-colors hover:bg-stone-200 text-stone-500"
                                draggable
                                onDragStart={(e) => handleAssetDragStart(e, asset.id)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenAsset(asset.id);
                                }}
                                onContextMenu={(e) => handleAssetContextMenu(e, asset.id)}
                              >
                                <AssetIcon size={10} className="flex-shrink-0" />
                                <span className="text-[11px] truncate">{asset.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenSubCategoryCreateModal(category.id);
                      }}
                      className="flex items-center gap-1.5 px-2 py-1 text-xs text-stone-500 hover:text-stone-700 hover:bg-stone-200 rounded w-full transition-colors"
                    >
                      <Plus size={12} />
                      <span>Add sub-category</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Context Menus */}
      {noteContextMenu && (
        <NoteContextMenu
          x={noteContextMenu.x}
          y={noteContextMenu.y}
          isPinned={notes.find(n => n.id === noteContextMenu.noteId)?.isPinned}
          isInDefaultCategory={(() => {
            const note = notes.find(n => n.id === noteContextMenu.noteId);
            if (!note) return false;
            const category = categories.find(c => c.id === note.categoryId);
            return category?.isDefault || false;
          })()}
          onOpen={() => {
            onSelectNote(noteContextMenu.noteId);
            setNoteContextMenu(null);
          }}
          onDelete={() => {
            const noteId = noteContextMenu.noteId;
            setNoteContextMenu(null);
            onDeleteNote(noteId);
          }}
          onTogglePin={() => {
            onTogglePin(noteContextMenu.noteId);
            setNoteContextMenu(null);
          }}
          onClose={() => setNoteContextMenu(null)}
        />
      )}

      {categoryContextMenu && (
        <CategoryContextMenu
          x={categoryContextMenu.x}
          y={categoryContextMenu.y}
          canDelete={canDeleteCategory(categoryContextMenu.categoryId)}
          isDefault={categories.find(c => c.id === categoryContextMenu.categoryId)?.isDefault}
          onEdit={() => {
            onOpenCategoryEditModal(categoryContextMenu.categoryId);
            setCategoryContextMenu(null);
          }}
          onDelete={() => {
            onDeleteCategory(categoryContextMenu.categoryId);
            setCategoryContextMenu(null);
          }}
          onClose={() => setCategoryContextMenu(null)}
        />
      )}

      {subCategoryContextMenu && (
        <SubCategoryContextMenu
          x={subCategoryContextMenu.x}
          y={subCategoryContextMenu.y}
          canDelete={canDeleteSubCategory(subCategoryContextMenu.subCategoryId)}
          onRename={() => {
            onOpenSubCategoryEditModal(subCategoryContextMenu.subCategoryId);
            setSubCategoryContextMenu(null);
          }}
          onDelete={() => {
            onDeleteSubCategory(subCategoryContextMenu.subCategoryId);
            setSubCategoryContextMenu(null);
          }}
          onClose={() => setSubCategoryContextMenu(null)}
        />
      )}

      {assetContextMenu && (
        <AssetContextMenu
          x={assetContextMenu.x}
          y={assetContextMenu.y}
          isInDefaultCategory={(() => {
            const asset = assets.find(a => a.id === assetContextMenu.assetId);
            if (!asset) return false;
            const category = categories.find(c => c.id === asset.categoryId);
            return category?.isDefault || false;
          })()}
          onOpen={() => {
            onOpenAsset(assetContextMenu.assetId);
            setAssetContextMenu(null);
          }}
          onDelete={() => {
            onDeleteAsset(assetContextMenu.assetId);
            setAssetContextMenu(null);
          }}
          onClose={() => setAssetContextMenu(null)}
        />
      )}
    </div>
  );
};
