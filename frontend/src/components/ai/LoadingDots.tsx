// Loading indicator for AI thinking
import React from 'react';

export const LoadingDots: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-2 py-8">
      <div
        className="w-3 h-3 bg-[#FF6A3D] rounded-full animate-bounce"
        style={{ animationDelay: '0ms' }}
      />
      <div
        className="w-3 h-3 bg-[#7E6BF1] rounded-full animate-bounce"
        style={{ animationDelay: '150ms' }}
      />
      <div
        className="w-3 h-3 bg-[#FF6A3D] rounded-full animate-bounce"
        style={{ animationDelay: '300ms' }}
      />
    </div>
  );
};
