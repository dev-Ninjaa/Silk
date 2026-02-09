import React from 'react'
import { NodeViewWrapper, NodeViewContent, ReactNodeViewProps } from '@tiptap/react'

interface AssetNodeViewProps extends ReactNodeViewProps {
  node: any
  selected: boolean
  updateAttributes: (attrs: any) => void
  deleteNode: () => void
}

/**
 * NodeView for rendering asset nodes (images, videos, audio)
 * Displays media with proper controls and selection state
 */
export const AssetNodeView: React.FC<AssetNodeViewProps> = ({
  node,
  selected,
  updateAttributes,
  deleteNode
}) => {
  const { assetId, type, alt, title } = node.attrs

  // Prefer embedded src (dataUrl) if provided; otherwise fall back to server path
  const [resolvedSrc, setResolvedSrc] = React.useState<string | null>(
    node.attrs.src && node.attrs.src.length > 0 ? node.attrs.src : null
  )

  // If we don't have a src but have an assetId fallback path, try to resolve from localStorage asset store
  React.useEffect(() => {
    if (resolvedSrc) return

    // If attrs.src not provided, check if local asset exists in LocalStorage store
    if (assetId) {
      import('@/app/lib/persistence/LocalStorageAssetStore').then(({ LocalStorageAssetStore }) => {
        const store = new LocalStorageAssetStore()
        store.loadAssets().then((allAssets) => {
          const match = allAssets.find((a: any) => a.id === assetId)
          if (match && match.source && match.source.kind === 'file' && match.source.dataUrl) {
            setResolvedSrc(match.source.dataUrl)
          }
        }).catch((err) => {
          console.error('[AssetNodeView] failed to load assets from localStorage', err)
        })
      }).catch((err) => {
        // Ignore if module can't be loaded
        console.warn('[AssetNodeView] LocalStorageAssetStore not available', err)
      })
    }
  }, [assetId, resolvedSrc])

  // Final URL used in media elements; if still null, fallback to /assets/:id (may 404)
  const assetUrl = resolvedSrc ?? `/assets/${assetId}`

  return (
    <NodeViewWrapper
      className={`asset-node-view ${selected ? 'selected' : ''}`}
      draggable
    >
      <div className={`relative inline-block ${selected ? 'ring-2 ring-blue-500' : ''}`}>
        {type === 'image' && (
          <img
            src={assetUrl}
            alt={alt || 'Asset'}
            title={title || ''}
            className="max-w-full rounded-lg shadow-md"
            onError={(e) => {
              const img = e.target as HTMLImageElement
              img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ccc" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-family="sans-serif" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E'
            }}
          />
        )}

        {type === 'video' && (
          <video
            src={assetUrl}
            controls
            className="max-w-full rounded-lg shadow-md"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        )}

        {type === 'audio' && (
          <audio
            src={assetUrl}
            controls
            className="w-full rounded-lg shadow-md"
            style={{ width: '100%' }}
          />
        )}

        {(type === 'pdf' || type === 'docx' || type === 'text' || type === 'markdown' || type === 'link') && (
          <div className="block my-3 p-4 bg-stone-50 rounded-lg border border-stone-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-stone-100 flex items-center justify-center text-stone-600">📎</div>
              <div className="flex-1">
                <div className="font-medium text-stone-700">{title || assetId}</div>
                <div className="text-xs text-stone-500">{type.toUpperCase()}</div>
              </div>
              <div>
                <a href={assetUrl} target="_blank" rel="noreferrer" className="px-3 py-1 rounded bg-stone-200 text-stone-700 text-sm hover:bg-stone-300">Open</a>
              </div>
            </div>
          </div>
        )}

        {selected && (
          <div className="absolute top-0 right-0 flex gap-2 p-2">
            <button
              onClick={() => deleteNode()}
              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
              title="Delete asset"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}
