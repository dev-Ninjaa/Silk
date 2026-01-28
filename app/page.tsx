'use client';

import { Editor } from "@/editor";
import { Sidebar } from "@/app/components/Sidebar";
import { TopBar } from "@/app/components/TopBar";
import { AllNotesView } from "@/app/components/AllNotesView";
import { RecentView } from "@/app/components/RecentView";
import { PinsView } from "@/app/components/PinsView";
import { SettingsView } from "@/app/components/SettingsView";
import { BinView } from "@/app/components/BinView";
import { SearchView } from "@/app/components/SearchView";
import { defaultCategories } from "@/app/data/defaultCategories";
import { defaultNotes } from "@/app/data/defaultNotes";
import { Note, Block, Category, ViewMode } from "@/app/types";
import { NoteStore, LocalStorageNoteStore, CategoryStore, LocalStorageCategoryStore } from "@/app/lib/persistence";
import { useState, useEffect } from "react";

const noteStore: NoteStore = new LocalStorageNoteStore();
const categoryStore: CategoryStore = new LocalStorageCategoryStore();

const generateId = () => Math.random().toString(36).substring(2, 11);

const CATEGORY_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const loadedCategories = await categoryStore.loadCategories();
      const loadedNotes = await noteStore.loadNotes();

      if (loadedCategories.length > 0) {
        setCategories(loadedCategories);
      } else {
        setCategories(defaultCategories);
        await categoryStore.saveCategories(defaultCategories);
      }

      if (loadedNotes.length > 0) {
        setNotes(loadedNotes);
      } else {
        setNotes(defaultNotes);
        await noteStore.saveNotes(defaultNotes);
      }

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
    if (isLoaded && notes.length > 0) {
      noteStore.saveNotes(notes);
    }
  }, [notes, isLoaded]);

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

  const handleCreateCategory = (name: string) => {
    const newCategory: Category = {
      id: `cat-${generateId()}`,
      name,
      color: CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setCategories([...categories, newCategory]);
  };

  const handleCreateNote = (categoryId: string) => {
    const newNote: Note = {
      id: `note-${generateId()}`,
      title: 'Untitled',
      blocks: [{ id: generateId(), type: 'text', content: '' }],
      categoryId,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastOpenedAt: new Date()
    };
    setNotes([...notes, newNote]);
    setCurrentNoteId(newNote.id);
    setSelectedCategoryId(categoryId);
    setViewMode('library');
  };

  const handleSelectNote = (noteId: string) => {
    setCurrentNoteId(noteId);
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setSelectedCategoryId(note.categoryId);
      setNotes(notes.map(n => 
        n.id === noteId 
          ? { ...n, lastOpenedAt: new Date() }
          : n
      ));
    }
    setViewMode('library');
  };

  const handleChangeView = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode !== 'library') {
      setCurrentNoteId(null);
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
    setNotes(notes.map(n => 
      n.id === noteId 
        ? { ...n, isDeleted: false, deletedAt: undefined, updatedAt: new Date() }
        : n
    ));
  };

  const handleDeleteForever = (noteId: string) => {
    setNotes(notes.filter(n => n.id !== noteId));
  };

  const getCurrentCategory = (): Category | undefined => {
    if (!currentNote) return undefined;
    return categories.find(c => c.id === currentNote.categoryId);
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="flex h-screen bg-white text-gray-900 font-sans selection:bg-blue-100">
      <Sidebar 
        viewMode={viewMode}
        categories={categories}
        notes={notes}
        currentNoteId={currentNoteId}
        selectedCategoryId={selectedCategoryId}
        onSelectNote={handleSelectNote}
        onSelectCategory={setSelectedCategoryId}
        onCreateCategory={handleCreateCategory}
        onCreateNote={handleCreateNote}
        onChangeView={handleChangeView}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {viewMode === 'library' && (
          <>
            <TopBar 
              categoryName={getCurrentCategory()?.name}
              noteName={currentNote?.title}
            />
            
            <div className="flex-1 overflow-y-auto cursor-text">
              {currentNote && (
                <Editor 
                  note={currentNote}
                  onUpdateTitle={handleUpdateTitle}
                  onUpdateBlocks={handleUpdateBlocks}
                />
              )}
            </div>
          </>
        )}
        
        {viewMode === 'home' && (
          <AllNotesView 
            notes={notes}
            categories={categories}
            onSelectNote={handleSelectNote}
            onDeleteNote={handleDeleteNote}
          />
        )}
        
        {viewMode === 'recent' && (
          <RecentView 
            notes={notes}
            categories={categories}
            onSelectNote={handleSelectNote}
            onDeleteNote={handleDeleteNote}
          />
        )}
        
        {viewMode === 'pins' && (
          <PinsView 
            notes={notes}
            categories={categories}
            onSelectNote={handleSelectNote}
            onDeleteNote={handleDeleteNote}
          />
        )}
        
        {viewMode === 'settings' && (
          <SettingsView />
        )}
        
        {viewMode === 'bin' && (
          <BinView 
            notes={notes}
            categories={categories}
            onRestore={handleRestoreNote}
            onDeleteForever={handleDeleteForever}
          />
        )}
        
        {viewMode === 'search' && (
          <SearchView 
            notes={notes}
            categories={categories}
            onSelectNote={handleSelectNote}
          />
        )}
      </div>
    </div>
  );
}
