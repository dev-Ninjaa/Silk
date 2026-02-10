"use client"

import { useRef, useState, useEffect } from "react"
import type { NodeViewProps } from "@tiptap/react"
import { NodeViewWrapper } from "@tiptap/react"
import { Music } from 'lucide-react'
import "./audio-upload-node.scss"
import { AudioUploadDialog } from "./audio-upload-dialog"

import { fileToBase64 } from "@/editor/lib/tiptap-utils"

interface AudioUploadDialogProps {
  editor: any
  onClose: () => void
  onUpload?: (file: File) => void
}



export const AudioUploadNode = (props: NodeViewProps) => {
  const { node, updateAttributes, deleteNode, editor } = props
  const [showDialog, setShowDialog] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!showDialog) return
    const onDocMouseDown = (ev: MouseEvent) => {
      if (!wrapperRef.current) return
      if (!(ev.target instanceof Node)) return
      if (!wrapperRef.current.contains(ev.target)) {
        setShowDialog(false)
      }
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [showDialog])

  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(true) }
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.currentTarget === e.target) setIsDragActive(false) }
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = "copy" }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragActive(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.type.startsWith("audio/")) {
          const audioUrl = URL.createObjectURL(file)
          updateAttributes({ src: audioUrl, alt: file.name, title: file.name })

          // persist asset creation
          try {
            const base64 = await fileToBase64(file)
            const correlationId = crypto.randomUUID()
            const detail = { correlationId, name: file.name, type: "audio", source: { kind: "file", dataUrl: base64 }, src: base64 }
            window.dispatchEvent(new CustomEvent("app:create-asset-request", { detail }))
            const onResponse = (ev: Event) => {
              const ce = ev as CustomEvent<{ correlationId: string; assetId?: string }>
              if (ce?.detail?.correlationId !== correlationId) return
              const { assetId } = ce.detail || {}
              if (assetId) updateAttributes({ assetId })
              window.removeEventListener("app:create-asset-response", onResponse)
            }
            window.addEventListener("app:create-asset-response", onResponse)
          } catch (err) {
            console.error("Failed to persist uploaded audio as asset:", err)
          }

          break
        }
      }
    }
  }

  const handleClick = () => setShowDialog(true)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type.startsWith("audio/")) {
        const audioUrl = URL.createObjectURL(file)
        updateAttributes({ src: audioUrl, alt: file.name, title: file.name })

        try {
          const base64 = await fileToBase64(file)
          const correlationId = crypto.randomUUID()
          const detail = { correlationId, name: file.name, type: "audio", source: { kind: "file", dataUrl: base64 }, src: base64 }
          window.dispatchEvent(new CustomEvent("app:create-asset-request", { detail }))
          const onResponse = (ev: Event) => {
            const ce = ev as CustomEvent<{ correlationId: string; assetId?: string }>
            if (ce?.detail?.correlationId !== correlationId) return
            const { assetId } = ce.detail || {}
            if (assetId) updateAttributes({ assetId })
            window.removeEventListener("app:create-asset-response", onResponse)
          }
          window.addEventListener("app:create-asset-response", onResponse)
        } catch (err) {
          console.error("Failed to persist uploaded audio as asset:", err)
        }
      }
    }
    e.target.value = ""
  }

  if (node.attrs.src) {
    return (
      <NodeViewWrapper as="div" className="audio-upload-node-wrapper">
        <div className="audio-upload-node-container">
          <audio src={node.attrs.src} controls className="audio-upload-node-element" title={node.attrs.title} preload="metadata" />
          <div className="audio-upload-node-delete-area">
            <button className="video-delete-btn" onClick={() => deleteNode()} title="Delete audio">✕</button>
          </div>
        </div>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper as="div" className={`audio-upload-node-wrapper ${showDialog ? "dialog-open" : ""}`} ref={wrapperRef}>
        <div className={`audio-upload-surface ${isDragActive ? "drag-active" : ""}`} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} onClick={handleClick}>
          <div className="audio-upload-placeholder">
            <Music className="audio-upload-music-icon" />
            <span className="audio-upload-placeholder-text">Add an audio file</span>
          </div>

          <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileSelect} style={{ display: "none" }} />
        </div>

        {showDialog && (
          <div className="audio-upload-node-dialog-container">
            <AudioUploadDialog editor={editor} onClose={() => setShowDialog(false)} onUpload={async (file: File) => {
              try {
                const base64 = await fileToBase64(file)
                updateAttributes({ src: base64, alt: file.name, title: file.name })

                const correlationId = crypto.randomUUID()
                const detail = { correlationId, name: file.name, type: "audio", source: { kind: "file", dataUrl: base64 }, src: base64 }
                window.dispatchEvent(new CustomEvent("app:create-asset-request", { detail }))

                const onResponse = (ev: Event) => {
                  const ce = ev as CustomEvent<{ correlationId: string; assetId?: string }>
                  if (ce?.detail?.correlationId !== correlationId) return
                  const { assetId } = ce.detail || {}
                  if (assetId) updateAttributes({ assetId })
                  window.removeEventListener("app:create-asset-response", onResponse)
                }
                window.addEventListener("app:create-asset-response", onResponse)
              } catch (err) {
                console.error("Failed to persist uploaded audio as asset:", err)
              }
            }} />
          </div>
        )}
    </NodeViewWrapper>
  )
}
