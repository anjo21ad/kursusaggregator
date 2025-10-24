// Chat message component - displays user and AI messages
import React from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex w-full mb-4 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-6 py-4 ${
          isUser
            ? 'bg-gradient-to-r from-[#FF6A3D] to-[#FF8A3D] text-white'
            : 'bg-white/10 backdrop-blur-lg border border-white/20 text-white'
        }`}
        style={{
          boxShadow: isUser
            ? '0 4px 20px rgba(255, 106, 61, 0.3)'
            : '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Message content */}
        <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>

        {/* Streaming indicator */}
        {message.isStreaming && (
          <div className="flex items-center mt-2 space-x-1">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-75" />
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-150" />
          </div>
        )}

        {/* Timestamp */}
        <div
          className={`text-xs mt-2 ${
            isUser ? 'text-white/70' : 'text-white/50'
          }`}
        >
          {message.timestamp.toLocaleTimeString('da-DK', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
};
