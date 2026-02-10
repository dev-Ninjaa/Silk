import { mergeAttributes, Node } from "@tiptap/react"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { AudioUploadNode as AudioUploadNodeComponent } from "@/editor/components/tiptap-node/audio-upload-node/audio-upload-node"
import type { NodeType } from "@tiptap/pm/model"

export type AudioUploadFunction = (
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal
) => Promise<string>

export interface AudioUploadNodeOptions {
  /**
   * The type of the node.
   * @default 'audioUpload'
   */
  type?: string | NodeType | undefined
  /**
   * Acceptable file types for upload.
   * @default 'audio/*'
   */
  accept?: string
  /**
   * Maximum number of files that can be uploaded.
   * @default 1
   */
  limit?: number
  /**
   * Maximum file size in bytes (0 for unlimited).
   * @default 0
   */
  maxSize?: number
  /**
   * Function to handle the upload process.
   */
  upload?: AudioUploadFunction
  /**
   * Callback for upload errors.
   */
  onError?: (error: Error) => void
  /**
   * Callback for successful uploads.
   */
  onSuccess?: (url: string) => void
}

/**
 * AudioUploadNode Extension for TipTap
 * Allows users to upload audio files and embed them in the editor
 */
export const AudioUploadNodeExtension = Node.create<AudioUploadNodeOptions>({
  name: "audioUploadNode",

  group: "block",

  selectable: true,

  draggable: true,

  atom: true,

  addOptions() {
    return {
      type: "audioUploadNode",
      accept: "audio/*",
      limit: 1,
      maxSize: 0,
      upload: undefined,
      onError: undefined,
      onSuccess: undefined,
    }
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute("src"),
        renderHTML: (attributes) => ({
          src: attributes.src,
        }),
      },
      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute("alt"),
        renderHTML: (attributes) => ({
          alt: attributes.alt,
        }),
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute("title"),
        renderHTML: (attributes) => ({
          title: attributes.title,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: "audio-upload-node",
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "audio-upload-node",
      mergeAttributes(this.options as any, HTMLAttributes),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(AudioUploadNodeComponent)
  },
})

export default AudioUploadNodeExtension