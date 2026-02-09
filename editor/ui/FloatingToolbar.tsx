"use client"

import { useEffect, useState } from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/editor/hooks/use-tiptap-editor"
import { useIsBreakpoint } from "@/editor/hooks/use-is-breakpoint"
import { useFloatingToolbarVisibility } from "@/editor/hooks/use-floating-toolbar-visibility"

// --- Node ---
import { ImageNodeFloating } from "@/components/tiptap-node/image-node/image-node-floating"

// --- Icons ---
import { MoreVerticalIcon } from "@/editor/components/tiptap-icons/more-vertical-icon"

// --- UI ---
import { ColorPopover } from "@/editor/components/tiptap-ui/color-popover"
import { LinkPopover } from "@/editor/components/tiptap-ui/link-popover"
import type { Mark } from "@/editor/components/tiptap-ui/mark-button"
import { canToggleMark, MarkButton } from "@/editor/components/tiptap-ui/mark-button"
import type { TextAlign } from "@/editor/components/tiptap-ui/text-align-button"
import {
  canSetTextAlign,
  TextAlignButton,
} from "@/editor/components/tiptap-ui/text-align-button"

// --- Utils ---
import { isSelectionValid } from "@/editor/lib/floating-toolbar-utils"

// --- Primitive UI Components ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/tiptap-ui-primitive/popover"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- UI Utils ---
import { FloatingElement } from "@/editor/components/tiptap-ui-utils/floating-element"

export function FloatingToolbar({ editor: providedEditor }: { editor?: Editor | null } = {}) {
  const { editor } = useTiptapEditor(providedEditor)
  const isMobile = useIsBreakpoint("max", 480)

  const { shouldShow } = useFloatingToolbarVisibility({
    editor,
    isSelectionValid,
  })

  if (isMobile) return null

  return (
    <FloatingElement shouldShow={shouldShow} editor={editor}>
      <Toolbar variant="floating">
        <ToolbarGroup>
          <MarkButton type="bold" hideWhenUnavailable={true} editor={editor} />
          <MarkButton type="italic" hideWhenUnavailable={true} editor={editor} />
          <MarkButton type="underline" hideWhenUnavailable={true} editor={editor} />
          <MarkButton type="strike" hideWhenUnavailable={true} editor={editor} />
          <MarkButton type="code" hideWhenUnavailable={true} editor={editor} />
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <ImageNodeFloating editor={editor} />
        </ToolbarGroup>

        <ToolbarGroup>
          <LinkPopover
            autoOpenOnLinkActive={false}
            hideWhenUnavailable={true}
            editor={editor}
          />
          <ColorPopover hideWhenUnavailable={true} editor={editor} />
        </ToolbarGroup>

        <MoreOptions hideWhenUnavailable={true} editor={editor} />
      </Toolbar>
    </FloatingElement>
  )
}

function canMoreOptions(editor: Editor | null): boolean {
  if (!editor) {
    return false
  }

  const canTextAlignAny = ["left", "center", "right", "justify"].some((align) =>
    canSetTextAlign(editor, align as TextAlign)
  )

  const canMarkAny = ["superscript", "subscript"].some((type) =>
    canToggleMark(editor, type as Mark)
  )

  return canMarkAny || canTextAlignAny
}

function shouldShowMoreOptions(params: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = params

  if (!editor) {
    return false
  }

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canMoreOptions(editor)
  }

  return Boolean(editor?.isEditable)
}

export interface MoreOptionsProps extends Omit<ButtonProps, "type"> {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Whether to hide the dropdown when no options are available.
   * @default false
   */
  hideWhenUnavailable?: boolean
}

export function MoreOptions({
  editor: providedEditor,
  hideWhenUnavailable = false,
  ...props
}: MoreOptionsProps) {
  const { editor } = useTiptapEditor(providedEditor)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setShow(
        shouldShowMoreOptions({
          editor,
          hideWhenUnavailable,
        })
      )
    }

    handleSelectionUpdate()

    editor.on("selectionUpdate", handleSelectionUpdate)

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate)
    }
  }, [editor, hideWhenUnavailable])

  if (!show || !editor || !editor.isEditable) {
    return null
  }

  return (
    <>
      <ToolbarSeparator />
      <ToolbarGroup>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              data-style="ghost"
              role="button"
              tabIndex={-1}
              tooltip="More options"
              {...props}
            >
              <MoreVerticalIcon className="tiptap-button-icon" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            side="top"
            align="end"
            alignOffset={4}
            sideOffset={4}
            asChild
          >
            <Toolbar variant="floating" tabIndex={0}>
              <ToolbarGroup>
                <MarkButton type="superscript" editor={editor} />
                <MarkButton type="subscript" editor={editor} />
              </ToolbarGroup>

              <ToolbarSeparator />

              <ToolbarGroup>
                <TextAlignButton align="left" editor={editor} />
                <TextAlignButton align="center" editor={editor} />
                <TextAlignButton align="right" editor={editor} />
                <TextAlignButton align="justify" editor={editor} />
              </ToolbarGroup>

              <ToolbarSeparator />
            </Toolbar>
          </PopoverContent>
        </Popover>
      </ToolbarGroup>
    </>
  )
}
