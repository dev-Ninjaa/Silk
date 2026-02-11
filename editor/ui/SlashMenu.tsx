import React from 'react';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  ChevronRight,
  Table as TableIcon,
  Quote,
  Code,
  Minus,
  Image,
  AtSign,
  Smile,
  Youtube,
  Music
} from 'lucide-react';
import { MenuItem, BlockType, Coordinates } from '../schema/types';

export const MENU_ITEMS: MenuItem[] = [
  { id: 'text', label: 'Text', icon: Type, group: 'Style' },
  { id: 'h1', label: 'Heading 1', icon: Heading1, group: 'Style' },
  { id: 'h2', label: 'Heading 2', icon: Heading2, group: 'Style' },
  { id: 'h3', label: 'Heading 3', icon: Heading3, group: 'Style' },
  { id: 'bullet-list', label: 'Bullet List', icon: List, group: 'Style' },
  { id: 'numbered-list', label: 'Numbered List', icon: ListOrdered, group: 'Style' },
  { id: 'todo', label: 'To-do List', icon: CheckSquare, group: 'Style' },
  { id: 'quote', label: 'Blockquote', icon: Quote, group: 'Style' },
  { id: 'code', label: 'Code Block', icon: Code, group: 'Style' },
  { id: 'divider', label: 'Divider', icon: Minus, group: 'Insert' },
  { id: 'table', label: 'Table', icon: TableIcon, group: 'Insert' },
  { id: 'emoji', label: 'Emoji', icon: Smile, group: 'Insert' },
  { id: 'mention', label: 'Mention', icon: AtSign, group: 'Insert' },
  { id: 'image', label: 'Image', icon: Image, group: 'Upload' },
  { id: 'video', label: 'Video', icon: Youtube, group: 'Upload' },
  { id: 'audio', label: 'Audio', icon: Music, group: 'Upload' },
];

interface SlashMenuProps {
  position?: Coordinates;
  onSelect?: (type: BlockType) => void;
  onClose?: () => void;
  // Optional controlled props used by TipTap Suggestion renderer
  items?: MenuItem[];
  query?: string | null;
}


import { SlashDropdownMenu } from "@/components/tiptap-ui/slash-dropdown-menu"
import type { SuggestionItem } from "@/components/tiptap-ui-utils/suggestion-menu"
import { insertImageUpload } from '@/editor/extensions/image-extension'
import { insertTable } from '@/editor/extensions/table-extension'
import { openMentionMenu } from '@/editor/extensions/mention-suggestion'
import type { Editor } from '@tiptap/react'
import { isNodeInSchema } from '@/lib/tiptap-utils'
import { offset, shift, size } from '@floating-ui/react'

export const SlashMenu: React.FC<SlashMenuProps & { editor?: import('@tiptap/react').Editor | null }> = ({ position, onSelect, onClose, items, query: controlledQuery, editor }) => {
  // Convert our simple MENU_ITEMS into SuggestionItems for the Notion-style menu
  const toSuggestionItems = (menuItems: MenuItem[]): SuggestionItem[] => {
    return menuItems.map((mi) => {
      const id = mi.id
      const title = mi.label
      const badge = mi.icon as any
      const group = mi.group

      const onSelect = ({ editor }: { editor: Editor }) => {
        // Action executed by selecting item from the Notion-style menu
        switch (id) {
          case 'text':
            editor.chain().focus().setParagraph().run()
            break
          case 'h1':
            editor.chain().focus().toggleHeading({ level: 1 }).run()
            break
          case 'h2':
            editor.chain().focus().toggleHeading({ level: 2 }).run()
            break
          case 'h3':
            editor.chain().focus().toggleHeading({ level: 3 }).run()
            break
          case 'bullet-list':
            editor.chain().focus().toggleBulletList().run()
            break
          case 'numbered-list':
            editor.chain().focus().toggleOrderedList().run()
            break
          case 'todo':
            editor.chain().focus().toggleTaskList().run()
            break
          case 'quote':
            editor.chain().focus().toggleBlockquote().run()
            break
          case 'code':
            editor.chain().focus().toggleCodeBlock().run()
            break
          case 'divider':
            editor.chain().focus().setHorizontalRule().run()
            break
          case 'table':
            try {
              insertTable(editor, 3, 3, true)
            } catch (err) {
              console.error('[SlashMenu] table insertion failed', err)
            }
            break
          case 'mention':
            try {
              openMentionMenu(editor)
            } catch (err) {
              editor.chain().focus().insertContent('@').run()
            }
            break
          case 'emoji':
            editor.chain().focus().insertContent(':').run()
            setTimeout(() => {
              try {
                if (editor && editor.view) {
                  editor.view.dispatch(editor.state.tr)
                  editor.view.focus()
                }
              } catch (err) {
                // ignore
              }
            }, 0)
            break
          case 'image':
            try {
              const success = insertImageUpload(editor)
              if (!success) editor.chain().focus().insertContent('![]()').run()
            } catch (err) {
              console.error('[SlashMenu] insert image error', err)
            }
            break
          case 'video':
            try {
              if (isNodeInSchema('videoUploadNode', editor)) {
                editor.chain().focus().insertContent({ type: 'videoUploadNode', attrs: { src: null } }).run()
              } else if (isNodeInSchema('youtube', editor)) {
                editor.chain().focus().setYoutubeVideo({ src: '' }).run()
              } else {
                // fallback placeholder action
                editor.chain().focus().insertContent('[Paste YouTube link here]').run()
              }
            } catch (err) {
              console.error('[SlashMenu] insert video error', err)
            }
            break
          case 'audio':
            try {
              if (isNodeInSchema('audioUploadNode', editor)) {
                editor.chain().focus().insertContent({ type: 'audioUploadNode', attrs: { src: null } }).run()
              } else {
                editor.chain().focus().insertContent('[Audio placeholder]').run()
              }
            } catch (err) {
              console.error('[SlashMenu] insert audio error', err)
            }
            break
          default:
            break
        }
      }

      const item: SuggestionItem = {
        title,
        badge,
        group,
        onSelect
      }

      return item
    })
  }

  // Build authoritative items from MENU_ITEMS (or use provided items) and pass them as custom items.
  const customItems = toSuggestionItems(items ?? MENU_ITEMS)

  // Pass custom items and disable the internal menu to avoid duplicates; the menu itself is authoritative for availability
  // Also specify floatingOptions and autoUpdateOptions to prevent flip while keyboard navigating to avoid the menu jumping
  // Additionally, install a DOM handler to focus the floating menu and forward key events to the editor so
  // keyboard navigation is fully contained within the menu and does not move it.
  const forwardedKeys = new Set([
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'Enter',
    'Escape',
    'Tab',
    'Home',
    'End',
  ])

  React.useEffect(() => {
    if (!editor) return

    let el: HTMLElement | null = null
    let handler: ((e: KeyboardEvent) => void) | null = null

    const attach = () => {
      el = document.querySelector('[data-selector="tiptap-slash-dropdown-menu"]') as HTMLElement | null
      if (!el || !editor || !editor.view) return

      try {
        // Keep the editor focused; focusing the menu can blur the editor and
        // cause the suggestion UI to disappear while the suggestion is still active.
        el.tabIndex = -1
      } catch (err) {
        // ignore
      }

      handler = (e: KeyboardEvent) => {
        if (!forwardedKeys.has(e.key)) return
        // Prevent default on the menu element so editor doesn't also react directly
        e.preventDefault()
        e.stopPropagation()

        // If the user is trying to move beyond the bounds of the menu, do nothing.
        // This prevents a redundant update in the editor that can cause the floating
        // menu to re-measure and shift slightly when at the edges.
        try {
          const buttons = Array.from(el?.querySelectorAll('button[data-style="ghost"]') || []) as HTMLElement[]
          const activeIndex = buttons.findIndex((b) => b.getAttribute('data-active-state') === 'on')
          if (e.key === 'ArrowDown' && activeIndex === buttons.length - 1) return
          if (e.key === 'ArrowUp' && activeIndex === 0) return
        } catch (err) {
          // ignore and continue to dispatch
        }

        // Re-dispatch a KeyboardEvent on the editor root so TipTap's Suggestion plugin handles it
        const target = editor.view.dom as HTMLElement
        try {
          const kd = new KeyboardEvent('keydown', {
            key: e.key,
            code: e.code,
            bubbles: true,
            cancelable: true,
          })
          target.dispatchEvent(kd)
        } catch (err) {
          // ignore
        }
      }

      el.addEventListener('keydown', handler, { capture: true })
    }

    const observer = new MutationObserver(() => {
      // Try to (re)attach when DOM changes (menu mount/unmount)
      if (!el) attach()
    })

    observer.observe(document.body, { childList: true, subtree: true })

    // Try immediate attach in case the menu is present
    attach()

    return () => {
      if (handler && el) el.removeEventListener('keydown', handler as any, { capture: true })
      observer.disconnect()
    }
  }, [editor])

  return (
    <SlashDropdownMenu
      editor={editor}
      config={{ enabledItems: [], customItems }}
      keepOpenOnEditorClick
      persistOnExit
      closeOnEscape={false}
      floatingOptions={{
        placement: 'top-start',
        middleware: [
          // Position a bit to the right and slightly above the bottom edge
          // of the trigger so it feels anchored but not flush to the cursor.
          offset({ mainAxis: 8, crossAxis: 10 }),
          shift({ padding: 8 }),
          size({
            apply({ availableHeight, elements }) {
              if (elements.floating) {
                const maxHeightValue = Math.min(320, availableHeight)
                elements.floating.style.setProperty('--suggestion-menu-max-height', `${maxHeightValue}px`)
              }
            },
          }),
        ],
      }}
      autoUpdateOptions={{ animationFrame: false }}
    />
  )
}
