# Converter Architecture - How Blocks ↔ TipTap JSON Works

## 🔄 The 3 Converters Explained

### 1. **converters.ts** - Main Export Hub
**Purpose**: Centralized export point for both conversion functions

```typescript
export { convertBlocksToTipTap } from './convertBlocksToTipTap'
export { convertTipTapToBlocks } from './convertTipTapToBlocks'
```
Simply re-exports the two main converters so you can import them from one place.

---

### 2. **convertBlocksToTipTap.ts** - Blocks → TipTap JSON
**Direction**: App Blocks → Editor Format

**What it does**:
- Takes: Array of `Block` objects (PulmNotes format)
- Returns: TipTap `JSONContent` (editor format)
- Used: When initializing TipTap editor or converting saved content

**Example**:
```typescript
// Input: PulmNotes blocks
const blocks = [
  { id: '1', type: 'h1', content: 'My Title' },
  { id: '2', type: 'text', content: 'Paragraph text' },
  { id: '3', type: 'bullet-list', content: 'Item 1' },
  { id: '4', type: 'bullet-list', content: 'Item 2' },
]

// Output: TipTap JSON
convertBlocksToTipTap(blocks) returns:
{
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'My Title' }]
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Paragraph text' }]
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 1' }] }]
        },
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 2' }] }]
        }
      ]
    }
  ]
}
```

**Handles**:
- ✅ Headings (h1, h2, h3) → TipTap heading nodes
- ✅ Text/Paragraphs → TipTap paragraph nodes
- ✅ Lists (bullet, numbered, todo) → TipTap list nodes (groups consecutive items!)
- ✅ Code blocks → TipTap codeBlock
- ✅ Blockquotes → TipTap blockquote
- ✅ Dividers → TipTap horizontalRule
- ✅ Mentions (@user) → TipTap mention nodes with attributes
- ✅ Tables → TipTap table structure

---

### 3. **convertTipTapToBlocks.ts** - TipTap JSON → Blocks
**Direction**: Editor Format → App Blocks

**What it does**:
- Takes: TipTap `JSONContent` (editor JSON)
- Returns: Array of `Block` objects (PulmNotes format)
- Used: When saving editor content or exporting

**Example**:
```typescript
// Input: TipTap JSON
const tiptapJSON = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Section' }]
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Some text' }]
    }
  ]
}

// Output: PulmNotes blocks
convertTipTapToBlocks(tiptapJSON) returns:
[
  { id: 'abc123', type: 'h2', content: 'Section' },
  { id: 'def456', type: 'text', content: 'Some text' }
]
```

**Handles**:
- ✅ TipTap heading nodes → PulmNotes h1, h2, h3
- ✅ TipTap paragraph → PulmNotes text
- ✅ TipTap bulletList/orderedList → PulmNotes bullet-list/numbered-list
- ✅ TipTap taskList → PulmNotes todo
- ✅ TipTap codeBlock → PulmNotes code
- ✅ TipTap blockquote → PulmNotes quote
- ✅ TipTap horizontalRule → PulmNotes divider
- ✅ TipTap mention nodes → PulmNotes mentions with noteId
- ✅ TipTap table → PulmNotes table

---

## 📊 Visual Data Flow

```
┌─────────────────────────────────────────────────────┐
│           PulmNotes Application                      │
│  (Uses Block[] array for storage/persistence)       │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ convertBlocksToTipTap()
                   ↓
┌─────────────────────────────────────────────────────┐
│         TipTap Editor JSONContent                    │
│    (Editor-ready format for display/editing)        │
│  - Supports rich formatting                         │
│  - Handles all TipTap extensions                   │
│  - Real-time editing                               │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ convertTipTapToBlocks()
                   ↓
┌─────────────────────────────────────────────────────┐
│      Back to PulmNotes Block[] Format               │
│  (Ready to save to database/localStorage)           │
└─────────────────────────────────────────────────────┘
```

---

## 🔁 Typical Usage Pattern

```typescript
// 1. USER OPENS NOTE
const savedBlocks = note.blocks  // Load from storage
const tiptapJSON = convertBlocksToTipTap(savedBlocks)
editor.setContent(tiptapJSON)    // Initialize editor with TipTap JSON

// 2. USER EDITS IN TIPTAP EDITOR
editor.on('update', ({ editor }) => {
  const updatedJSON = editor.getJSON()
  
  // 3. SAVE BACK TO APP FORMAT
  const updatedBlocks = convertTipTapToBlocks(updatedJSON)
  onUpdateBlocks(noteId, updatedBlocks)  // Save to storage
})
```

---

## 💡 Why Two Converters?

**PulmNotes Blocks** (App format):
- Simple, flat array structure
- Easy to store in database
- Each block is independent
- Good for persistence

**TipTap JSON** (Editor format):
- Hierarchical tree structure
- Rich nesting (lists inside lists, etc.)
- Supports all formatting marks
- Real-time editing optimized

**The converters handle the complexity of mapping between them!**

---

## 🎯 Key Insight

The converters allow you to:
1. ✅ Keep the Block[] structure for storage (simple, predictable)
2. ✅ Use TipTap for editing (powerful, feature-rich)
3. ✅ Seamlessly convert between them on load/save
4. ✅ Support all TipTap features (slash commands, tables, images, etc.)

**No need to rewrite the editor!** Just integrate TipTap's display layer while keeping Block[] storage.
