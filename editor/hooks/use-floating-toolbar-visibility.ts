import { isNodeSelection, type Editor } from "@tiptap/react"
import { NodeSelection, type Transaction } from "@tiptap/pm/state"
import { useEffect, useRef, useState } from "react"

export const HIDE_FLOATING_META = "hideFloatingToolbar"

/**
 * Selects a node and marks the transaction to keep floating toolbars hidden
 * until the next explicit selection change.
 */
export function selectNodeAndHideFloating(editor: Editor, pos: number) {
  const { state, view } = editor
  const nodeSelection = NodeSelection.create(state.doc, pos)
  const transaction = state.tr
    .setSelection(nodeSelection)
    .setMeta(HIDE_FLOATING_META, true)
  view.dispatch(transaction)
}

/**
 * Centralizes all logic about when the floating toolbar should be hidden/shown.
 */
export function useFloatingToolbarVisibility(params: {
  editor: Editor | null
  isSelectionValid: (
    editor: Editor,
    selection: Editor["state"]["selection"]
  ) => boolean
  extraHideWhen?: boolean
}) {
  const { editor, isSelectionValid, extraHideWhen = false } = params
  const [shouldShow, setShouldShow] = useState(false)
  const hideRef = useRef(false)

  // TX listener: turn on hide when our meta is present, clear it on new Selection without the flag
  useEffect(() => {
    if (!editor) return

    const onTx = ({ transaction }: { transaction: Transaction }) => {
      if (transaction.getMeta(HIDE_FLOATING_META)) {
        hideRef.current = true
      } else if (transaction.selectionSet) {
        hideRef.current = false
      }
    }

    editor.on("transaction", onTx)

    return () => {
      editor.off("transaction", onTx)
    }
  }, [editor])

  // Re-click same selected node should immediately allow floating
  useEffect(() => {
    if (!editor) return
    const dom = editor.view.dom

    const onPointerDown = (e: PointerEvent) => {
      const sel = editor.state.selection
      if (!(sel instanceof NodeSelection)) return
      const nodeDom = editor.view.nodeDOM(sel.from) as HTMLElement | null
      if (!nodeDom) return
      if (nodeDom.contains(e.target as Node)) {
        hideRef.current = false
        const valid = isSelectionValid(editor, sel)
        setShouldShow(valid && !extraHideWhen)
      }
    }

    dom.addEventListener("pointerdown", onPointerDown, { capture: true })
    return () =>
      dom.removeEventListener("pointerdown", onPointerDown, {
        capture: true,
      })
  }, [editor, extraHideWhen, isSelectionValid])

  // Selection-driven visibility
  useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      const { selection } = editor.state
      const valid = isSelectionValid(editor, selection)

      if (extraHideWhen || (isNodeSelection(selection) && hideRef.current)) {
        setShouldShow(false)
        return
      }
      setShouldShow(valid)
    }

    handleSelectionUpdate()
    editor.on("selectionUpdate", handleSelectionUpdate)
    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate)
    }
  }, [editor, extraHideWhen, isSelectionValid])

  return { shouldShow }
}
