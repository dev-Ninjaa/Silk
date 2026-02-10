'use client';

import { Sidebar } from "@/app/components/Sidebar";
// import { SecondarySidebar } from "@/app/components/SecondarySidebar";
// import { ReflectionSidebar } from "@/app/components/ReflectionSidebar";
import { TopBar } from "@/app/components/TopBar";
import { AllNotesView } from "@/app/components/AllNotesView";
import { RecentView } from "@/app/components/RecentView";
import { PinsView } from "@/app/components/PinsView";
import { SettingsModal } from "@/app/components/SettingsModal";
import { FeedbackPanel } from "@/app/components/FeedbackPanel";
import { BinView } from "@/app/components/BinView";
import { CommandPalette } from "@/app/components/CommandPalette";
import { AssetModal } from "@/app/components/AssetModal";
import { AssetViewer } from "@/app/components/AssetViewer";
import { NoteView } from "@/app/components/NoteView";
import { NoteTabs } from "@/app/components/NoteTabs";
import { CategoryModal } from "@/app/components/CategoryModal";
import { SubCategoryModal } from "@/app/components/SubCategoryModal";
import { defaultCategories } from "@/app/data/defaultCategories";
import { defaultNotes } from "@/app/data/defaultNotes";
import { Note, Block, Category, SubCategory, ViewMode, DailyReflection, Asset, AssetType } from "@/app/types";
import {
  NoteStore, LocalStorageNoteStore,
  CategoryStore, LocalStorageCategoryStore,
  SubCategoryStore, LocalStorageSubCategoryStore,
  ReflectionStore, LocalStorageReflectionStore,
  AssetStore, LocalStorageAssetStore
} from "@/app/lib/persistence";
import { useState, useEffect } from "react";

const noteStore: NoteStore = new LocalStorageNoteStore();
const categoryStore: CategoryStore = new LocalStorageCategoryStore();
const subCategoryStore: SubCategoryStore = new LocalStorageSubCategoryStore();
const reflectionStore: ReflectionStore = new LocalStorageReflectionStore();
const assetStore: AssetStore = new LocalStorageAssetStore();

const generateId = () => Math.random().toString(36).substring(2, 11);

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [reflections, setReflections] = useState<DailyReflection[]>([]);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [openNoteIds, setOpenNoteIds] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [isReadMode, setIsReadMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetModalContext, setAssetModalContext] = useState<{ categoryId: string; subCategoryId?: string } | null>(null);
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<'create' | 'edit'>('create');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
  const [subCategoryModalMode, setSubCategoryModalMode] = useState<'create' | 'edit'>('create');
  const [editingSubCategoryId, setEditingSubCategoryId] = useState<string | null>(null);
  const [subCategoryParentId, setSubCategoryParentId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const loadedCategories = await categoryStore.loadCategories();
      const loadedSubCategories = await subCategoryStore.loadSubCategories();
      const loadedNotes = await noteStore.loadNotes();
      const loadedAssets = await assetStore.loadAssets();
      const loadedReflections = await reflectionStore.loadReflections();

      if (loadedCategories.length > 0) {
        setCategories(loadedCategories);
      } else {
        setCategories(defaultCategories);
        await categoryStore.saveCategories(defaultCategories);
      }

      setSubCategories(loadedSubCategories);

      if (loadedNotes.length > 0) {
        setNotes(loadedNotes);
      } else {
        setNotes(defaultNotes);
        await noteStore.saveNotes(defaultNotes);
      }

      setAssets(loadedAssets);
      setReflections(loadedReflections);
      setIsLoaded(true);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded && categories.length > 0) {
      categoryStore.saveCategories(categories);
    }
  }, [categories, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      subCategoryStore.saveSubCategories(subCategories);
    }
  }, [subCategories, isLoaded]);

  useEffect(() => {
    if (isLoaded && notes.length > 0) {
      noteStore.saveNotes(notes);
    }
  }, [notes, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      reflectionStore.saveReflections(reflections);
    }
  }, [reflections, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      assetStore.saveAssets(assets);
    }
  }, [assets, isLoaded]);

  // Listen for remote create-asset requests from components embedded in the editor (e.g., upload nodes)
  useEffect(() => {
    const handler = async (ev: Event) => {
      const ce = ev as CustomEvent<{
        correlationId: string
        name: string
        type: AssetType
        source: { kind: 'file'; dataUrl: string } | { kind: 'link'; url: string }
        src?: string
      }>

      const { correlationId, name, type, source, src } = ce.detail

      // Determine category from the currently open note (if any), otherwise fall back to 'Uncategorized'
      let categoryId = categories.find((c) => c.name === 'Uncategorized')?.id
      if (currentNoteId) {
        const note = notes.find((n) => n.id === currentNoteId)
        if (note && note.categoryId) {
          categoryId = note.categoryId
        }
      }

      if (!categoryId) {
        const newCategory = {
          id: `cat-uncategorized-${generateId()}`,
          name: 'Uncategorized',
          color: '#a8a29e',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Category
        setCategories((prev) => [...prev, newCategory])
        categoryId = newCategory.id
      }

      const newAsset: Asset = {
        id: `asset-${generateId()}`,
        name,
        type,
        categoryId: categoryId!,
        subCategoryId: undefined,
        source,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setAssets((prev) => [...prev, newAsset])

      // Respond with assigned id so the caller can attach it to the node
      window.dispatchEvent(new CustomEvent('app:create-asset-response', { detail: { correlationId, assetId: newAsset.id, src } }))
    }

    window.addEventListener('app:create-asset-request', handler)
    return () => window.removeEventListener('app:create-asset-request', handler)
  }, [isLoaded, currentNoteId, categories.length, notes.length, subCategories.length])


  const currentNote = notes.find(n => n.id === currentNoteId);

  const handleUpdateTitle = (noteId: string, title: string) => {
    setNotes(notes.map(n =>
      n.id === noteId
        ? { ...n, title, updatedAt: new Date() }
        : n
    ));
  };

  const handleUpdateBlocks = (noteId: string, blocks: Block[]) => {
    setNotes(notes.map(n =>
      n.id === noteId
        ? { ...n, blocks, updatedAt: new Date() }
        : n
    ));
  };

  const handleCreateCategory = (name: string, color: string, icon?: string) => {
    const newCategory: Category = {
      id: `cat-${generateId()}`,
      name,
      color,
      icon,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setCategories([...categories, newCategory]);
  };

  const handleUpdateCategory = (categoryId: string, name: string, color: string, icon?: string) => {
    // Prevent editing default category
    const category = categories.find(c => c.id === categoryId);
    if (category?.isDefault) {
      return;
    }
    
    setCategories(categories.map(c =>
      c.id === categoryId
        ? { ...c, name, color, icon, updatedAt: new Date() }
        : c
    ));
  };

  const handleSaveCategory = (name: string, color: string, icon?: string) => {
    if (categoryModalMode === 'edit' && editingCategoryId) {
      handleUpdateCategory(editingCategoryId, name, color, icon);
      setEditingCategoryId(null);
    } else {
      handleCreateCategory(name, color, icon);
    }
    setIsCategoryModalOpen(false);
  };

  const handleCreateSubCategory = (categoryId: string, name: string, icon?: string) => {
    const newSubCategory: SubCategory = {
      id: `sub-${generateId()}`,
      name,
      categoryId,
      icon,
      createdAt: new Date()
    };
    setSubCategories([...subCategories, newSubCategory]);
  };

  const handleOpenSubCategoryCreateModal = (categoryId: string) => {
    setSubCategoryParentId(categoryId);
    setEditingSubCategoryId(null);
    setSubCategoryModalMode('create');
    setIsSubCategoryModalOpen(true);
  };

  const handleOpenSubCategoryEditModal = (subCategoryId: string) => {
    const subCategory = subCategories.find(sc => sc.id === subCategoryId);
    if (subCategory) {
      setEditingSubCategoryId(subCategoryId);
      setSubCategoryParentId(subCategory.categoryId);
      setSubCategoryModalMode('edit');
      setIsSubCategoryModalOpen(true);
    }
  };

  const handleSaveSubCategory = (name: string, icon?: string) => {
    if (subCategoryModalMode === 'edit' && editingSubCategoryId) {
      setSubCategories(subCategories.map(sc =>
        sc.id === editingSubCategoryId
          ? { ...sc, name, icon, updatedAt: new Date() }
          : sc
      ));
    } else if (subCategoryParentId) {
      handleCreateSubCategory(subCategoryParentId, name, icon);
    }
    setIsSubCategoryModalOpen(false);
  };

  const handleUpdateSubCategory = (subCategoryId: string, name: string, icon?: string) => {
    setSubCategories(subCategories.map(sc =>
      sc.id === subCategoryId
        ? { ...sc, name, icon }
        : sc
    ));
  };

  const handleMoveNote = (noteId: string, targetCategoryId: string, targetSubCategoryId?: string) => {
    setNotes(notes.map(n =>
      n.id === noteId
        ? {
          ...n,
          categoryId: targetCategoryId,
          subCategoryId: targetSubCategoryId,
          updatedAt: new Date()
        }
        : n
    ));
  };

  const handleMoveAsset = (assetId: string, targetCategoryId: string, targetSubCategoryId?: string) => {
    setAssets(assets.map(a =>
      a.id === assetId
        ? {
          ...a,
          categoryId: targetCategoryId,
          subCategoryId: targetSubCategoryId,
          updatedAt: new Date()
        }
        : a
    ));
  };

  const handleOpenCategoryCreateModal = () => {
    setEditingCategoryId(null);
    setCategoryModalMode('create');
    setIsCategoryModalOpen(true);
  };

  const handleOpenCategoryEditModal = (categoryId: string) => {
    setEditingCategoryId(categoryId);
    setCategoryModalMode('edit');
    setIsCategoryModalOpen(true);
  };

  const handleCreateNote = (categoryId: string, subCategoryId?: string) => {
    const newNote: Note = {
      id: `note-${generateId()}`,
      title: 'Untitled',
      blocks: [{ id: generateId(), type: 'text', content: '' }],
      categoryId,
      subCategoryId,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastOpenedAt: new Date()
    };
    setNotes([...notes, newNote]);
    setCurrentNoteId(newNote.id);
    setSelectedCategoryId(categoryId);
    setSelectedSubCategoryId(subCategoryId || null);
    setViewMode('library');
  };

  const handleSelectNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);

    // Don't open deleted notes
    if (!note || note.isDeleted) {
      return;
    }

    setCurrentNoteId(noteId);
    setSelectedCategoryId(note.categoryId);
    setSelectedSubCategoryId(note.subCategoryId || null);
    setNotes(notes.map(n =>
      n.id === noteId
        ? { ...n, lastOpenedAt: new Date() }
        : n
    ));
    setViewMode('library');

    // Add to open tabs if not already there
    if (!openNoteIds.includes(noteId)) {
      setOpenNoteIds([...openNoteIds, noteId]);
    }
  };

  const handleOpenNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);

    if (!note || note.isDeleted) {
      return;
    }

    setCurrentNoteId(noteId);
    setSelectedCategoryId(note.categoryId);
    setSelectedSubCategoryId(note.subCategoryId || null);
    setNotes(notes.map(n =>
      n.id === noteId
        ? { ...n, lastOpenedAt: new Date() }
        : n
    ));
    setViewMode('library');

    // Add to open tabs if not already there
    if (!openNoteIds.includes(noteId)) {
      setOpenNoteIds([...openNoteIds, noteId]);
    }
  };

  const handleCloseTab = (noteId: string) => {
    const newOpenNoteIds = openNoteIds.filter(id => id !== noteId);
    setOpenNoteIds(newOpenNoteIds);

    // If closing the current note, switch to another open note or null
    if (currentNoteId === noteId) {
      if (newOpenNoteIds.length > 0) {
        setCurrentNoteId(newOpenNoteIds[newOpenNoteIds.length - 1]);
      } else {
        setCurrentNoteId(null);
        setViewMode('home');
      }
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubCategoryId(null);
  };

  const handleSelectSubCategory = (subCategoryId: string) => {
    const subCategory = subCategories.find(sc => sc.id === subCategoryId);
    if (subCategory) {
      setSelectedCategoryId(subCategory.categoryId);
      setSelectedSubCategoryId(subCategoryId);
    }
  };

  const handleChangeView = (mode: ViewMode) => {
    if (mode === 'settings') {
      setIsSettingsModalOpen(true);
    } else if (mode === 'search') {
      setIsCommandPaletteOpen(true);
    } else {
      setViewMode(mode);
      if (mode !== 'library') {
        setCurrentNoteId(null);
      }
    }
  };

  const handleDeleteNote = (noteId: string) => {
    // Prevent deleting notes in default category
    const note = notes.find(n => n.id === noteId);
    if (note) {
      const category = categories.find(c => c.id === note.categoryId);
      if (category?.isDefault) {
        return;
      }
    }
    
    setNotes(notes.map(n =>
      n.id === noteId
        ? { ...n, isDeleted: true, deletedAt: new Date(), updatedAt: new Date() }
        : n
    ));
  };

  const handleRestoreNote = (noteId: string) => {
    setNotes(notes.map(n => {
      if (n.id !== noteId) return n;

      // Validate and repair category/sub-category references
      let validCategoryId = n.categoryId;
      let validSubCategoryId = n.subCategoryId;

      // Check if category exists
      const categoryExists = categories.some(c => c.id === n.categoryId);

      if (!categoryExists) {
        // Category was deleted - find or create "Uncategorized" fallback
        let uncategorizedCategory = categories.find(c => c.name === 'Uncategorized');

        if (!uncategorizedCategory) {
          // Create fallback category
          const newCategory: Category = {
            id: `cat-uncategorized-${generateId()}`,
            name: 'Uncategorized',
            color: '#a8a29e', // stone color
            createdAt: new Date(),
            updatedAt: new Date()
          };
          setCategories(prev => [...prev, newCategory]);
          validCategoryId = newCategory.id;
        } else {
          validCategoryId = uncategorizedCategory.id;
        }

        // Clear sub-category since parent category is invalid
        validSubCategoryId = undefined;
      } else if (validSubCategoryId) {
        // Category exists, but check if sub-category exists
        const subCategoryExists = subCategories.some(
          sc => sc.id === validSubCategoryId && sc.categoryId === validCategoryId
        );

        if (!subCategoryExists) {
          // Sub-category was deleted - clear reference
          validSubCategoryId = undefined;
        }
      }

      return {
        ...n,
        categoryId: validCategoryId,
        subCategoryId: validSubCategoryId,
        isDeleted: false,
        deletedAt: undefined,
        updatedAt: new Date()
      };
    }));
  };

  const handleDeleteForever = (noteId: string) => {
    // Remove the note and clean up all mentions of it in other notes
    setNotes(notes.filter(n => n.id !== noteId).map(note => {
      // Check if this note has any blocks with mentions
      const hasAffectedMentions = note.blocks.some(block =>
        block.mentions?.some(mention => mention.noteId === noteId)
      );

      if (!hasAffectedMentions) {
        return note;
      }

      // Clean up mentions of the deleted note
      const updatedBlocks = note.blocks.map(block => {
        if (!block.mentions || block.mentions.length === 0) {
          return block;
        }

        const filteredMentions = block.mentions.filter(mention => mention.noteId !== noteId);

        // If mentions were removed, update the block
        if (filteredMentions.length !== block.mentions.length) {
          return { ...block, mentions: filteredMentions };
        }

        return block;
      });

      return { ...note, blocks: updatedBlocks, updatedAt: new Date() };
    }));
  };

  const handleDeleteCategory = (categoryId: string) => {
    // Prevent deleting default category
    const category = categories.find(c => c.id === categoryId);
    if (category?.isDefault) {
      return;
    }
    
    // Check if category has any notes (including in sub-categories)
    const categoryNotes = notes.filter(n => n.categoryId === categoryId && !n.isDeleted);
    if (categoryNotes.length === 0) {
      // Find sub-categories that belong to this category
      const subCatIdsToRemove = subCategories.filter(sc => sc.categoryId === categoryId).map(sc => sc.id);

      // Remove the category and its sub-categories
      setCategories(categories.filter(c => c.id !== categoryId));
      setSubCategories(subCategories.filter(sc => sc.categoryId !== categoryId));

      // Remove assets that belong to this category or its sub-categories
      const removedAssetIds = new Set(assets.filter(a => a.categoryId === categoryId || (a.subCategoryId && subCatIdsToRemove.includes(a.subCategoryId))).map(a => a.id));
      if (removedAssetIds.size > 0) {
        setAssets(assets.filter(a => !removedAssetIds.has(a.id)));

        // Clean up asset mentions in notes for removed assets
        setNotes(notes.map(note => {
          const hasAffectedMentions = note.blocks.some(block =>
            block.assetMentions?.some(mention => removedAssetIds.has(mention.assetId))
          );

          if (!hasAffectedMentions) return note;

          const updatedBlocks = note.blocks.map(block => {
            if (!block.assetMentions || block.assetMentions.length === 0) return block;
            const filteredMentions = block.assetMentions.filter(mention => !removedAssetIds.has(mention.assetId));
            return { ...block, assetMentions: filteredMentions };
          });

          return { ...note, blocks: updatedBlocks, updatedAt: new Date() };
        }));
      }

      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(null);
        setSelectedSubCategoryId(null);
      }
    }
  };

  const handleDeleteSubCategory = (subCategoryId: string) => {
    const subCategoryNotes = notes.filter(n => n.subCategoryId === subCategoryId && !n.isDeleted);
    if (subCategoryNotes.length === 0) {
      // Remove the sub-category
      setSubCategories(subCategories.filter(sc => sc.id !== subCategoryId));

      // Remove assets that belong to this sub-category
      const removedAssetIds = new Set(assets.filter(a => a.subCategoryId === subCategoryId).map(a => a.id));
      if (removedAssetIds.size > 0) {
        setAssets(assets.filter(a => !removedAssetIds.has(a.id)));

        // Clean up asset mentions in notes for removed assets
        setNotes(notes.map(note => {
          const hasAffectedMentions = note.blocks.some(block =>
            block.assetMentions?.some(mention => removedAssetIds.has(mention.assetId))
          );

          if (!hasAffectedMentions) return note;

          const updatedBlocks = note.blocks.map(block => {
            if (!block.assetMentions || block.assetMentions.length === 0) return block;
            const filteredMentions = block.assetMentions.filter(mention => !removedAssetIds.has(mention.assetId));
            return { ...block, assetMentions: filteredMentions };
          });

          return { ...note, blocks: updatedBlocks, updatedAt: new Date() };
        }));
      }

      if (selectedSubCategoryId === subCategoryId) {
        setSelectedSubCategoryId(null);
      }
    }
  };

  const getCurrentCategory = (): Category | undefined => {
    if (!currentNote) return undefined;
    return categories.find(c => c.id === currentNote.categoryId);
  };

  const getCurrentSubCategory = (): SubCategory | undefined => {
    if (!currentNote || !currentNote.subCategoryId) return undefined;
    return subCategories.find(sc => sc.id === currentNote.subCategoryId);
  };

  const handleTogglePin = (noteId: string) => {
    setNotes(notes.map(n =>
      n.id === noteId
        ? { ...n, isPinned: !n.isPinned, updatedAt: new Date() }
        : n
    ));
  };

  const handleUpdateReflection = (date: string, text: string) => {
    const existingIndex = reflections.findIndex(r => r.date === date);

    if (existingIndex >= 0) {
      setReflections(reflections.map((r, i) =>
        i === existingIndex ? { ...r, text } : r
      ));
    } else {
      const newReflection: DailyReflection = {
        date,
        text,
        noteIds: []
      };
      setReflections([...reflections, newReflection]);
    }
  };

  const handleOpenAssetModal = (categoryId: string, subCategoryId?: string) => {
    setAssetModalContext({ categoryId, subCategoryId });
    setIsAssetModalOpen(true);
  };

  const handleCreateAsset = (name: string, type: AssetType, source: { kind: 'file'; dataUrl: string } | { kind: 'link'; url: string }) => {
    if (!assetModalContext) return;

    const newAsset: Asset = {
      id: `asset-${generateId()}`,
      name,
      type,
      categoryId: assetModalContext.categoryId,
      subCategoryId: assetModalContext.subCategoryId,
      source,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setAssets([...assets, newAsset]);
  };

  const handleOpenAsset = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (asset && !asset.isDeleted) {
      setViewingAsset(asset);
    }
  };

  const handleDeleteAsset = (assetId: string) => {
    // Prevent deleting assets in default category
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      const category = categories.find(c => c.id === asset.categoryId);
      if (category?.isDefault) {
        return;
      }
    }
    
    setAssets(assets.map(a =>
      a.id === assetId
        ? { ...a, isDeleted: true, deletedAt: new Date(), updatedAt: new Date() }
        : a
    ));
  };

  const handleRestoreAsset = (assetId: string) => {
    setAssets(assets.map(a => {
      if (a.id !== assetId) return a;

      // Validate and repair category/sub-category references
      let validCategoryId = a.categoryId;
      let validSubCategoryId = a.subCategoryId;

      const categoryExists = categories.some(c => c.id === a.categoryId);

      if (!categoryExists) {
        let uncategorizedCategory = categories.find(c => c.name === 'Uncategorized');

        if (!uncategorizedCategory) {
          const newCategory: Category = {
            id: `cat-uncategorized-${generateId()}`,
            name: 'Uncategorized',
            color: '#a8a29e',
            createdAt: new Date(),
            updatedAt: new Date()
          };
          setCategories(prev => [...prev, newCategory]);
          validCategoryId = newCategory.id;
        } else {
          validCategoryId = uncategorizedCategory.id;
        }

        validSubCategoryId = undefined;
      } else if (validSubCategoryId) {
        const subCategoryExists = subCategories.some(
          sc => sc.id === validSubCategoryId && sc.categoryId === validCategoryId
        );

        if (!subCategoryExists) {
          validSubCategoryId = undefined;
        }
      }

      return {
        ...a,
        categoryId: validCategoryId,
        subCategoryId: validSubCategoryId,
        isDeleted: false,
        deletedAt: undefined,
        updatedAt: new Date()
      };
    }));
  };

  const handleDeleteAssetForever = (assetId: string) => {
    setAssets(assets.filter(a => a.id !== assetId));

    // Clean up asset mentions in notes
    setNotes(notes.map(note => {
      const hasAffectedMentions = note.blocks.some(block =>
        block.assetMentions?.some(mention => mention.assetId === assetId)
      );

      if (!hasAffectedMentions) {
        return note;
      }

      const updatedBlocks = note.blocks.map(block => {
        if (!block.assetMentions || block.assetMentions.length === 0) {
          return block;
        }

        const filteredMentions = block.assetMentions.filter(mention => mention.assetId !== assetId);

        if (filteredMentions.length !== block.assetMentions.length) {
          return { ...block, assetMentions: filteredMentions };
        }

        return block;
      });

      return { ...note, blocks: updatedBlocks, updatedAt: new Date() };
    }));
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#DFEBF6] text-gray-900 font-sans selection:bg-blue-100 flex-col lg:flex-row">
      {/* Sidebar - Hidden on mobile, visible on lg+ */}
      <div className="hidden lg:block">
        <Sidebar
          viewMode={viewMode}
          categories={categories}
          subCategories={subCategories}
          notes={notes}
          assets={assets}
          currentNoteId={currentNoteId}
          selectedCategoryId={selectedCategoryId}
          selectedSubCategoryId={selectedSubCategoryId}
          onSelectNote={handleSelectNote}
          onSelectCategory={handleSelectCategory}
          onSelectSubCategory={handleSelectSubCategory}
          onCreateCategory={handleCreateCategory}
          onUpdateCategory={handleUpdateCategory}
          onCreateSubCategory={handleCreateSubCategory}
          onUpdateSubCategory={handleUpdateSubCategory}
          onCreateNote={handleCreateNote}
          onChangeView={handleChangeView}
          onDeleteNote={handleDeleteNote}
          onDeleteCategory={handleDeleteCategory}
          onDeleteSubCategory={handleDeleteSubCategory}
          onTogglePin={handleTogglePin}
          onMoveNote={handleMoveNote}
          onMoveAsset={handleMoveAsset}
          onOpenFeedback={() => setIsFeedbackPanelOpen(true)}
          onOpenAsset={handleOpenAsset}
          onDeleteAsset={handleDeleteAsset}
          onOpenAssetModal={handleOpenAssetModal}
          onOpenCategoryCreateModal={handleOpenCategoryCreateModal}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden p-2 md:p-3">
        <div className="bg-white flex-1 flex flex-col overflow-hidden rounded-2xl md:rounded-3xl shadow-sm border border-white/50 relative">

          <div className="flex flex-1 overflow-hidden">

            <div className="flex-1 overflow-hidden cursor-text flex flex-col">
              {viewMode === 'library' && currentNote && (
                <>
                  {/* Top Bar with breadcrumb and controls */}
                  <TopBar
                    viewMode={viewMode}
                    categoryName={getCurrentCategory()?.name}
                    subCategoryName={getCurrentSubCategory()?.name}
                    noteName={currentNote?.title}
                    isPinned={currentNote?.isPinned}
                    activeTab="pages"
                    onTogglePin={() => currentNote && handleTogglePin(currentNote.id)}
                  />

                  {/* Content Divider */}
                  <div className="border-b border-stone-200 w-full" />

                  {/* Tabs Section (Divider 2) */}
                  <NoteTabs
                    openNotes={openNoteIds.map(id => notes.find(n => n.id === id)).filter(Boolean) as Note[]}
                    currentNoteId={currentNoteId}
                    onSelectNote={handleOpenNote}
                    onCloseTab={handleCloseTab}
                  />
                  <div className="flex-1 overflow-y-auto">
                    <NoteView
                      note={currentNote}
                      allNotes={[ 
                        ...notes.map(n => ({ id: n.id, title: n.title, isDeleted: n.isDeleted })),
                        ...assets.filter(a => !a.isDeleted).map(a => ({
                          id: a.id,
                          title: `📎 ${a.name}`,
                          isDeleted: false
                        }))
                      ]}
                      assets={assets.filter(a => !a.isDeleted)}
                      onUpdateTitle={handleUpdateTitle}
                      onUpdateBlocks={handleUpdateBlocks}
                      onOpenNote={(id) => {
                        if (id.startsWith('asset-')) {
                          handleOpenAsset(id);
                        } else {
                          handleOpenNote(id);
                        }
                      }}
                    />
                  </div>
                </>
              )}

              {viewMode === 'home' && (
                <>
                  <AllNotesView
                    notes={notes}
                    categories={categories}
                    onSelectNote={handleSelectNote}
                    onDeleteNote={handleDeleteNote}
                    onTogglePin={handleTogglePin}
                  />
                </>
              )}

              {viewMode === 'recent' && (
                <>
                  <TopBar viewMode={viewMode} />
                  <RecentView
                    notes={notes}
                    categories={categories}
                    onSelectNote={handleSelectNote}
                    onDeleteNote={handleDeleteNote}
                    onTogglePin={handleTogglePin}
                  />
                </>
              )}

              {viewMode === 'pins' && (
                <>
                  <TopBar viewMode={viewMode} />
                  <PinsView
                    notes={notes}
                    categories={categories}
                    onSelectNote={handleSelectNote}
                    onDeleteNote={handleDeleteNote}
                    onTogglePin={handleTogglePin}
                  />
                </>
              )}

              {viewMode === 'bin' && (
                <>
                  <TopBar viewMode={viewMode} />
                  <BinView
                    notes={notes}
                    assets={assets}
                    categories={categories}
                    onRestore={handleRestoreNote}
                    onDeleteForever={handleDeleteForever}
                    onRestoreAsset={handleRestoreAsset}
                    onDeleteAssetForever={handleDeleteAssetForever}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* <ReflectionSidebar
        notes={notes}
        categories={categories}
        reflections={reflections}
        onSelectNote={handleSelectNote}
        onUpdateReflection={handleUpdateReflection}
      /> */}

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        notesCount={notes.filter(n => !n.isDeleted).length}
        categoriesCount={categories.length}
        assetsCount={assets.filter(a => !a.isDeleted).length}
      />

      <FeedbackPanel
        isOpen={isFeedbackPanelOpen}
        onClose={() => setIsFeedbackPanelOpen(false)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        notes={notes}
        categories={categories}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectNote={handleSelectNote}
      />

      <AssetModal
        isOpen={isAssetModalOpen}
        onClose={() => {
          setIsAssetModalOpen(false);
          setAssetModalContext(null);
        }}
        onSave={handleCreateAsset}
        categoryName={assetModalContext ? categories.find(c => c.id === assetModalContext.categoryId)?.name || '' : ''}
        subCategoryName={assetModalContext?.subCategoryId ? subCategories.find(sc => sc.id === assetModalContext.subCategoryId)?.name : undefined}
      />

      <AssetViewer
        asset={viewingAsset}
        onClose={() => setViewingAsset(null)}
      />

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
        categoryName={subCategoryParentId ? (categories.find(c => c.id === subCategoryParentId)?.name || '') : ''}
        onClose={() => {
          setIsSubCategoryModalOpen(false);
          setEditingSubCategoryId(null);
          setSubCategoryParentId(null);
        }}
        onSave={handleSaveSubCategory}
        initialData={editingSubCategoryId ? subCategories.find(sc => sc.id === editingSubCategoryId) : undefined}
        mode={subCategoryModalMode}
      />
    </div>
  );
}

