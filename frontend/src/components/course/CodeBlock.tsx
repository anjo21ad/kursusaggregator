/**
 * CodeBlock - Displays code examples with syntax highlighting
 *
 * Features:
 * - Syntax highlighting via react-syntax-highlighter
 * - Copy to clipboard button
 * - Support for multiple programming languages
 * - Dark theme matching CourseHub design
 */

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { CodeExample } from './types';

type Props = {
  codeExample: CodeExample;
};

export default function CodeBlock({ codeExample }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeExample.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-text-muted/20 overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-background border-b border-text-muted/20">
        <div>
          <h4 className="text-lg font-semibold text-text-light mb-1">
            {codeExample.title}
          </h4>
          {codeExample.description && (
            <p className="text-sm text-text-muted">
              {codeExample.description}
            </p>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-2 px-3 py-2 bg-primary/10 hover:bg-primary/20
                     text-primary rounded-lg transition-colors text-sm font-medium"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Kopieret!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Kopiér</span>
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <div className="relative">
        <SyntaxHighlighter
          language={codeExample.language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1.5rem',
            background: '#0F0F1A',
            fontSize: '14px',
            lineHeight: '1.6'
          }}
          showLineNumbers
        >
          {codeExample.code}
        </SyntaxHighlighter>
      </div>

      {/* Explanation */}
      {codeExample.explanation && (
        <div className="px-4 py-3 bg-background/50 border-t border-text-muted/20">
          <p className="text-sm font-medium text-text-light mb-1">Forklaring:</p>
          <p className="text-sm text-text-muted leading-relaxed">
            {codeExample.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
