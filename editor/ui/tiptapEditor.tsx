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
import { Selection } from "@tiptap/extensions"
import { Placeholder } from "@tiptap/extension-placeholder"

// --- Custom Extensions ---
import  ImageExtension from "@/editor/extensions/image-extension"
import  TableExtension  from "@/editor/extensions/table-extension"
import SlashSuggestion from "@/editor/extensions/slash-suggestion"
import { createMentionSuggestion } from "@/editor/extensions/mention-suggestion"
import { AssetNode } from "@/editor/extensions/asset-node"
import { TodoNode } from "@/editor/extensions/todo-node"

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
import "@/components/tiptap-templates/simple/simple-editor.scss"

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
      ImageExtension,           // ✅ Image extension with resize
      ...TableExtension,        // ✅ Table extension (spreads array of [Table, TableRow, TableCell, TableHeader])
      AssetNode,                // ✅ Custom asset node with NodeView
      TodoNode,                 // ✅ Custom todo node with checkbox NodeView
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
      SlashSuggestion,               // ✅ Slash suggestions (/)
      createMentionSuggestion(allNotes),  // ✅ Mention suggestions (@)
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
      <EditorContent editor={editor} role="presentation" className="simple-editor-content" />
    </div>
  )
}
