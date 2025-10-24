// Chat input component with send button
import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Hvad kan jeg hjælpe dig med?',
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || disabled) return;

    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full"
    >
      <div
        className="flex items-end gap-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4"
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-white placeholder-white/50 resize-none outline-none max-h-32"
          style={{
            minHeight: '24px',
          }}
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className={`flex-shrink-0 p-3 rounded-xl transition-all ${
            disabled || !input.trim()
              ? 'bg-white/10 text-white/30 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#FF6A3D] to-[#FF8A3D] text-white hover:scale-105 active:scale-95'
          }`}
          style={{
            boxShadow:
              disabled || !input.trim()
                ? 'none'
                : '0 4px 20px rgba(255, 106, 61, 0.4)',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>

      {/* Helper text */}
      <p className="text-white/40 text-xs mt-2 ml-1">
        Tryk Enter for at sende, Shift+Enter for ny linje
      </p>
    </form>
  );
};
