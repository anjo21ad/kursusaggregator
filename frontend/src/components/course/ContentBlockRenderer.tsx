/**
 * ContentBlockRenderer - Renders different types of content blocks
 *
 * Supports 4 block types:
 * - paragraph: Standard text content
 * - heading: h3 or h4 headings
 * - list: Bullet point lists with sub-items
 * - callout: Colored boxes for info/warning/tip/example
 */

import React from 'react';
import { ContentBlock } from './types';

type Props = {
  block: ContentBlock;
};

export default function ContentBlockRenderer({ block }: Props) {
  // Paragraph block
  if (block.type === 'paragraph') {
    return (
      <p className="text-text-muted leading-relaxed mb-4">
        {block.content}
      </p>
    );
  }

  // Heading block
  if (block.type === 'heading') {
    const HeadingTag = block.heading === 'h4' ? 'h4' : 'h3';
    const headingClass = block.heading === 'h4'
      ? 'text-xl font-semibold text-text-light mt-6 mb-3'
      : 'text-2xl font-bold text-text-light mt-8 mb-4';

    return (
      <HeadingTag className={headingClass}>
        {block.content}
      </HeadingTag>
    );
  }

  // List block
  if (block.type === 'list') {
    return (
      <div className="mb-4">
        <p className="text-text-muted font-medium mb-2">{block.content}</p>
        {block.subItems && block.subItems.length > 0 && (
          <ul className="list-disc list-inside space-y-2 ml-4">
            {block.subItems.map((item, index) => (
              <li key={index} className="text-text-muted leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Callout block
  if (block.type === 'callout') {
    const calloutStyles = {
      info: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        icon: '💡',
        iconBg: 'bg-blue-500/20',
        title: 'Info',
        titleColor: 'text-blue-400'
      },
      warning: {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        icon: '⚠️',
        iconBg: 'bg-yellow-500/20',
        title: 'Vigtigt',
        titleColor: 'text-yellow-400'
      },
      tip: {
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        icon: '✨',
        iconBg: 'bg-green-500/20',
        title: 'Tip',
        titleColor: 'text-green-400'
      },
      example: {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        icon: '📝',
        iconBg: 'bg-purple-500/20',
        title: 'Eksempel',
        titleColor: 'text-purple-400'
      }
    };

    const style = calloutStyles[block.calloutType || 'info'];

    return (
      <div className={`${style.bg} border ${style.border} rounded-xl p-4 mb-4`}>
        <div className="flex items-start space-x-3">
          <div className={`${style.iconBg} rounded-lg p-2 flex-shrink-0`}>
            <span className="text-lg">{style.icon}</span>
          </div>
          <div className="flex-1">
            <p className={`font-semibold mb-1 ${style.titleColor}`}>
              {style.title}
            </p>
            <p className="text-text-muted text-sm leading-relaxed">
              {block.content}
            </p>
            {block.subItems && block.subItems.length > 0 && (
              <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
                {block.subItems.map((item, index) => (
                  <li key={index} className="text-text-muted text-sm">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback for unknown types
  return null;
}
