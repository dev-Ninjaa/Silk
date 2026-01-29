'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notesCount: number;
  categoriesCount: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  notesCount,
  categoriesCount
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div 
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h2 className="text-lg font-semibold text-stone-900">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X size={18} className="text-stone-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <section>
            <h3 className="text-sm font-semibold text-stone-900 mb-4 uppercase tracking-wide">
              General
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium text-stone-900">Dark mode</div>
                  <div className="text-xs text-stone-500 mt-0.5">Great for reading at night</div>
                </div>
                <button
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-stone-300 transition-colors hover:bg-stone-400"
                  disabled
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                </button>
              </div>

              <div className="py-3 border-t border-stone-100">
                <div className="text-xs text-stone-600 leading-relaxed">
                  <span className="font-medium text-stone-900">Local-only, no cloud, no login.</span>
                  <br />
                  Your notes are stored securely in your browser. Nothing leaves your device.
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-stone-900 mb-4 uppercase tracking-wide">
              Data
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-stone-600">Notes</span>
                <span className="text-sm font-medium text-stone-900">{notesCount}</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-stone-600">Categories</span>
                <span className="text-sm font-medium text-stone-900">{categoriesCount}</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-stone-600">Storage location</span>
                <span className="text-xs text-stone-500">Browser local storage</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-stone-900 mb-4 uppercase tracking-wide">
              About
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-stone-900 mb-1">Pulm Notes</div>
                <div className="text-xs text-stone-500">Version 1.0.0</div>
              </div>
              
              <div className="text-xs text-stone-600 leading-relaxed pt-2 border-t border-stone-100">
                A calm, local-first notes app designed for clarity and focus. 
                Built for people who value ownership, privacy, and simplicity over features.
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
