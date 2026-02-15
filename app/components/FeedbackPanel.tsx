'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Upload } from 'lucide-react';

interface FeedbackPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const FEEDBACK_API = 'https://plumnotesfeedback.vercel.app/api/feedback';
const MIN_MESSAGE_LENGTH = 10;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  isOpen,
  onClose
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charCount = message.length;
  const isMessageValid = message.trim().length >= MIN_MESSAGE_LENGTH && message.trim().length <= MAX_MESSAGE_LENGTH;
  const isFormValid = rating > 0 && isMessageValid && !isSubmitting;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (!isOpen) return;
      
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleImageFile(file);
            e.preventDefault();
          }
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('paste', handlePaste);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('paste', handlePaste);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setMessage('');
        setRating(0);
        setHoveredRating(0);
        setImageBase64(null);
        setImagePreview(null);
        setIsSubmitted(false);
        setError(null);
        setIsSubmitting(false);
      }, 200);
    }
  }, [isOpen]);

  const handleImageFile = (file: File) => {
    if (!file.type.match(/^image\/(png|jpeg|jpg|gif|webp)$/)) {
      setError('Please upload a valid image (PNG, JPEG, GIF, or WebP)');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError('Image size must be less than 20MB');
      return;
    }

    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageBase64(result);
      setImagePreview(result);
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const removeImage = () => {
    setImageBase64(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: {
        rating: number;
        message: string;
        imageBase64?: string;
      } = {
        rating,
        message: message.trim()
      };

      if (imageBase64) {
        payload.imageBase64 = imageBase64;
      }

      const res = await fetch(FEEDBACK_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error('You can only submit feedback once per hour');
        } else if (res.status === 400) {
          const details = data?.details 
            ? Object.values(data.details).join(', ')
            : 'Invalid input';
          throw new Error(details);
        } else {
          throw new Error(data?.error || 'Failed to send feedback');
        }
      }

      setIsSubmitted(true);

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Feedback submission error:', err);
      setError(err.message || 'Could not send feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-[32px] shadow-2xl w-full max-w-[520px] p-10 max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-7 right-7 p-2 bg-slate-500/70 hover:bg-slate-600/80 rounded-full transition-all duration-200"
          aria-label="Close"
        >
          <X size={18} className="text-white" />
        </button>

        {isSubmitted ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Thank you!
            </h2>
            <p className="text-slate-500">
              We appreciate your feedback.
            </p>
          </div>
        ) : (
          <div className="space-y-7">
            {/* Header */}
            <div className="text-center space-y-3 pr-8">
              <h2 className="text-[28px] font-bold text-slate-800 leading-tight">
                We appreciate your feedback.
              </h2>
              <p className="text-slate-500 text-[15px] leading-relaxed">
                We are always looking for ways to improve your experience.
                Please take a moment to evaluate and tell us what you think.
              </p>
            </div>

            {/* Star Rating */}
            <div className="flex justify-center gap-3 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-all duration-200 hover:scale-110 focus:outline-none"
                  aria-label={`Rate ${star} stars`}
                >
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill={star <= (hoveredRating || rating) ? '#64748b' : 'none'}
                    stroke="#64748b"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-200"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              ))}
            </div>

            {/* Message Textarea */}
            <div className="space-y-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What can we do to improve your experience? (Emojis welcome! 🎉)"
                className="w-full px-5 py-4 text-slate-700 text-[15px] placeholder-slate-400 bg-white/80 rounded-[20px] border-0 focus:outline-none focus:ring-2 focus:ring-slate-300/50 resize-none min-h-[130px] shadow-sm transition-all duration-200"
                maxLength={MAX_MESSAGE_LENGTH}
              />
              <div className="px-1">
                <span className={`text-xs transition-colors duration-200 ${
                  message.trim().length < MIN_MESSAGE_LENGTH 
                    ? 'text-slate-400' 
                    : 'text-slate-500'
                }`}>
                  {message.trim().length < MIN_MESSAGE_LENGTH 
                    ? `${MIN_MESSAGE_LENGTH - message.trim().length} more characters needed`
                    : `${message.trim().length} / ${MAX_MESSAGE_LENGTH}`
                  }
                </span>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-600 block">
                Screenshot (Optional)
              </label>
              
              {imagePreview ? (
                <div className="relative bg-white/60 rounded-[20px] p-3 border border-slate-200/50">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-auto rounded-[14px] max-h-40 object-contain"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-5 right-5 p-1.5 bg-slate-600 hover:bg-slate-700 rounded-full transition-colors duration-200"
                    aria-label="Remove image"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full px-5 py-8 bg-white/60 rounded-[20px] border-2 border-dashed border-slate-300/60 hover:border-slate-400/60 hover:bg-white/80 cursor-pointer transition-all duration-200"
                  >
                    <Upload size={28} className="text-slate-400 mb-2" />
                    <span className="text-sm text-slate-600 font-medium">
                      Click to upload or paste image
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      PNG, JPEG, GIF, WebP (max 20MB)
                    </span>
                  </label>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50/80 rounded-[16px] px-4 py-3">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="w-full px-6 py-4 text-[15px] font-semibold text-white bg-slate-600 rounded-[20px] hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isSubmitting ? 'Sending…' : 'Submit My Feedback'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
