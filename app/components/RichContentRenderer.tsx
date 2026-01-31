'use client';

import React, { useState } from 'react';
import { parseRichContent, ContentToken } from '@/app/lib/richContentParser';
import { ExternalLink } from 'lucide-react';
import { Asset } from '@/app/types';

interface RichContentRendererProps {
  content: string;
  onAssetClick?: (assetId: string) => void;
  assets?: Asset[]; // Pass assets to render inline
}

/**
 * RichContentRenderer
 * 
 * Renders plain text content with rich media support:
 * - Markdown links as clickable anchors
 * - Image URLs as embedded images
 * - Video URLs as embedded iframes
 * 
 * This is a pure presentation layer - does NOT modify editor or data.
 */
export const RichContentRenderer: React.FC<RichContentRendererProps> = ({ 
  content,
  onAssetClick,
  assets = []
}) => {
  // Check if content is an asset reference: {{asset:asset-id}}
  const assetRefMatch = content.match(/^\{\{asset:(asset-[a-z0-9]+)\}\}$/);
  if (assetRefMatch) {
    const assetId = assetRefMatch[1];
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      return <InlineAssetRenderer asset={asset} onAssetClick={onAssetClick} />;
    }
  }

  const tokens = parseRichContent(content);

  return (
    <span className="inline">
      {tokens.map((token, index) => (
        <TokenRenderer 
          key={index} 
          token={token} 
          onAssetClick={onAssetClick}
        />
      ))}
    </span>
  );
};

interface TokenRendererProps {
  token: ContentToken;
  onAssetClick?: (assetId: string) => void;
}

const TokenRenderer: React.FC<TokenRendererProps> = ({ token, onAssetClick }) => {
  const [imageError, setImageError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  if (token.type === 'text') {
    return <>{token.content}</>;
  }

  if (token.type === 'link') {
    // Check if it's an internal asset link
    if (token.url.startsWith('asset-') && onAssetClick) {
      return (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onAssetClick(token.url);
          }}
          className="text-stone-700 underline underline-offset-2 hover:text-stone-900 transition-colors inline-flex items-center gap-1"
        >
          {token.text}
        </a>
      );
    }

    // External link
    return (
      <a
        href={token.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-stone-700 underline underline-offset-2 hover:text-stone-900 transition-colors inline-flex items-center gap-1"
      >
        {token.text}
        <ExternalLink size={12} className="opacity-60" />
      </a>
    );
  }

  if (token.type === 'image') {
    if (imageError) {
      // Fallback to plain URL if image fails to load
      return (
        <a
          href={token.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-stone-700 underline underline-offset-2 hover:text-stone-900 transition-colors inline-flex items-center gap-1"
        >
          {token.url}
          <ExternalLink size={12} className="opacity-60" />
        </a>
      );
    }

    return (
      <span className="block my-3">
        <img
          src={token.url}
          alt="Embedded image"
          loading="lazy"
          onError={() => setImageError(true)}
          className="max-w-full rounded-lg border border-stone-200"
        />
      </span>
    );
  }

  if (token.type === 'video') {
    const embedUrl = token.platform === 'youtube'
      ? `https://www.youtube.com/embed/${token.videoId}`
      : `https://player.vimeo.com/video/${token.videoId}`;

    return (
      <span className="block my-3">
        {!videoLoaded && (
          <button
            onClick={() => setVideoLoaded(true)}
            className="w-full aspect-video rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-colors flex items-center justify-center text-stone-600 text-sm"
          >
            Click to load {token.platform === 'youtube' ? 'YouTube' : 'Vimeo'} video
          </button>
        )}
        {videoLoaded && (
          <iframe
            src={embedUrl}
            title={`${token.platform} video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-presentation"
            className="w-full aspect-video rounded-lg border border-stone-200"
          />
        )}
      </span>
    );
  }

  return null;
};

interface InlineAssetRendererProps {
  asset: Asset;
  onAssetClick?: (assetId: string) => void;
}

const InlineAssetRenderer: React.FC<InlineAssetRendererProps> = ({ asset, onAssetClick }) => {
  if (asset.source.kind !== 'file') {
    // Links are not rendered inline, just show as clickable
    return (
      <span className="block my-3">
        <button
          onClick={() => onAssetClick?.(asset.id)}
          className="text-stone-700 underline underline-offset-2 hover:text-stone-900 transition-colors"
        >
          📎 {asset.name}
        </button>
      </span>
    );
  }

  // Render media inline based on type
  if (asset.type === 'image') {
    return (
      <span className="block my-3">
        <img
          src={asset.source.dataUrl}
          alt={asset.name}
          className="max-w-full rounded-lg border border-stone-200 cursor-pointer"
          onClick={() => onAssetClick?.(asset.id)}
          title="Click to view full size"
        />
      </span>
    );
  }

  if (asset.type === 'video') {
    return (
      <span className="block my-3">
        <video
          src={asset.source.dataUrl}
          controls
          className="max-w-full rounded-lg border border-stone-200"
        >
          Your browser does not support the video tag.
        </video>
        <p className="text-xs text-stone-500 mt-1">{asset.name}</p>
      </span>
    );
  }

  if (asset.type === 'audio') {
    return (
      <span className="block my-3 p-4 bg-stone-50 rounded-lg border border-stone-200">
        <p className="text-sm font-medium text-stone-700 mb-2">{asset.name}</p>
        <audio
          src={asset.source.dataUrl}
          controls
          className="w-full"
        >
          Your browser does not support the audio tag.
        </audio>
      </span>
    );
  }

  // For other types, show as clickable link
  return (
    <span className="block my-3">
      <button
        onClick={() => onAssetClick?.(asset.id)}
        className="text-stone-700 underline underline-offset-2 hover:text-stone-900 transition-colors"
      >
        📎 {asset.name}
      </button>
    </span>
  );
};
