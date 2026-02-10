"use client"

import { useEffect, useRef, useState } from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import ImageExtension from "@/editor/extensions/image-extension"
import TableExtension from "@/editor/extensions/table-extension"
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
import { getVideoExtension, VideoNode } from "@/editor/components/tiptap-node/video-node"
import { VideoUploadNodeExtension } from "@/components/tiptap-node/video-upload-node"
import { AudioUploadNodeExtension } from "@/components/tiptap-node/audio-upload-node"


// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import { UiState } from "@/components/tiptap-extension/ui-state-extension"
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import { DragContextMenu } from "@/components/tiptap-ui/drag-context-menu"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"

// --- Hyperlink Components ---
import { HyperlinkHoverPopover, LinkEditDialog, HyperlinkEventHandler, HyperlinkProvider } from "@/components/tiptap-ui/hyperlink"

// --- Icons ---
import { ArrowLeftIcon } from "@/editor/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/editor/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/editor/components/tiptap-icons/link-icon"

// --- Hooks ---
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"
import { useWindowSize } from "@/hooks/use-window-size"
import { useCursorVisibility } from "@/hooks/use-cursor-visibility"
import { useUiEditorState } from "@/editor/hooks/use-ui-editor-state"

// --- Components ---
import { ThemeToggle } from "@/components/tiptap-templates/simple/theme-toggle"
import { FloatingToolbar } from "@/editor/ui/FloatingToolbar"
import { EmojiDropdownMenu } from "@/editor/components/tiptap-ui/emoji-dropdown-menu"
import MentionSuggestion from "@/editor/extensions/mention-suggestion"
import { SlashMenu } from "@/editor/ui/SlashMenu"

// Mention logic extracted to a standalone `mention-suggestion` extension for cleaner testing in SimpleEditor

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/editor/lib/tiptap-utils"

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss"

import content from "@/components/tiptap-templates/simple/data/content.json"

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}

      <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup>
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
)

export function SimpleEditor() {
  const isMobile = useIsBreakpoint()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main"
  )
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [isLinkEditOpen, setIsLinkEditOpen] = useState(false)
  const linkPopoverRef = useRef<HTMLDivElement>(null)


  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
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
      ImageExtension,
      ...TableExtension,
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
      UiState,
      MentionSuggestion,

      // Note: SlashSuggestion (legacy extension) removed - we mount SlashMenu component which registers the Suggestion plugin
      VideoNode,
      getVideoExtension(),
      VideoUploadNodeExtension,
      AudioUploadNodeExtension,
    ],
    content,
  })

  const { isDragging } = useUiEditorState(editor)

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  // Debugging: log editor events and plugin list to trace suggestion activation
  useEffect(() => {
    if (!editor) return

    

    const onSelectionUpdate = () => {
      try {
        const { from } = editor.state.selection
        const charBefore = editor.state.doc.textBetween(Math.max(0, from - 1), from)
        // selectionUpdate debug removed

        const pluginKeys = editor.state.plugins.map((p: any) => p.key && p.key.toString ? p.key.toString() : p.key)
        // plugins debug removed
      } catch (err) {
        console.error('[Editor] selectionUpdate error', err)
      }
    }

    const onTransaction = () => {
      try {
        // transaction debug removed
      } catch (err) {
        console.error('[Editor] transaction error', err)
      }
    }

    editor.on('selectionUpdate', onSelectionUpdate)
    editor.on('transaction', onTransaction)

    // Expose editor for debugging in console
    ;(window as any).__pulmEditor = editor
    // editor exposed for debugging in window.__pulmEditor

    // Mention debug helpers removed. Use the standalone `mention-suggestion` extension for testing and debug flows.

    return () => {
      editor.off('selectionUpdate', onSelectionUpdate)
      editor.off('transaction', onTransaction)
      try {
        if ((window as any).__pulmEditor === editor) delete (window as any).__pulmEditor
      } catch (e) {}
    }
  }, [editor])



  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  return (
    <div className="simple-editor-wrapper">
      <HyperlinkProvider>
        <EditorContext.Provider value={{ editor }}>
          <Toolbar
            ref={toolbarRef}
            style={{
              ...(isMobile
                ? {
                    bottom: `calc(100% - ${height - rect.y}px)`,
                  }
                : {}),
            }}
          >
            {mobileView === "main" ? (
              <MainToolbarContent
                onHighlighterClick={() => setMobileView("highlighter")}
                onLinkClick={() => setMobileView("link")}
                isMobile={isMobile}
              />
            ) : (
              <MobileToolbarContent
                type={mobileView === "highlighter" ? "highlighter" : "link"}
                onBack={() => setMobileView("main")}
              />
            )}
          </Toolbar>

          <EditorContent
            editor={editor}
            role="presentation"
            className="simple-editor-content"
            style={{
              cursor: isDragging ? "grabbing" : "auto",
            }}
          >
            <FloatingToolbar />
            <EmojiDropdownMenu />
            <DragContextMenu />
            {/* Mount Notion-style Slash menu (uses Suggestion internally) */}
            <SlashMenu editor={editor} />
          </EditorContent>

          <HyperlinkEventHandler />
        </EditorContext.Provider>

        {/* Link Hover Popover */}
        <HyperlinkHoverPopover
          onEdit={() => setIsLinkEditOpen(true)}
        />

        <LinkEditDialog 
          editor={editor}
          isOpen={isLinkEditOpen}
          onClose={() => setIsLinkEditOpen(false)}
        />
      </HyperlinkProvider>
    </div>
  )
}
