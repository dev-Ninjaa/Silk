'use client';

import React from 'react';

interface TopBarProps {
  categoryName?: string;
  noteName?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ categoryName, noteName }) => {
  return (
    <div className="h-12 border-b border-stone-200 bg-white flex items-center px-6">
      <div className="flex items-center gap-2 text-sm text-stone-600">
        {categoryName && (
          <span className="text-stone-900 font-medium">{categoryName}</span>
        )}
        {noteName && categoryName && (
          <>
            <span className="text-stone-400">/</span>
            <span className="text-stone-600">{noteName}</span>
          </>
        )}
      </div>
    </div>
  );
};
