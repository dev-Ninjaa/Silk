import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'

// Configure the official Table extension with resizable tables
const TableExtension = [
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableCell,
  TableHeader,
]

/**
 * Insert a table at the current cursor position
 * @param editor - TipTap editor instance
 * @param rows - Number of rows (default 3)
 * @param cols - Number of columns (default 3)
 * @param withHeaderRow - Whether to include header row (default true)
 */
export function insertTable(
  editor: any,
  rows = 3,
  cols = 3,
  withHeaderRow = true
) {
  if (!editor) return false
  try {
    return editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow })
      .run()
  } catch (err) {
    console.error('[TableExtension] insertTable error', err)
    return false
  }
}

/**
 * Add a new row after the current row
 */
export function addRowAfter(editor: any) {
  if (!editor) return false
  try {
    return editor.chain().focus().addRowAfter().run()
  } catch (err) {
    console.error('[TableExtension] addRowAfter error', err)
    return false
  }
}

/**
 * Add a new column after the current column
 */
export function addColumnAfter(editor: any) {
  if (!editor) return false
  try {
    return editor.chain().focus().addColumnAfter().run()
  } catch (err) {
    console.error('[TableExtension] addColumnAfter error', err)
    return false
  }
}

export default TableExtension
