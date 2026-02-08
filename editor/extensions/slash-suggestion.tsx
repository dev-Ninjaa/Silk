import React from 'react'
import Suggestion from '@tiptap/suggestion'
import { Extension } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'
import { createRoot } from 'react-dom/client'
import { MENU_ITEMS } from '@/editor/ui/SlashMenu'
import { SlashMenu } from '@/editor/ui/SlashMenu'
import { insertImageUpload } from '@/editor/extensions/image-extension'
import { insertTable } from '@/editor/extensions/table-extension'
import { openMentionMenu } from '@/editor/extensions/mention-suggestion'
import type { MenuItem } from '@/editor/schema/types'

export const SlashSuggestion = Extension.create({
  name: 'slashSuggestion',

  addProseMirrorPlugins() {
    return [
      (Suggestion as any)({
        pluginKey: new PluginKey('slashSuggestion'),
        char: '/',
        startOfLine: false,
        editor: this.editor,
        command: ({ editor, range, props }: any) => {
          // handled by render() selection; leave noop here
        },
        items: ({ query }: any) => {
          const q = (query || '').toLowerCase()
          return MENU_ITEMS.filter((it) => it.label.toLowerCase().includes(q)) as MenuItem[]
        },
        render: () => {
          let container: HTMLElement | null = null
          let root: any = null
          let currentProps: any = null
          let handleSelect: ((id: string) => void) | null = null

          const updatePosition = (props: any) => {
            if (!container) return
            const clientRect = props.clientRect && props.clientRect()
            let rect = clientRect
            // Fallback: compute using editor view coords if clientRect is not available
            if (!rect && props.range && props.editor && props.editor.view) {
              try {
                const coords = props.editor.view.coordsAtPos(props.range.to)
                rect = coords
              } catch (err) {
                rect = null
              }
            }
            if (!rect) return
            if (!rect) return

            const menuHeight = 320; // Approx max height
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            const left = rect.left + window.scrollX + 50; // Offset right by 50px

            let top;
            // Place above if restricted space below, but only if there is space above
            if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
              top = (rect.top + window.scrollY) - menuHeight - 10;
            } else {
              top = (rect.bottom + window.scrollY) + 10;
            }

            container.style.left = `${left}px`
            container.style.top = `${top}px`
          }

          return {
            onStart: (props: any) => {
              currentProps = props
              container = document.createElement('div')
              container.style.position = 'absolute'
              container.style.zIndex = '9999'
              document.body.appendChild(container)

              handleSelect = (id: string) => {
                if (!currentProps) return
                const onExit = currentProps.onExit
                const editor = currentProps.editor
                // remove the slash trigger range
                editor.chain().focus().deleteRange(currentProps.range).run()

                // Dispatch command similar to previous handler
                switch (id) {
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
                      // Use the table helper to insert a default 3x3 table with header row
                      const success = insertTable(editor, 3, 3, true)
                      if (!success) {
                        console.warn('[Slash] table insertion failed')
                      }
                    } catch (err) {
                      console.error('[Slash] table insertion error', err)
                    }
                    break
                  case 'mention':
                    // Use the mention helper to reliably open the mention suggestion UI
                    try {
                      openMentionMenu(editor)
                    } catch (err) {
                      console.error('[Slash] open mention helper failed, falling back to raw insert', err)
                      editor.chain().focus().insertContent('@').run()
                      setTimeout(() => {
                        try {
                          if (editor && editor.view) {
                            editor.view.dispatch(editor.state.tr)
                            editor.view.focus()
                          }
                        } catch (err) {
                          console.error('[Slash] trigger suggestion error', err)
                        }
                      }, 0)
                    }

                    break
                  case 'emoji':
                    editor.chain().focus().insertContent('😀 ').run()
                    break
                  case 'image':
                    try {
                      const success = insertImageUpload(editor)
                      if (!success) {
                        // fallback to simple markdown image if insertion is unavailable
                        editor.chain().focus().insertContent('![]()').run()
                      }
                    } catch (err) {
                      console.error('[Slash] insert image error', err)
                      editor.chain().focus().insertContent('![]()').run()
                    }
                    break
                  default:
                    break
                }

                if (onExit) onExit()
              }

              root = createRoot(container)
              root.render(
                <SlashMenu
                  position={{ x: 0, y: 0 }}
                  items={props.items}
                  query={props.query}
                  onSelect={(id: string) => handleSelect && handleSelect(id)}
                  onClose={() => currentProps?.onExit?.()}
                />
              )

              updatePosition(props)
            },
            onUpdate: (props: any) => {
              currentProps = props
              // Re-render with fresh items/query so the UI shows suggestion results
              if (root) {
                root.render(
                  <SlashMenu
                    position={{ x: 0, y: 0 }}
                    items={props.items}
                    query={props.query}
                    onSelect={(id: string) => handleSelect && handleSelect(id)}
                    onClose={() => currentProps?.onExit?.()}
                  />
                )
              }
              updatePosition(props)
            },
            onKeyDown: (props: any) => {
              return false
            },
            onExit: () => {
              if (root) {
                root.unmount()
                root = null
              }
              if (container && container.parentNode) {
                container.parentNode.removeChild(container)
                container = null
              }
              currentProps = null
              handleSelect = null
            },
          }
        },
      }),
    ]
  },
})

export default SlashSuggestion
