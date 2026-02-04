'use client';

import React, { useState, useEffect } from 'react';
import { Category, SubCategory, Note, ViewMode, Asset } from '@/app/types';
import { FileText, Plus, FolderPlus, Home, Clock, Pin, Library, Settings, Trash2, Search, Folder, BookOpen, Briefcase, Heart, Star, Lightbulb, Coffee, Music, MessageSquare, File, Link as LinkIcon, Image, FileCode, ChevronLeft, ChevronRight } from 'lucide-react';
import { NoteContextMenu } from './NoteContextMenu';
import { CategoryContextMenu } from './CategoryContextMenu';
import { SubCategoryContextMenu } from './SubCategoryContextMenu';
import { CategoryModal } from './CategoryModal';
import { SubCategoryModal } from './SubCategoryModal';
import { AssetContextMenu } from './AssetContextMenu';

interface SidebarProps {
  viewMode: ViewMode;
  categories: Category[];
  subCategories: SubCategory[];
  notes: Note[];
  assets: Asset[];
  currentNoteId: string | null;
  selectedCategoryId: string | null;
  selectedSubCategoryId: string | null;
  onSelectNote: (noteId: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onSelectSubCategory: (subCategoryId: string) => void;
  onCreateCategory: (name: string, color: string, icon?: string) => void;
  onUpdateCategory: (categoryId: string, name: string, color: string, icon?: string) => void;
  onCreateSubCategory: (categoryId: string, name: string, icon?: string) => void;
  onUpdateSubCategory: (subCategoryId: string, name: string, icon?: string) => void;
  onCreateNote: (categoryId: string, subCategoryId?: string) => void;
  onChangeView: (mode: ViewMode) => void;
  onDeleteNote: (noteId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onDeleteSubCategory: (subCategoryId: string) => void;
  onTogglePin: (noteId: string) => void;
  onMoveNote: (noteId: string, targetCategoryId: string, targetSubCategoryId?: string) => void;
  onMoveAsset: (assetId: string, targetCategoryId: string, targetSubCategoryId?: string) => void;
  onOpenFeedback: () => void;
  onOpenAsset: (assetId: string) => void;
  onDeleteAsset: (assetId: string) => void;
  onOpenAssetModal: (categoryId: string, subCategoryId?: string) => void;
  onOpenCategoryCreateModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  viewMode,
  categories,
  subCategories,
  notes,
  assets,
  currentNoteId, 
  selectedCategoryId,
  selectedSubCategoryId,
  onSelectNote,
  onSelectCategory,
  onSelectSubCategory,
  onCreateCategory,
  onUpdateCategory,
  onCreateSubCategory,
  onUpdateSubCategory,
  onCreateNote,
  onChangeView,
  onDeleteNote,
  onDeleteCategory,
  onDeleteSubCategory,
  onTogglePin,
  onMoveNote,
  onMoveAsset,
  onOpenFeedback,
  onOpenAsset,
  onDeleteAsset,
  onOpenAssetModal,
  onOpenCategoryCreateModal
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(categories.map(c => c.id)));
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<'create' | 'edit'>('create');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
  const [subCategoryModalMode, setSubCategoryModalMode] = useState<'create' | 'edit'>('create');
  const [editingSubCategoryId, setEditingSubCategoryId] = useState<string | null>(null);
  const [selectedCategoryForSubCategory, setSelectedCategoryForSubCategory] = useState<string | null>(null);
  const [isHoveringSettings, setIsHoveringSettings] = useState(false);
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
      case 'docx':
        return File;
      case 'link':
        return LinkIcon;
      case 'image':
        return Image;
      case 'markdown':
      case 'text':
        return FileCode;
      default:
        return File;
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

  const handleSaveCategory = (name: string, color: string, icon?: string) => {
    if (categoryModalMode === 'edit' && editingCategoryId) {
      onUpdateCategory(editingCategoryId, name, color, icon);
      setEditingCategoryId(null);
    } else {
      onCreateCategory(name, color, icon);
    }
  };

  const handleOpenCategoryEditModal = (categoryId: string) => {
    setEditingCategoryId(categoryId);
    setCategoryModalMode('edit');
    setIsCategoryModalOpen(true);
  };

  const handleOpenCategoryCreateModal = () => {
    setEditingCategoryId(null);
    setCategoryModalMode('create');
    setIsCategoryModalOpen(true);
  };

  const handleOpenSubCategoryModal = (categoryId: string) => {
    setSelectedCategoryForSubCategory(categoryId);
    setEditingSubCategoryId(null);
    setSubCategoryModalMode('create');
    setIsSubCategoryModalOpen(true);
  };

  const handleOpenSubCategoryEditModal = (subCategoryId: string) => {
    const subCategory = subCategories.find(sc => sc.id === subCategoryId);
    if (subCategory) {
      setSelectedCategoryForSubCategory(subCategory.categoryId);
      setEditingSubCategoryId(subCategoryId);
      setSubCategoryModalMode('edit');
      setIsSubCategoryModalOpen(true);
    }
  };

  const handleSaveSubCategory = (name: string, icon?: string) => {
    if (subCategoryModalMode === 'edit' && editingSubCategoryId) {
      onUpdateSubCategory(editingSubCategoryId, name, icon);
      setEditingSubCategoryId(null);
    } else if (selectedCategoryForSubCategory) {
      onCreateSubCategory(selectedCategoryForSubCategory, name, icon);
    }
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

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Keyboard navigation state
  const [keyboardNavIndex, setKeyboardNavIndex] = useState(0);
  const [keyboardNavItems, setKeyboardNavItems] = useState<Array<{type: 'category' | 'subcategory' | 'note', id: string}>>([]);

  // Build keyboard navigation items when in library mode
  useEffect(() => {
    if (viewMode === 'library') {
      const items: Array<{type: 'category' | 'subcategory' | 'note', id: string}> = [];
      
      categories.forEach(category => {
        items.push({ type: 'category', id: category.id });
        
        // Add category-level notes
        const categoryNotes = getNotesForCategory(category.id);
        categoryNotes.forEach(note => {
          items.push({ type: 'note', id: note.id });
        });
        
        // Add subcategories and their notes
        const categorySubCategories = getSubCategoriesForCategory(category.id);
        categorySubCategories.forEach(subCategory => {
          items.push({ type: 'subcategory', id: subCategory.id });
          
          const subCategoryNotes = getNotesForCategory(category.id, subCategory.id);
          subCategoryNotes.forEach(note => {
            items.push({ type: 'note', id: note.id });
          });
        });
      });
      
      setKeyboardNavItems(items);
      setKeyboardNavIndex(0);
    }
  }, [viewMode, categories, subCategories, notes]);

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'library' || keyboardNavItems.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setKeyboardNavIndex(prev => 
          prev < keyboardNavItems.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setKeyboardNavIndex(prev => prev > 0 ? prev - 1 : 0);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const currentItem = keyboardNavItems[keyboardNavIndex];
        if (currentItem) {
          if (currentItem.type === 'category') {
            onSelectCategory(currentItem.id);
          } else if (currentItem.type === 'subcategory') {
            onSelectSubCategory(currentItem.id);
          } else if (currentItem.type === 'note') {
            onSelectNote(currentItem.id);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, keyboardNavItems, keyboardNavIndex]);

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

  const getViewModeIcon = (mode: ViewMode) => {
    const iconMap: Record<ViewMode, any> = {
      home: Home,
      recent: Clock,
      pins: Pin,
      library: Library,
      settings: Settings,
      bin: Trash2,
      search: Search,
    };
    return iconMap[mode];
  };

  const getViewModeLabel = (mode: ViewMode) => {
    const labelMap: Record<ViewMode, string> = {
      home: 'All Notes',
      recent: 'Recent',
      pins: 'Pins',
      library: 'Library',
      settings: 'Settings',
      bin: 'Bin',
      search: 'Search',
    };
    return labelMap[mode];
  };

  return (
    <div className={`h-screen bg-white flex flex-col border-r border-stone-200 transition-all duration-300 ${sidebarOpen ? 'w-60 sm:w-64' : 'w-16 sm:w-20'}`}>
      {/* Header with toggle button */}
      <div className="flex items-center justify-between p-4 border-b border-stone-200">
        {sidebarOpen && <h2 className="text-lg font-bold text-stone-900">Pulm</h2>}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors flex-shrink-0"
          title={sidebarOpen ? "Collapse" : "Expand"}
        >
          {sidebarOpen ? (
            <ChevronLeft size={18} className="text-stone-600" />
          ) : (
            <ChevronRight size={18} className="text-stone-600" />
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <div className={`p-3 space-y-1 ${!sidebarOpen && 'flex flex-col items-center'}`}>
        {(['home', 'recent', 'pins'] as ViewMode[]).map((mode) => {
          const Icon = getViewModeIcon(mode);
          return (
            <div key={mode} className="group relative">
              <button
                onClick={() => onChangeView(mode)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-sm font-medium ${
                  viewMode === mode
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-stone-600 hover:bg-stone-100'
                } ${!sidebarOpen && 'w-fit p-3 justify-center'}`}
                title={sidebarOpen ? undefined : getViewModeLabel(mode)}
              >
                <Icon size={18} className="flex-shrink-0" />
                {sidebarOpen && <span>{getViewModeLabel(mode)}</span>}
              </button>
              {!sidebarOpen && (
                <div className="absolute left-20 top-1/2 -translate-y-1/2 bg-stone-900 text-white text-xs font-medium px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {getViewModeLabel(mode)}
                </div>
              )}
            </div>
          );
        })}

        {/* Library Button */}
        <div className="group relative">
          <button
            onClick={() => onChangeView('library')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium w-full text-stone-600 hover:bg-stone-100`}
            title="Library"
          >
            <Library size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Library</span>}
          </button>
        </div>
      </div>

      {/* Bottom Section with Settings and More */}
      <div className={`mt-auto border-t border-stone-200 p-3 space-y-1 flex flex-col ${!sidebarOpen && 'items-center'}`}>
        {!sidebarOpen && (
          <div className="space-y-1 w-full">
            {(['search', 'bin'] as ViewMode[]).map((mode) => {
              const Icon = getViewModeIcon(mode);
              return (
                <div key={mode} className="group relative">
                  <button
                    onClick={() => onChangeView(mode)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-fit text-sm font-medium ${
                      viewMode === mode
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-stone-600 hover:bg-stone-100'
                    } p-3 justify-center`}
                    title={getViewModeLabel(mode)}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                  </button>
                  <div className="absolute left-20 top-1/2 -translate-y-1/2 bg-stone-900 text-white text-xs font-medium px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    {getViewModeLabel(mode)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {sidebarOpen && (
          <>
            <button
              onClick={() => onChangeView('search')}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-sm font-medium ${
                viewMode === 'search'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Search size={18} className="flex-shrink-0" />
              <span>Search</span>
            </button>

            <button
              onClick={() => onChangeView('bin')}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-sm font-medium ${
                viewMode === 'bin'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Trash2 size={18} className="flex-shrink-0" />
              <span>Bin</span>
            </button>

            <button
              onClick={onOpenFeedback}
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-sm font-medium text-stone-600 hover:bg-stone-100"
            >
              <MessageSquare size={18} className="flex-shrink-0" />
              <span>Feedback</span>
            </button>
          </>
        )}

        <div className="group relative">
          <button
            onClick={() => onChangeView('settings')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${sidebarOpen ? 'w-full' : 'w-fit p-3 justify-center'} ${
              viewMode === 'settings'
                ? 'bg-blue-100 text-blue-700'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
            title={sidebarOpen ? undefined : 'Settings'}
          >
            <Settings size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Settings</span>}
          </button>
          {!sidebarOpen && (
            <div className="absolute left-20 top-1/2 -translate-y-1/2 bg-stone-900 text-white text-xs font-medium px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              Settings
            </div>
          )}
        </div>
      </div>

      {/* Context Menus */}
      {noteContextMenu && (
        <NoteContextMenu
          x={noteContextMenu.x}
          y={noteContextMenu.y}
          isPinned={notes.find(n => n.id === noteContextMenu.noteId)?.isPinned}
          onOpen={() => {
            onSelectNote(noteContextMenu.noteId);
            setNoteContextMenu(null);
          }}
          onDelete={() => {
            onDeleteNote(noteContextMenu.noteId);
            setNoteContextMenu(null);
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
          onEdit={() => handleOpenCategoryEditModal(categoryContextMenu.categoryId)}
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
          onRename={() => handleOpenSubCategoryEditModal(subCategoryContextMenu.subCategoryId)}
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

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategoryId(null);
        }}
        onSave={handleSaveCategory}
        initialData={editingCategoryId ? categories.find(c => c.id === editingCategoryId) : undefined}
        mode={categoryModalMode}
      />

      <SubCategoryModal
        isOpen={isSubCategoryModalOpen}
        categoryName={categories.find(c => c.id === selectedCategoryForSubCategory)?.name || ''}
        onClose={() => {
          setIsSubCategoryModalOpen(false);
          setSelectedCategoryForSubCategory(null);
          setEditingSubCategoryId(null);
        }}
        onSave={handleSaveSubCategory}
        initialData={editingSubCategoryId ? subCategories.find(sc => sc.id === editingSubCategoryId) : undefined}
        mode={subCategoryModalMode}
      />
    </div>
  );
};
