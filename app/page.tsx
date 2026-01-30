'use client';

import { Editor } from "@/editor";
import { Sidebar } from "@/app/components/Sidebar";
import { ReflectionSidebar } from "@/app/components/ReflectionSidebar";
import { TopBar } from "@/app/components/TopBar";
import { AllNotesView } from "@/app/components/AllNotesView";
import { RecentView } from "@/app/components/RecentView";
import { PinsView } from "@/app/components/PinsView";
import { SettingsModal } from "@/app/components/SettingsModal";
import { FeedbackPanel } from "@/app/components/FeedbackPanel";
import { BinView } from "@/app/components/BinView";
import { CommandPalette } from "@/app/components/CommandPalette";
import { defaultCategories } from "@/app/data/defaultCategories";
import { defaultNotes } from "@/app/data/defaultNotes";
import { Note, Block, Category, SubCategory, ViewMode, DailyReflection } from "@/app/types";
import { 
  NoteStore, LocalStorageNoteStore, 
  CategoryStore, LocalStorageCategoryStore, 
  SubCategoryStore, LocalStorageSubCategoryStore,
  ReflectionStore, LocalStorageReflectionStore 
} from "@/app/lib/persistence";
import { useState, useEffect } from "react";

const noteStore: NoteStore = new LocalStorageNoteStore();
const categoryStore: CategoryStore = new LocalStorageCategoryStore();
const subCategoryStore: SubCategoryStore = new LocalStorageSubCategoryStore();
const reflectionStore: ReflectionStore = new LocalStorageReflectionStore();

const generateId = () => Math.random().toString(36).substring(2, 11);

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [reflections, setReflections] = useState<DailyReflection[]>([]);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const loadedCategories = await categoryStore.loadCategories();
      const loadedSubCategories = await subCategoryStore.loadSubCategories();
      const loadedNotes = await noteStore.loadNotes();
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
    setCategories(categories.map(c => 
      c.id === categoryId 
        ? { ...c, name, color, icon, updatedAt: new Date() }
        : c
    ));
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
    // Check if category has any notes (including in sub-categories)
    const categoryNotes = notes.filter(n => n.categoryId === categoryId && !n.isDeleted);
    if (categoryNotes.length === 0) {
      setCategories(categories.filter(c => c.id !== categoryId));
      // Also delete sub-categories of this category
      setSubCategories(subCategories.filter(sc => sc.categoryId !== categoryId));
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(null);
        setSelectedSubCategoryId(null);
      }
    }
  };

  const handleDeleteSubCategory = (subCategoryId: string) => {
    const subCategoryNotes = notes.filter(n => n.subCategoryId === subCategoryId && !n.isDeleted);
    if (subCategoryNotes.length === 0) {
      setSubCategories(subCategories.filter(sc => sc.id !== subCategoryId));
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

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="flex h-screen bg-white text-gray-900 font-sans selection:bg-blue-100">
      <Sidebar 
        viewMode={viewMode}
        categories={categories}
        subCategories={subCategories}
        notes={notes}
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
        onOpenFeedback={() => setIsFeedbackPanelOpen(true)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {viewMode === 'library' && (
          <>
            <TopBar 
              viewMode={viewMode}
              categoryName={getCurrentCategory()?.name}
              subCategoryName={getCurrentSubCategory()?.name}
              noteName={currentNote?.title}
              isPinned={currentNote?.isPinned}
              onTogglePin={currentNote ? () => handleTogglePin(currentNote.id) : undefined}
            />
            
            <div className="flex-1 overflow-y-auto cursor-text">
              {currentNote && (
                <Editor 
                  note={currentNote}
                  allNotes={notes.map(n => ({ id: n.id, title: n.title, isDeleted: n.isDeleted }))}
                  onUpdateTitle={handleUpdateTitle}
                  onUpdateBlocks={handleUpdateBlocks}
                  onOpenNote={handleSelectNote}
                />
              )}
            </div>
          </>
        )}
        
        {viewMode === 'home' && (
          <>
            <TopBar viewMode={viewMode} />
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
              categories={categories}
              onRestore={handleRestoreNote}
              onDeleteForever={handleDeleteForever}
            />
          </>
        )}
      </div>

      <ReflectionSidebar
        notes={notes}
        categories={categories}
        reflections={reflections}
        onSelectNote={handleSelectNote}
        onUpdateReflection={handleUpdateReflection}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        notesCount={notes.filter(n => !n.isDeleted).length}
        categoriesCount={categories.length}
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
    </div>
  );
}
