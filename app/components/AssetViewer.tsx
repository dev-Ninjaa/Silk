'use client';

import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Download } from 'lucide-react';
import { Asset } from '@/app/types';

interface AssetViewerProps {
  asset: Asset | null;
  onClose: () => void;
}

export const AssetViewer: React.FC<AssetViewerProps> = ({ asset, onClose }) => {
  const [openInNewTab, setOpenInNewTab] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (asset) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [asset, onClose]);

  if (!asset) return null;

  const handleDownload = () => {
    if (asset.source.kind === 'file') {
      const link = document.createElement('a');
      link.href = asset.source.dataUrl;
      link.download = asset.name;
      link.click();
    }
  };

  const handleOpenExternal = () => {
    if (asset.source.kind === 'link') {
      window.open(asset.source.url, '_blank', 'noopener,noreferrer');
    }
  };

  const renderContent = () => {
    if (asset.source.kind === 'link') {
      if (openInNewTab) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-stone-600">
            <ExternalLink size={48} className="mb-4 text-stone-400" />
            <p className="text-lg mb-2">{asset.name}</p>
            <a
              href={asset.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-stone-500 hover:text-stone-700 underline"
            >
              {asset.source.url}
            </a>
          </div>
        );
      }

      return (
        <iframe
          src={asset.source.url}
          className="w-full h-full border-0"
          title={asset.name}
          sandbox="allow-scripts allow-same-origin"
        />
      );
    }

    // File-based assets
    switch (asset.type) {
      case 'pdf':
        return (
          <div className="w-full h-full bg-stone-50">
            <embed
              src={asset.source.dataUrl}
              type="application/pdf"
              className="w-full h-full"
            />
          </div>
        );

      case 'image':
        return (
          <div className="flex items-center justify-center h-full p-8 bg-stone-50">
            <img
              src={asset.source.dataUrl}
              alt={asset.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        );

      case 'markdown':
      case 'text':
        return <MarkdownTextViewer dataUrl={asset.source.dataUrl} type={asset.type} />;

      case 'docx':
        return (
          <div className="flex flex-col items-center justify-center h-full text-stone-600 p-8">
            <Download size={48} className="mb-4 text-stone-400" />
            <p className="text-lg mb-2">{asset.name}</p>
            <p className="text-sm text-stone-500 mb-4">DOCX preview not available</p>
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-sm font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors"
            >
              Download File
            </button>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-stone-600">
            <p>Preview not available</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-stone-900 truncate">{asset.name}</h2>
            <p className="text-xs text-stone-500 uppercase tracking-wide">{asset.type}</p>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            {asset.source.kind === 'file' && (
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                title="Download"
              >
                <Download size={18} className="text-stone-600" />
              </button>
            )}
            
            {asset.source.kind === 'link' && (
              <>
                <button
                  onClick={() => setOpenInNewTab(!openInNewTab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    openInNewTab
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {openInNewTab ? 'Embed' : 'External'}
                </button>
                <button
                  onClick={handleOpenExternal}
                  className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink size={18} className="text-stone-600" />
                </button>
              </>
            )}
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <X size={18} className="text-stone-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const MarkdownTextViewer: React.FC<{ dataUrl: string; type: 'markdown' | 'text' }> = ({ dataUrl, type }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Extract base64 content from data URL
    try {
      const base64Content = dataUrl.split(',')[1];
      if (base64Content) {
        const decodedContent = atob(base64Content);
        setContent(decodedContent);
      } else {
        setContent('Error: Invalid file format');
      }
    } catch (error) {
      console.error('Error decoding file:', error);
      setContent('Error loading content');
    } finally {
      setLoading(false);
    }
  }, [dataUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-stone-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-8 bg-stone-50">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <pre className="whitespace-pre-wrap font-mono text-sm text-stone-700 leading-relaxed">
          {content}
        </pre>
      </div>
    </div>
  );
};
