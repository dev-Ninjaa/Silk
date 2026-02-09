'use client'

import { useEffect, useRef, useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"

// --- TipTap Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Underline } from "@tiptap/extension-underline"
import { Color, TextStyle } from "@tiptap/extension-text-style"
import { Selection } from "@tiptap/extensions"
import { Placeholder } from "@tiptap/extension-placeholder"
import { Emoji, gitHubEmojis } from "@tiptap/extension-emoji"

// --- Custom Extensions ---
import SlashSuggestion from "@/editor/extensions/slash-suggestion"
import { createMentionSuggestion } from "@/editor/extensions/mention-suggestion"
import { AssetNode } from "@/editor/extensions/asset-node"
import { TodoNode } from "@/editor/extensions/todo-node"

// --- Enhanced Image Node ---
import { Image } from "@/components/tiptap-node/image-node/image-node-extension"

// --- Enhanced Table Components ---
import { TableKit } from "@/editor/components/tiptap-node/table-node/extensions/table-node-extension"
import { TableHandleExtension } from "@/editor/components/tiptap-node/table-node/extensions/table-handle"
import { TableHandle } from "@/editor/components/tiptap-node/table-node/ui/table-handle"

// --- Converters ---
import { convertBlocksToTipTap } from "@/editor/lib/convertBlocksToTipTap"
import { convertTipTapToBlocks } from "@/editor/lib/convertTipTapToBlocks"

// --- Custom Nodes & Extensions ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"

// --- Styles ---
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"
import "@/editor/components/tiptap-node/table-node/styles/table-node.scss"

import "@/components/tiptap-templates/simple/simple-editor.scss"

// --- UI Components ---
import { FloatingToolbar } from "@/editor/ui/FloatingToolbar"
import { EmojiDropdownMenu } from "@/editor/components/tiptap-ui/emoji-dropdown-menu"

// --- Hyperlink Components ---
import { HyperlinkHoverPopover, LinkEditDialog, HyperlinkEventHandler, HyperlinkProvider } from "@/components/tiptap-ui/hyperlink"

// --- Types ---
import { Note, Block } from "@/editor/schema/types"
import { handleImageUpload, MAX_FILE_SIZE } from "@/editor/lib/tiptap-utils"

interface TipTapNoteEditorProps {
  note: Note;
  allNotes?: { id: string; title: string; isDeleted?: boolean }[];
  onUpdateTitle?: (noteId: string, title: string) => void;
  onUpdateBlocks: (noteId: string, blocks: Block[]) => void;
  onOpenNote?: (noteId: string) => void;
}

/**
 * TipTap-backed editor for PulmNotes.
 * Features:
 * - Slash suggestions (/ for commands)
 * - Mention suggestions (@ for linking notes)
 * - Image upload with resize
 * - Tables with editing
 * - Rich formatting (bold, italic, lists, code blocks, etc.)
 * 
 * Converts Note.blocks ↔ TipTap JSON for editing, handles persistence via onUpdateBlocks.
 */
export function TipTapNoteEditor({ note, allNotes = [], onUpdateTitle, onUpdateBlocks, onOpenNote }: TipTapNoteEditorProps) {
  const editorRef = useRef<any>(null)
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isLinkEditOpen, setIsLinkEditOpen] = useState(false)

  // Keep a ref to allNotes so the extension can access the latest list without re-initialization
  const allNotesRef = useRef(allNotes)
  useEffect(() => {
    allNotesRef.current = allNotes
  }, [allNotes])

  // Ref for current note ID to filter out self
  const noteIdRef = useRef(note.id)
  useEffect(() => {
    noteIdRef.current = note.id
  }, [note.id])

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Note editor, start typing to edit.",
        class: "simple-editor",
      },
      handleClick: (view, pos, event) => {
        // Handle mention clicks to open notes
        const target = event.target as HTMLElement
        if (target.classList.contains('mention') && onOpenNote) {
          const mentionNode = view.state.doc.nodeAt(pos)
          if (mentionNode?.attrs?.id) {
            event.preventDefault()
            onOpenNote(mentionNode.attrs.id)
            return true
          }
        }
        return false
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: "Write or type '/' for commands...",
      }),
      Image,                     // ✅ Enhanced image node with advanced features
      TableKit.configure({     // ✅ Enhanced table extension with drag handles and context menu
        table: {
          resizable: true,
          handleWidth: 5,
          cellMinWidth: 50,
          lastColumnResizable: true,
          allowTableNodeSelection: true,
        },
      }),
      TableHandleExtension,    // ✅ Table handle extension for row/column manipulation
      AssetNode,                // ✅ Custom asset node with NodeView
      TodoNode,                 // ✅ Custom todo node with checkbox NodeView
      Typography,
      Superscript,
      Subscript,
      Underline,
      TextStyle,
      Color,
      Selection,
      Emoji.configure({
        emojis: gitHubEmojis.filter(
          (emoji) => !emoji.name.includes("regional")
        ),
        forceFallbackImages: true,
      }),
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
      SlashSuggestion,               // ✅ Slash suggestions (/)
      createMentionSuggestion(() => {
        // Dynamic getter: returns all notes excluding the current one
        return (allNotesRef.current || []).filter(n => n.id !== noteIdRef.current)
      }),  // ✅ Mention suggestions (@)
    ],
    // Initialize with converted blocks
    content: convertBlocksToTipTap(note.blocks),
    onUpdate: ({ editor }) => {
      // Debounce updates to avoid too many conversion operations
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }

      updateTimeoutRef.current = setTimeout(() => {
        const tiptapContent = editor.getJSON()
        const convertedBlocks = convertTipTapToBlocks(tiptapContent)
        onUpdateBlocks(note.id, convertedBlocks)
      }, 300) // 300ms debounce
    },
  })

  // Update editor content when note.blocks change externally
  // (e.g., when loading a different note)
  useEffect(() => {
    if (editor && note.blocks) {
      const tiptapContent = convertBlocksToTipTap(note.blocks)
      editor.commands.setContent(tiptapContent)
    }
  }, [note.id]) // Only update when note ID changes to avoid disrupting active editing

  return (
    <div className="tiptap-note-editor-wrapper">
      <HyperlinkProvider>
        <EditorContent editor={editor} role="presentation" className="simple-editor-content" />
        <FloatingToolbar editor={editor} />
        <EmojiDropdownMenu editor={editor} />
        {editor && <TableHandle editor={editor} />}

        <HyperlinkEventHandler />
        <HyperlinkHoverPopover onEdit={() => setIsLinkEditOpen(true)} />
        <LinkEditDialog
          editor={editor}
          isOpen={isLinkEditOpen}
          onClose={() => setIsLinkEditOpen(false)}
        />
      </HyperlinkProvider>
    </div>
  )
}
