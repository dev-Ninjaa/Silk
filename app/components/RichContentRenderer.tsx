'use client';

import React, { useState } from 'react';
import { parseRichContent, ContentToken } from '@/app/lib/richContentParser';
import { ExternalLink } from 'lucide-react';
import { Asset } from '@/app/types';
import { openExternal } from '@/app/lib/openExternal';

interface RichContentRendererProps {
  content: string;
  onAssetClick?: (assetId: string) => void;
  assets?: Asset[]; // Pass assets to render inline
  marks?: Array<any>;
  links?: Array<any>;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
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
  assets = [],
  marks,
  links,
  textAlign,
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

  // If marks or links are provided, render using the structured metadata so we
  // preserve styling and link hrefs exactly as stored in blocks.
  if (marks || links) {
    // Build breakpoints
    const breaks = new Set<number>();
    breaks.add(0);
    breaks.add(content.length);
    (marks || []).forEach((m: any) => { breaks.add(m.start); breaks.add(m.end); });
    (links || []).forEach((l: any) => { breaks.add(l.start); breaks.add(l.end); });
    const points = Array.from(breaks).sort((a, b) => a - b);

    const segments: React.ReactNode[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      if (start === end) continue;
      const slice = content.slice(start, end);

      // Determine marks that cover this range
      const activeMarks = (marks || []).filter((m: any) => m.start <= start && m.end >= end);
      const link = (links || []).find((l: any) => l.start <= start && l.end >= end);

      let node: React.ReactNode = <span>{slice}</span>;

      // Wrap with mark styles
      if (activeMarks.length > 0) {
        let inner: React.ReactNode = slice;
        activeMarks.forEach((m: any) => {
          switch (m.type) {
            case 'bold':
              inner = <strong>{inner}</strong>;
              break;
            case 'italic':
              inner = <em>{inner}</em>;
              break;
            case 'underline':
              inner = <u>{inner}</u>;
              break;
            case 'strike':
              inner = <s>{inner}</s>;
              break;
            case 'code':
              inner = <code className="font-mono bg-stone-50 px-1 rounded">{inner}</code>;
              break;
            case 'highlight':
              inner = <mark className="bg-yellow-200">{inner}</mark>;
              break;
            case 'color':
              inner = <span style={{ color: m.attrs?.color }}>{inner}</span>;
              break;
            default:
              break;
          }
        });
        node = <span>{inner}</span>;
      }

      if (link) {
        node = (
          <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {node}
          </a>
        );
      }

      segments.push(node);
    }

    const alignClass = textAlign === 'center' ? 'text-center' : textAlign === 'right' ? 'text-right' : textAlign === 'justify' ? 'text-justify' : 'text-left';

    return (
      <span className={`${alignClass} inline`}>{segments}</span>
    );
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
          className="cursor-pointer text-stone-700 underline underline-offset-2 hover:text-stone-900 transition-colors inline-flex items-center gap-1"
        >
          {token.text}
        </a>
      );
    }

    // External link
    return (
      <a
        href={token.url}
        onClick={(e) => {
          e.preventDefault();
          openExternal(token.url);
        }}
        className="cursor-pointer text-stone-700 underline underline-offset-2 hover:text-stone-900 transition-colors inline-flex items-center gap-1"
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
          onClick={(e) => {
            e.preventDefault();
            openExternal(token.url);
          }}
          className="cursor-pointer text-stone-700 underline underline-offset-2 hover:text-stone-900 transition-colors inline-flex items-center gap-1"
        >
          {token.url}
          <ExternalLink size={12} className="opacity-60" />
        </a>
      );
    }

    return (
      <span className="block my-2 md:my-3">
        <img
          src={token.url}
          alt="Embedded image"
          loading="lazy"
          onError={() => setImageError(true)}
          className="w-full max-w-xs md:max-w-md lg:max-w-lg h-auto rounded-lg border border-stone-200"
        />
      </span>
    );
  }

  if (token.type === 'video') {
    const embedUrl = token.platform === 'youtube'
      ? `https://www.youtube.com/embed/${token.videoId}`
      : `https://player.vimeo.com/video/${token.videoId}`;

    return (
      <span className="block my-2 md:my-3">
        {!videoLoaded && (
          <button
            onClick={() => setVideoLoaded(true)}
            className="w-full aspect-video rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-colors flex items-center justify-center text-xs md:text-sm text-stone-600"
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
