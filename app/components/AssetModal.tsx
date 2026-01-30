'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Link as LinkIcon } from 'lucide-react';
import { AssetType } from '@/app/types';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, type: AssetType, source: { kind: 'file'; dataUrl: string } | { kind: 'link'; url: string }) => void;
  categoryName: string;
  subCategoryName?: string;
}

export const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categoryName,
  subCategoryName
}) => {
  const [mode, setMode] = useState<'file' | 'link'>('file');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dataUrl, setDataUrl] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMode('file');
      setName('');
      setUrl('');
      setSelectedFile(null);
      setDataUrl('');
      setTimeout(() => {
        if (mode === 'file') {
          fileInputRef.current?.focus();
        } else {
          inputRef.current?.focus();
        }
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const getAssetType = (file: File): AssetType => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'docx' || ext === 'doc') return 'docx';
    if (ext === 'md' || ext === 'markdown') return 'markdown';
    if (ext === 'txt') return 'text';
    if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext || '')) return 'image';
    return 'text';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 20MB to avoid quota issues)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      alert('File size exceeds 20MB limit. Please choose a smaller file.');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    setName(file.name);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      setDataUrl(reader.result as string);
    };
    reader.onerror = () => {
      alert('Failed to read file. Please try again.');
      setSelectedFile(null);
      setDataUrl('');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (mode === 'file' && selectedFile && dataUrl) {
      const type = getAssetType(selectedFile);
      onSave(name.trim() || selectedFile.name, type, { kind: 'file', dataUrl });
      onClose();
    } else if (mode === 'link' && url.trim()) {
      onSave(name.trim() || url, 'link', { kind: 'link', url: url.trim() });
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  const canSave = mode === 'file' ? (selectedFile && dataUrl) : url.trim();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-stone-900">Add Asset</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X size={18} className="text-stone-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="text-sm text-stone-600">
            Adding to: <span className="font-medium text-stone-900">{categoryName}</span>
            {subCategoryName && <span> / {subCategoryName}</span>}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setMode('file')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                mode === 'file'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Upload size={16} className="inline mr-2" />
              File
            </button>
            <button
              onClick={() => setMode('link')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                mode === 'link'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <LinkIcon size={16} className="inline mr-2" />
              Link
            </button>
          </div>

          {mode === 'file' && (
            <>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Select File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.doc,.md,.markdown,.txt,.png,.jpg,.jpeg,.webp,.gif"
                  className="w-full text-sm text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer"
                />
                <p className="mt-2 text-xs text-stone-500">
                  Supported: PDF, DOCX, Markdown, Text, Images (Max 20MB)
                </p>
              </div>

              {selectedFile && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Asset Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Asset name"
                    className="w-full px-4 py-3 text-base border border-stone-300 rounded-lg outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200 transition-all"
                  />
                </div>
              )}
            </>
          )}

          {mode === 'link' && (
            <>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  URL
                </label>
                <input
                  ref={inputRef}
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 text-base border border-stone-300 rounded-lg outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Leave empty to use URL"
                  className="w-full px-4 py-3 text-base border border-stone-300 rounded-lg outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200 transition-all"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 px-6 py-4 bg-stone-50 border-t border-stone-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add Asset
          </button>
        </div>
      </div>
    </div>
  );
};
