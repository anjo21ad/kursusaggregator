// Main AI Chat component with state management and SSE handling
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Message } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { CourseRecommendations } from './CourseRecommendations';
import { LoadingDots } from './LoadingDots';
import { AIResponse } from '@/lib/ai/prompts';
import { supabase } from '@/lib/supabaseClient';

interface AIChatProps {
  initialMessage?: string;
}

export const AIChat: React.FC<AIChatProps> = ({ initialMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<AIResponse | null>(null);
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [interactionId, setInteractionId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle initial message
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      handleSendMessage(initialMessage);
    }
  }, [initialMessage]);

  const handleSendMessage = async (messageText: string) => {
    // Get auth session first
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      console.error('AI Chat: No session found - user not logged in');
      alert('Du skal være logget ind for at bruge AI chatten.');
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setCurrentResponse(null);

    try {

      console.log('AI Chat: Sending request with Authorization header');

      // Call streaming API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          query: messageText,
          sessionId,
          userId: session.user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      // Handle SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (!reader) {
        throw new Error('No response stream');
      }

      // Don't show raw JSON - only show loading indicator then structured response
      let rawJsonContent = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'chunk') {
              // Accumulate raw JSON but don't display it
              rawJsonContent += data.text;
            } else if (data.type === 'complete') {
              // Stream complete, show only structured response (not raw JSON)
              setCurrentResponse(data.response);
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          }
        }
      }

      setIsLoading(false);

    } catch (error) {
      console.error('Chat error:', error);

      // Add error message
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Beklager, der opstod en fejl. Prøv venligst igen.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleCourseSelect = async (courseId: number) => {
    // Track course click for feedback
    if (interactionId) {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        await fetch('/api/ai/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            interactionId,
            feedbackType: 'click',
            courseId,
          }),
        });
      } catch (error) {
        console.error('Failed to track course click:', error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-4 space-y-4">
        {/* Welcome message */}
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-white text-2xl font-bold mb-2">
              Hej! Jeg er din AI kursus-assistent
            </h2>
            <p className="text-white/60 mb-6">
              Fortæl mig hvad du søger, og jeg finder de perfekte kurser til dig
            </p>

            {/* Suggestion chips */}
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
              {[
                'Jeg søger ledelseskurser',
                'Vi har brug for sales training',
                'Vis mig excel kurser',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSendMessage(suggestion)}
                  className="px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white text-sm hover:bg-white/20 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Loading indicator */}
        {isLoading && !messages.some((m) => m.isStreaming) && <LoadingDots />}

        {/* Course recommendations */}
        {currentResponse && (
          <CourseRecommendations
            response={currentResponse}
            interactionId={interactionId || undefined}
            onCourseSelect={handleCourseSelect}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2">
        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading}
          placeholder={
            isLoading
              ? 'Venter på svar...'
              : 'Hvad kan jeg hjælpe dig med?'
          }
        />
      </div>
    </div>
  );
};
