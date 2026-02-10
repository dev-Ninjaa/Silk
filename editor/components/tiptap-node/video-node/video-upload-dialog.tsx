"use client"

import { useState, useRef } from "react"
import type { Editor } from "@tiptap/react"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Upload, Link } from "lucide-react"
import "./video-upload-dialog.scss"

interface VideoUploadDialogProps {
  editor: Editor
  onClose: () => void
  /** Passes the selected File back to the caller for further handling (e.g., persistence) */
  onUpload?: (file: File) => void
}

export function VideoUploadDialog({ editor, onClose, onUpload }: VideoUploadDialogProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "embed">("upload")
  const [embedUrl, setEmbedUrl] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file is a video
    if (!file.type.startsWith("video/")) {
      alert("Please select a valid video file")
      event.target.value = ""
      return
    }

    try {
      setIsProcessing(true)
      // Provide the raw File to the caller for persistence/processing
      if (onUpload) {
        onUpload(file)
      }
      onClose()
    } catch (error) {
      console.error("Failed to process video:", error)
      alert("Failed to process video. Please try again.")
    } finally {
      setIsProcessing(false)
      event.target.value = ""
    }
  }

  const handleChooseVideo = () => {
    fileInputRef.current?.click()
  }

  const handleEmbedSubmit = () => {
    if (!embedUrl.trim()) return

    try {
      setIsProcessing(true)
      // Insert YouTube video using the extension
      editor.chain().focus().setYoutubeVideo({ src: embedUrl.trim() }).run()
      onClose()
    } catch (error) {
      console.error("Failed to embed video:", error)
      alert("Failed to embed video. Please check the URL and try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="video-upload-dialog">
      <div className="video-upload-header">
        <Upload className="video-upload-icon" size={20} />
        <h3>Embed or upload a video</h3>
      </div>

      <div className="video-upload-tabs">
        <button
          className={`video-tab ${activeTab === "upload" ? "active" : ""}`}
          onClick={() => setActiveTab("upload")}
        >
          Upload
        </button>
        <button
          className={`video-tab ${activeTab === "embed" ? "active" : ""}`}
          onClick={() => setActiveTab("embed")}
        >
          Embed link
        </button>
      </div>

      <div className="video-upload-content">
        {activeTab === "upload" ? (
          <div className="video-upload-section">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <Button
              onClick={handleChooseVideo}
              className="choose-video-button"
              disabled={isProcessing}
            >
              Choose a video
            </Button>
            <p className="video-upload-hint">
              Select a video file from your computer
            </p>
          </div>
        ) : (
          <div className="video-embed-section">
            <input
              type="text"
              placeholder="Paste YouTube video link..."
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isProcessing) {
                  handleEmbedSubmit()
                } else if (e.key === "Escape") {
                  onClose()
                }
              }}
              className="video-embed-input"
              autoFocus
            />
            <div className="video-embed-actions">
              <Button onClick={onClose} className="cancel-button">
                Cancel
              </Button>
              <Button
                onClick={handleEmbedSubmit}
                disabled={!embedUrl.trim() || isProcessing}
                className="embed-button"
              >
                {isProcessing ? "Embedding..." : "Embed video"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
