'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface FeedbackPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type FeedbackType = 'bug' | 'feature' | 'general';

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  isOpen,
  onClose
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  useEffect(() => {
    if (!isOpen) {
      // Reset state when panel closes
      setTimeout(() => {
        setFeedbackType('general');
        setMessage('');
        setIsSubmitted(false);
      }, 200);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!message.trim()) return;

    // Log feedback to console (no persistence yet)
    console.log('Feedback submitted:', {
      type: feedbackType,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      appVersion: '1.0.0'
    });

    setIsSubmitted(true);

    // Close panel after brief delay
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div 
        ref={panelRef}
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <div>
            <h2 className="text-lg font-medium text-stone-700">Feedback</h2>
            <p className="text-xs text-stone-500 mt-0.5">Help improve Pulm</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-100 rounded-lg"
          >
            <X size={18} className="text-stone-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isSubmitted ? (
            <div className="py-8 text-center">
              <p className="text-sm text-stone-600">Thank you for your feedback</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">
                  Feedback Type
                </label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-300"
                >
                  <option value="general">General Feedback</option>
                  <option value="bug">Bug</option>
                  <option value="feature">Feature Request</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your thoughts, issues, or ideas…"
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-300 resize-none min-h-[120px]"
                />
              </div>

              <div className="pt-2 space-y-1">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>App version</span>
                  <span className="text-stone-400">1.0.0</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={!message.trim()}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-stone-700 rounded-lg hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
