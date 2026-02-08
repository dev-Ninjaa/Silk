## PulmNotes - Complete Codebase Index & Architecture
### Final Build Status: ✅ Extensions Fully Integrated to Live App

**PulmNotes** is a modern note-taking application with a rich text editor powered by **TipTap v3.19.0**.

- **Framework**: Next.js (React) + TypeScript
- **Editor**: TipTap (v3.19.0) with slash commands, mentions, tables, and images
- **Integration**: Fully integrated into NoteView (main editor)
- **Storage**: LocalStorage (demo mode) + Tauri backend (optional)
- **State Management**: React Context + Hooks
- **Styling**: SCSS + CSS Variables + Dark Mode Support

---

## 🎯 INTEGRATION STATUS: ✅ COMPLETE

### What's Integrated:
- ✅ **Image Extension** - insertImageUpload, setImageNode, insertImageFromFile
- ✅ **Table Extension** - insertTable, addRowAfter, addColumnAfter  
- ✅ **Slash Suggestion** - / command menu with all commands
- ✅ **Mention Suggestion** - @ mention system
- ✅ **Table Styling** - Full table rendering with borders, cells, and theming
- ✅ **Main Editor** - IntegratedNoteEditor now used in NoteView
- ✅ **Auto-save** - Changes persist via onUpdateBlocks callback

### Where Used:
- `app/components/NoteView.tsx` → Uses `IntegratedNoteEditor`
- `editor/components/tiptap-templates/simple/integrated-note-editor.tsx` → Main wrapper

---

### `/app` - Main Application (Next.js App Router)
```
app/
├── page.tsx                          # Main app shell with sidebar, navigation
├── layout.tsx                        # Root layout
├── types.ts                          # Core data models (Note, Category, Asset, etc.)
├── globals.scss                      # Global theme variables & base styles
├── components/                       # UI Components
│   ├── Sidebar.tsx                   # Left navigation panel
│   ├── TopBar.tsx                    # Breadcrumb & navigation
│   ├── AllNotesView.tsx              # All notes view
│   ├── RecentView.tsx                # Recently accessed notes
│   ├── PinsView.tsx                  # Pinned notes
│   ├── BinView.tsx                   # Deleted notes/assets recovery
│   ├── SettingsModal.tsx             # User settings
│   ├── NoteView.tsx                  # Main note editor wrapper
│   ├── NoteCard.tsx                  # Card component for notes
│   ├── NoteTabs.tsx                  # Tabbed note navigation
│   ├── SearchView.tsx                # Search functionality
│   ├── CategoryModal.tsx             # Category CRUD
│   ├── SubCategoryModal.tsx          # Sub-category CRUD
│   ├── AssetModal.tsx                # File/link/media upload modal
│   ├── AssetViewer.tsx               # Asset preview (images, PDFs, videos)
│   ├── FeedbackPanel.tsx             # Feedback/support panel
│   ├── CommandPalette.tsx            # Command palette (Cmd+K)
│   ├── *ContextMenu.tsx              # Right-click context menus
│   ├── ReflectionSidebar.tsx         # Optional reflection panel (commented out)
│   └── SecondarySidebar.tsx          # Optional secondary navigation (commented out)
└── data/
    ├── defaultCategories.ts          # Seed data
    └── defaultNotes.ts               # Seed data
```

### `/editor` - TipTap Editor Implementation
```
editor/
├── index.ts                          # Main export
├── extensions/                       # TipTap Extensions with helpers
│   ├── image-extension.tsx           # Image node config + insertImageUpload, setImageNode, insertImageFromFile
│   ├── table-extension.tsx           # Table node config + insertTable, addRowAfter, addColumnAfter
│   ├── slash-suggestion.tsx          # Slash menu (/) with command routing
│   ├── mention-suggestion.tsx        # @ mention system with openMentionMenu helper
│   └── (more extensions)
├── components/
│   ├── tiptap-templates/
│   │   └── simple/
│   │       ├── simple-editor.tsx     # Main editor component - integrates all extensions
│   │       ├── simple-editor.scss    # Theme variables & base styles
│   │       ├── theme-toggle.tsx      # Dark/light mode toggle
│   │       ├── data/
│   │       │   └── content.json      # Initial sample content
│   │       └── (shared UI components)
│   ├── tiptap-node/                  # Custom node implementations
│   │   ├── image-node/               # Image rendering
│   │   ├── image-upload-node/        # Upload UI placeholder
│   │   ├── horizontal-rule-node/     # HR styling
│   │   ├── code-block-node/          # Code block styling
│   │   ├── blockquote-node/          # Quote styling
│   │   ├── heading-node/             # Heading styling
│   │   ├── paragraph-node/           # Paragraph styling
│   │   ├── list-node/                # List styling
│   │   └── table-node/               # ✨ TABLE NODE (Full implementation)
│   │       ├── table-node.scss       # Table borders, cells, styling
│   │       ├── TableTriggerButton.tsx  # Grid selector (UI component - not used)
│   │       ├── TableHandle.tsx         # Row/col manipulation mini-toolbar
│   │       ├── TableSelectionOverlay.tsx # Visual selection overlay
│   │       ├── TableExtendRowColumnButtons.tsx # Add row/col buttons
│   │       ├── TableCellHandleMenu.tsx  # Cell alignment/merge menu
│   │       └── (corresponding .scss files)
│   ├── tiptap-ui/                    # Toolbar buttons & menus
│   │   ├── heading-dropdown-menu     # Format as H1-H4
│   │   ├── list-dropdown-menu        # Bullet/numbered/todo lists
│   │   ├── link-popover              # Link insertion/editing
│   │   ├── color-highlight-popover   # Text color & highlight
│   │   ├── blockquote-button         # Quote formatting
│   │   ├── code-block-button         # Code block
│   │   └── (more buttons)
│   ├── tiptap-ui-primitive/          # Low-level UI primitives
│   │   ├── button                    # Base button
│   │   ├── toolbar                   # Toolbar container
│   │   ├── spacer                    # Layout spacer
│   │   └── (more primitives)
│   ├── tiptap-extension/             # Third-party extension configs
│   ├── tiptap-icons/                 # Icon components (lucide-react)
│   └── tiptap-templates/             # Editor templates
├── hooks/                            # Custom React hooks
│   ├── use-tiptap-editor.ts          # Editor setup hook
│   ├── use-cursor-visibility.ts      # Cursor positioning
│   ├── use-menu-navigation.ts        # Keyboard nav in menus
│   ├── use-scrolling.ts              # Scroll event detection
│   ├── use-throttled-callback.ts     # Performance optimization
│   ├── use-element-rect.ts           # Element bounding rect
│   ├── use-is-breakpoint.ts          # Responsive breakpoints
│   ├── use-window-size.ts            # Window resize tracking
│   ├── use-composed-ref.ts           # Ref composition
│   └── use-unmount.ts                # Cleanup on unmount
├── lib/                              # Utilities
│   ├── tiptap-utils.ts               # handleImageUpload, MAX_FILE_SIZE
│   ├── convertBlocksToTipTap.ts      # Data format conversion
│   ├── convertTipTapToBlocks.ts      # Data format conversion
│   └── converters.ts                 # Format conversion helpers
├── schema/
│   └── types.ts                      # TypeScript interfaces for editor
├── styles/
│   ├── _keyframe-animations.scss     # Animations
│   ├── _variables.scss               # CSS variables
│   └── styles.d.ts                   # Styles module types
├── types/
│   └── styles.d.ts                   # SCSS module types
├── ui/                               # Standalone UI components
│   ├── Editor.tsx                    # Editor wrapper
│   ├── Block.tsx                     # Content block renderer
│   ├── SlashMenu.tsx                 # Slash menu UI
│   ├── MentionMenu.tsx               # @ mention menu UI
│   └── (more UI)
└── core/
    └── utils.ts                      # Core utilities
```

### `/src-tauri` - Tauri Backend (Optional)
```
src-tauri/
├── src/
│   └── main.rs                       # Rust backend server
├── Cargo.toml                        # Rust dependencies
├── tauri.conf.json                  # Tauri configuration
└── icons/                            # App icons
```

### `/docs` - Documentation
```
docs/
├── DEBUG_INSTRUCTIONS.md             # Debugging guide
├── TIPTAP_MIGRATION_PLAN.md         # Migration documentation
└── (other docs)
```

---

## Key Extensions & Helpers

### Image Extension (`editor/extensions/image-extension.tsx`)
**Purpose**: Handle image insertion, resizing, and display
**Helpers**:
- `insertImageUpload(editor)` - Insert image upload UI
- `setImageNode(editor, src)` - Set rendered image
- `insertImageFromFile(editor, file)` - Upload file → image

### Table Extension (`editor/extensions/table-extension.tsx`)
**Purpose**: Configure TipTap table with helper commands
**Helpers**:
- `insertTable(editor, rows, cols, withHeaderRow)` - Insert table
- `addRowAfter(editor)` - Add row after current
- `addColumnAfter(editor)` - Add column after current

### Slash Suggestion (`editor/extensions/slash-suggestion.tsx`)
**Purpose**: Slash command system (like Notion)
**Features**:
- Type `/` to open command palette
- Routes to all commands (table, image, headings, etc.)
- Positioned absolutely for UI overlay

### Mention Suggestion (`editor/extensions/mention-suggestion.tsx`)
**Purpose**: @ mention system
**Helpers**:
- `openMentionMenu(editor)` - Opens mention popup

---

## Data Flow

### Note Creation & Editing
```
NoteView.tsx
  ↓ loads/displays
SimpleEditor.tsx (TipTap editor)
  ├─ Extensions (image, table, slash, mention)
  ├─ Toolbar buttons (format, insert, etc.)
  └─ EditableContent (ProseMirror)
    ↓ saves via
LocalStorageNoteStore.ts (or Tauri backend)
```

### Slash Command Flow
```
"/table" typed
  ↓
slash-suggestion.tsx detects "/"
  ↓
SlashMenu renders overlay
  ↓
User selects "Table"
  ↓
table-extension.tsx::insertTable() called
  ↓
Table node inserted in editor
  ↓
table-node.scss styles applied
```

### Image Upload Flow
```
"image" slash command selected
  OR right-click → insert image
  ↓
insertImageUpload(editor) called
  ↓
ImageUploadNode renders placeholder
  ↓
User selects file
  ↓
handleImageUpload(file) processes
  ↓
Returns object URL
  ↓
setImageNode(editor, url) renders actual image
```

---

## Theme & Styling System

### CSS Variables (defined in `app/globals.scss` and `editor/styles/_variables.scss`)
```scss
--tt-bg-color          # Background
--tt-border            # Border color
--tt-theme-text        # Text color
--tt-table-*           # Table colors
--tt-brand-color-*     # Brand colors
(more 50+ variables for theming)
```

### Responsive Design
- Mobile breakpoint: 640px (max-width: 480px)
- Toolbar adapts for small screens
- Editor content width: 648px (max)
- Full-height editor with flex layout

---

## Storage Layer

### LocalStorage (Demo Mode)
- `LocalStorageNoteStore.ts`
- `LocalStorageCategoryStore.ts`
- `LocalStorageAssetStore.ts`
- `LocalStorageReflectionStore.ts`
- etc.

### Tauri Backend (Optional Production)
- `src-tauri/src/main.rs` - Server logic
- Tauri provides native file system access

---

## Component Communication

### React Context
- `EditorContext.Provider` in SimpleEditor
- Provides editor instance to child components

### Props Drilling
- Components receive editor via props
- Callbacks for state updates (onSelect, onClose, etc.)

### State Management
- Local React state (useState)
- Persistent storage via LocalStorage stores
- Command palette for global actions

---

## Performance Optimizations

1. **Hooks**: `use-throttled-callback.ts` prevents excessive re-renders
2. **Image Handling**: Object URLs for demo uploads
3. **Lazy Loading**: Not implemented, but possible for large notes
4. **Memoization**: React.FC components can be memoized
5. **Code Splitting**: Next.js automatic code splitting

---

## Testing

### Test Framework: Vitest
- Config: `vitest.config.ts`
- Run: `npm run test` or `bun test`

### Current Test Coverage
- Table extension tests: Can be added
- Image extension tests: Can be added
- Component tests: Not yet implemented

---

## Development Workflow

### Run Dev Server
```bash
npm run dev
# or
bun dev
```
Visit: http://localhost:3000

### Build
```bash
npm run build
```

### Type Check
```bash
npx tsc --noEmit
```

### File Organization Best Practices
✅ Extensions in `editor/extensions/` with naming: `{feature}-extension.tsx`
✅ Components in `editor/components/` grouped by type
✅ Utilities in `editor/lib/` 
✅ Hooks in `editor/hooks/`
✅ Styles co-located with components when possible

---

## Future Improvements

1. **Advanced Table Features**
   - Drag-and-drop row/column reordering
   - Multi-cell selection
   - Sort columns
   - Merge/split cells

2. **Accessibility**
   - Keyboard shortcuts (Tab, Arrow keys in tables)
   - ARIA labels on all interactive elements
   - Screen reader support

3. **Performance**
   - Virtual scrolling for large tables
   - Code splitting for extensions

4. **Features**
   - Collaborative editing
   - Version history/undo depth
   - Template system for common tables
   - CSV import/export for tables

---

## Key Files Reference

| File | Purpose | Status |
|------|---------|--------|
| `editor/extensions/image-extension.tsx` | Image handling | ✅ Complete |
| `editor/extensions/table-extension.tsx` | Table commands | ✅ Complete |
| `editor/extensions/slash-suggestion.tsx` | Slash menu | ✅ Complete |
| `editor/components/tiptap-templates/simple/simple-editor.tsx` | Main editor | ✅ Complete |
| `editor/components/tiptap-node/table-node/table-node.scss` | Table styling | ✅ Complete |
| `app/components/NoteView.tsx` | NOW uses IntegratedNoteEditor | ✅ Integrated |
| `editor/lib/tiptap-utils.ts` | Image upload utility | ✅ Complete |
| `editor/lib/block-conversion.ts` | NEW: Blocks ↔ TipTap conversion | ✅ New |

---

## 🎬 FINAL INTEGRATION CHECKLIST (February 7, 2026)

### ✅ Extensions Implemented
- [x] Image extension with resize & upload
- [x] Table extension with row/col operations
- [x] Slash suggestion menu with all commands
- [x] Mention suggestion system
- [x] Table styling (borders, hover, dark mode)

### ✅ Integration Complete
- [x] IntegratedNoteEditor created
- [x] NoteView updated to use new editor
- [x] All exports updated in editor/index.ts
- [x] Block ↔ TipTap JSON conversion utilities
- [x] TypeScript validation (0 errors)
- [x] Extensions working in live app

### 🎯 How to Use in Live App
1. Open any note
2. Type `/` to see slash menu
3. Select `/table` to insert 3×3 table
4. Select `/image` to upload image
5. Type `@` to mention other notes
6. All changes auto-save via onUpdateBlocks

### 📂 Key Files Updated
- `editor/components/tiptap-templates/simple/integrated-note-editor.tsx` (NEW)
- `app/components/NoteView.tsx` (UPDATED - uses IntegratedNoteEditor)
- `editor/index.ts` (UPDATED - new exports)
- `editor/lib/block-conversion.ts` (NEW - conversion utilities)

---

Generated on: February 7, 2026 - TipTap Extensions Fully Integrated ✨
