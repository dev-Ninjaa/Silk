# Destructive Actions, Bin & Search Audit Log

## 1. Objective Summary

This implementation adds three critical production features to the note application:

1. Right-click context menus for note operations
2. Reversible Bin (Trash) system for deleted notes
3. Title-based search functionality

All features maintain existing navigation patterns, preserve editor behavior, and integrate with the current persistence layer without introducing breaking changes.

## 2. Right-Click Context Menu

### Implementation

Created two context menu components:

- `NoteContextMenu.tsx`: For active notes (Open, Delete)
- `BinContextMenu.tsx`: For deleted notes (Restore, Delete Forever)

### Behavior

- Prevents default browser context menu via `e.preventDefault()`
- Positioned at cursor coordinates using fixed positioning
- Closes on outside click, Escape key, or action selection
- Minimal styling: white background, soft shadow, neutral borders

### Integration Points

Context menus integrated into:
- `AllNotesView.tsx`
- `RecentView.tsx`
- `PinsView.tsx`
- `BinView.tsx`

Each view maintains local context menu state and handles `onContextMenu` events on note cards.

### Delete Action

When Delete is triggered:
- Note remains in storage
- `isDeleted` flag set to `true`
- `deletedAt` timestamp recorded
- Note excluded from all active views
- Note appears in Bin view

## 3. Bin (Trash) System

### Data Model Changes

Extended `Note` interface in `app/types.ts`:

```typescript
interface Note {
  // ... existing fields
  isDeleted?: boolean;
  deletedAt?: Date;
}
```

### ViewMode Extension

Added `'bin'` to `ViewMode` union type.

### Bin View Component

Created `BinView.tsx`:
- Displays all notes where `isDeleted === true`
- Shows note title, category indicator, deletion date
- Right-click reveals Bin-specific context menu
- Empty state message when no deleted notes exist

### Bin Visibility

Bin is NOT a primary navigation item. It appears only when hovering over Settings button in sidebar.

### Restore Operation

Restore action:
- Removes `isDeleted` flag
- Clears `deletedAt` timestamp
- Note returns to original category
- Note reappears in all relevant views (Home, Library, Recent, Pins if applicable)

### Permanent Delete

Delete Forever action:
- Removes note from `notes` array entirely
- Irreversible operation
- No confirmation modal (per requirements)

## 4. Settings Hover Extensions

### Implementation

Modified `Sidebar.tsx`:
- Added `isHoveringSettings` state
- Wrapped Settings button area with hover handlers
- Conditionally renders Search and Bin buttons above Settings when hovering

### Behavior

- Hover over Settings reveals two additional buttons
- Search button navigates to Search view
- Bin button navigates to Bin view
- No divider lines added
- Maintains existing sidebar styling

## 5. Search

### ViewMode Extension

Added `'search'` to `ViewMode` union type.

### Search View Component

Created `SearchView.tsx`:
- Title-based search only
- Case-insensitive matching using `toLowerCase()`
- Real-time filtering on input change
- Displays matching notes as clickable cards
- Clicking result opens note and switches to Library mode

### Search Behavior

- Excludes deleted notes (`isDeleted === true`)
- No fuzzy matching
- No ranking algorithm
- Simple substring match on `note.title`
- Empty state when no query entered
- No results message when query yields no matches

### Search Input

- Auto-focused on view mount
- Placeholder text: "Search notes by title..."
- Search icon positioned at left of input
- Standard border styling consistent with app design

## 6. Data Model Changes

### Note Interface Extensions

```typescript
interface Note {
  id: string;
  title: string;
  blocks: Block[];
  categoryId: string;
  isPinned?: boolean;
  lastOpenedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;      // NEW
  deletedAt?: Date;         // NEW
}
```

### ViewMode Extensions

```typescript
type ViewMode = 
  | 'home' 
  | 'library' 
  | 'recent' 
  | 'pins' 
  | 'settings'
  | 'bin'      // NEW
  | 'search';  // NEW
```

## 7. Persistence Flow

### Serialization

`LocalStorageNoteStore.ts` updated to handle new date fields:

```typescript
deletedAt: note.deletedAt ? new Date(note.deletedAt) : undefined
```

### Storage Key

Continues using existing `'ditto-notes'` localStorage key.

### Save Trigger

Notes array saved to localStorage on every state change via `useEffect` in `page.tsx`.

### Load Behavior

On application load:
- Deleted notes loaded with `isDeleted` and `deletedAt` preserved
- Deleted notes automatically excluded from active views via filtering

### Restore Persistence

Restore operation updates note in state, triggering automatic save to localStorage.

### Permanent Delete Persistence

Delete Forever removes note from state array, triggering automatic save to localStorage.

## 8. UX Guarantees

### View Filtering

All active views filter deleted notes:
- Home: `notes.filter(n => !n.isDeleted)`
- Recent: `notes.filter(n => !n.isDeleted)`
- Pins: `notes.filter(n => !n.isDeleted)`
- Library sidebar: `notes.filter(note => note.categoryId === categoryId && !note.isDeleted)`
- Search: `notes.filter(n => !n.isDeleted)`

### Navigation Preservation

- Existing navigation buttons unchanged
- Library, Home, Recent, Pins remain primary navigation
- Bin and Search are secondary, hover-revealed actions
- No disruption to existing user workflows

### Editor Behavior

- Editor module untouched
- No changes to block rendering
- No changes to editor UI
- No changes to editor styling
- Title and block updates continue functioning identically

### Context Menu UX

- Right-click on note cards opens context menu
- Left-click on note cards opens note (existing behavior preserved)
- Context menu closes automatically on action or outside click
- No modal confirmations
- No undo stacks

## 9. Constraints & Safety

### What Was NOT Implemented

Per requirements, the following were explicitly excluded:

- Confirmation modals for delete operations
- Undo/redo stacks
- Animations or transitions
- Multi-select functionality
- Keyboard shortcuts for search or delete
- Sidebar redesign
- Permanent Bin visibility in primary navigation
- Fuzzy search algorithms
- Search result ranking
- Backend or cloud sync
- Tauri filesystem integration
- Editor module modifications

### Editor Module Isolation

Zero changes made to:
- `editor/core/utils.ts`
- `editor/schema/types.ts`
- `editor/ui/Block.tsx`
- `editor/ui/Editor.tsx`
- `editor/ui/SlashMenu.tsx`
- `editor/index.ts`

### Persistence Guarantees

- All operations use existing `NoteStore` interface
- No new storage keys introduced
- No migration logic required
- Backward compatible with existing stored notes
- Notes without `isDeleted` field treated as active notes

### Type Safety

- All new fields optional (`isDeleted?`, `deletedAt?`)
- No breaking changes to existing Note interface consumers
- ViewMode union type extended without breaking existing view logic

### Performance Considerations

- Filtering operations use simple array methods
- No complex algorithms introduced
- Search performs substring match only
- Context menus render conditionally (not always in DOM)
- No memory leaks from event listeners (cleanup in useEffect)

### Error Handling

- LocalStorage errors logged to console
- Failed saves do not crash application
- Missing fields handled gracefully with optional chaining
- Date parsing wrapped in try-catch in persistence layer
