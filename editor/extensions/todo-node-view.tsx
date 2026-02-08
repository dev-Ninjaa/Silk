import React from 'react'
import { NodeViewWrapper, NodeViewContent, ReactNodeViewProps } from '@tiptap/react'

interface TodoNodeViewProps extends ReactNodeViewProps {
  node: any
  updateAttributes: (attrs: any) => void
}

/**
 * NodeView for rendering todo items with interactive checkboxes
 * Derives checked state directly from node.attrs to stay synchronized with
 * editor transactions, undo/redo, and collaborative changes
 */
export const TodoNodeView: React.FC<TodoNodeViewProps> = ({
  node,
  updateAttributes,
}) => {
  const isChecked = node.attrs.checked || false

  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAttributes({ checked: e.target.checked })
  }

  return (
    <NodeViewWrapper className="custom-todo-item" as="div">
      <div className="flex items-start gap-2 py-1">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckChange}
          className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 cursor-pointer"
        />
        <div className={`flex-1 ${isChecked ? 'line-through text-gray-500' : ''}`}>
          <NodeViewContent />
        </div>
      </div>
    </NodeViewWrapper>
  )
}
