"use client"

import { useRef, useState } from "react"
import type { Editor } from "@tiptap/react"
import "./audio-upload-dialog.scss"

interface AudioUploadDialogProps {
  editor: Editor
  onClose: () => void
  onUpload?: (file: File) => void
}

export function AudioUploadDialog({ editor, onClose, onUpload }: AudioUploadDialogProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "embed">("upload")
  const [embedUrl, setEmbedUrl] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("audio/")) {
      alert("Please select a valid audio file")
      event.target.value = ""
      return
    }

    try {
      setIsProcessing(true)
      if (onUpload) onUpload(file)
      onClose()
    } catch (error) {
      console.error("Failed to process audio:", error)
      alert("Failed to process audio. Please try again.")
    } finally {
      setIsProcessing(false)
      event.target.value = ""
    }
  }

  const handleChooseAudio = () => fileInputRef.current?.click()

  const handleEmbedSubmit = () => {
    if (!embedUrl.trim()) return
    try {
      setIsProcessing(true)
      editor.chain().focus().insertContent({ type: 'audioUploadNode', attrs: { src: embedUrl.trim() } }).run()
      onClose()
    } catch (error) {
      console.error("Failed to embed audio:", error)
      alert("Failed to embed audio. Please check the URL and try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="audio-upload-dialog">
      <div className="audio-upload-tabs">
        <button className={`audio-tab ${activeTab === "upload" ? "active" : ""}`} onClick={() => setActiveTab("upload")}>Upload</button>
        <button className={`audio-tab ${activeTab === "embed" ? "active" : ""}`} onClick={() => setActiveTab("embed")}>Embed link</button>
      </div>

      {activeTab === "upload" ? (
        <div className="audio-upload-body">
          <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileSelect} style={{ display: "none" }} />
          <button onClick={handleChooseAudio} className="choose-file-button" disabled={isProcessing}>{isProcessing ? "Uploading..." : "Choose a file"}</button>
        </div>
      ) : (
        <div className="audio-embed-body">
          <input type="text" placeholder="Paste audio link..." value={embedUrl} onChange={(e) => setEmbedUrl(e.target.value)} className="audio-embed-input" autoFocus onKeyDown={(e) => { if (e.key === "Enter" && !isProcessing) { handleEmbedSubmit() } else if (e.key === "Escape") { onClose() } }} />
          <div className="audio-embed-actions">
            <button onClick={onClose} className="cancel-button">Cancel</button>
            <button onClick={handleEmbedSubmit} disabled={!embedUrl.trim() || isProcessing} className="embed-button">{isProcessing ? "Embedding..." : "Embed audio"}</button>
          </div>
        </div>
      )}

      <button onClick={onClose} className="dialog-close" aria-label="Close">✕</button>
    </div>
  )
}
