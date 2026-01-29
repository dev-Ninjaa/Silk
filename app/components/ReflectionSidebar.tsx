'use client';

import React, { useState } from 'react';
import { Note, Category, DailyReflection } from '@/app/types';
import { FileText } from 'lucide-react';

interface ReflectionSidebarProps {
  notes: Note[];
  categories: Category[];
  reflections: DailyReflection[];
  onSelectNote: (noteId: string) => void;
  onUpdateReflection: (date: string, text: string) => void;
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (isToday) return `Today · ${monthDay}`;
  if (isYesterday) return `Yesterday · ${monthDay}`;
  return monthDay;
};

const getDaysWithActivity = (notes: Note[]): string[] => {
  const datesSet = new Set<string>();
  
  notes.forEach(note => {
    if (note.isDeleted) return;
    
    if (note.lastOpenedAt) {
      const date = new Date(note.lastOpenedAt).toISOString().split('T')[0];
      datesSet.add(date);
    }
    
    if (note.updatedAt) {
      const date = new Date(note.updatedAt).toISOString().split('T')[0];
      datesSet.add(date);
    }
    
    if (note.createdAt) {
      const date = new Date(note.createdAt).toISOString().split('T')[0];
      datesSet.add(date);
    }
  });

  return Array.from(datesSet).sort((a, b) => b.localeCompare(a));
};

const getNotesForDate = (notes: Note[], dateStr: string): Note[] => {
  return notes.filter(note => {
    if (note.isDeleted) return false;
    
    const noteDate = (date: Date | undefined) => 
      date ? new Date(date).toISOString().split('T')[0] : null;
    
    return (
      noteDate(note.lastOpenedAt) === dateStr ||
      noteDate(note.updatedAt) === dateStr ||
      noteDate(note.createdAt) === dateStr
    );
  });
};

export const ReflectionSidebar: React.FC<ReflectionSidebarProps> = ({
  notes,
  categories,
  reflections,
  onSelectNote,
  onUpdateReflection
}) => {
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const daysWithActivity = getDaysWithActivity(notes);

  const handleStartEdit = (date: string) => {
    const reflection = reflections.find(r => r.date === date);
    setEditingDate(date);
    setEditText(reflection?.text || '');
  };

  const handleSaveEdit = (date: string) => {
    onUpdateReflection(date, editText);
    setEditingDate(null);
  };

  const handleCancelEdit = () => {
    setEditingDate(null);
    setEditText('');
  };

  return (
    <div className="w-72 h-screen bg-stone-50 flex flex-col border-l border-stone-200">
      <div className="p-6 pb-4 border-b border-stone-200">
        <h2 className="text-sm font-medium text-stone-500 tracking-wide">
          Daily Reflections
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {daysWithActivity.map(date => {
          const dayNotes = getNotesForDate(notes, date);
          const reflection = reflections.find(r => r.date === date);
          const isEditing = editingDate === date;

          return (
            <div key={date} className="space-y-3">
              <div className="text-sm font-medium text-stone-700">
                {formatDate(date)}
              </div>

              {isEditing ? (
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => handleSaveEdit(date)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.metaKey) {
                      handleSaveEdit(date);
                    } else if (e.key === 'Escape') {
                      handleCancelEdit();
                    }
                  }}
                  placeholder="What did you explore today?"
                  className="w-full px-3 py-2.5 text-sm text-stone-700 bg-white border border-stone-300 rounded-lg resize-none outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200 transition-all min-h-[88px]"
                  autoFocus
                />
              ) : (
                <div
                  onClick={() => handleStartEdit(date)}
                  className="text-sm text-stone-600 leading-relaxed cursor-text hover:text-stone-700 transition-colors px-3 py-2.5 rounded-lg hover:bg-stone-100 min-h-[88px]"
                >
                  {reflection?.text || (
                    <span className="text-stone-400 italic">What did you explore today?</span>
                  )}
                </div>
              )}

              {dayNotes.length > 0 && (
                <div className="space-y-1.5">
                  {dayNotes.map(note => {
                    const category = categories.find(c => c.id === note.categoryId);
                    return (
                      <div
                        key={note.id}
                        onClick={() => onSelectNote(note.id)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-stone-100 transition-colors group"
                      >
                        <div className="w-1 h-1 rounded-full bg-stone-300 flex-shrink-0" />
                        <span className="text-xs text-stone-600 truncate group-hover:text-stone-900">
                          {note.title}
                        </span>
                        {category && (
                          <div
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0 ml-auto"
                            style={{ backgroundColor: category.color }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
