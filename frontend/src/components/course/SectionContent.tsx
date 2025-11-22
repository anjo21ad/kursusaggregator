/**
 * SectionContent - Displays complete section content
 *
 * Combines all sub-components to render:
 * - Section metadata (title, description, learning objectives)
 * - Introduction
 * - Content blocks (paragraphs, headings, lists, callouts)
 * - Code examples with syntax highlighting
 * - Summary and key takeaways
 * - Interactive quiz
 */

import React from 'react';
import { ExtendedCourseSection } from './types';
import ContentBlockRenderer from './ContentBlockRenderer';
import CodeBlock from './CodeBlock';
import QuizPlayer from './QuizPlayer';

type Props = {
  section: ExtendedCourseSection;
  onQuizComplete: (score: number) => void;
};

export default function SectionContent({ section, onQuizComplete }: Props) {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-background
                      border border-text-muted/20 rounded-2xl p-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium
                           bg-secondary/20 text-secondary mb-3">
              Section {section.sectionNumber}
            </span>
            <h2 className="text-3xl font-bold text-text-light mb-3">
              {section.title}
            </h2>
            <p className="text-text-muted leading-relaxed">
              {section.description}
            </p>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center text-text-muted">
            <svg className="w-5 h-5 mr-2 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{section.estimatedMinutes} minutter</span>
          </div>
          <div className="flex items-center text-text-muted">
            <svg className="w-5 h-5 mr-2 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>{section.content.blocks.length} indholdsblokke</span>
          </div>
          <div className="flex items-center text-text-muted">
            <svg className="w-5 h-5 mr-2 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span>{section.content.codeExamples.length} kodeeksempler</span>
          </div>
        </div>

        {/* Learning Objectives */}
        {section.learningObjectives.length > 0 && (
          <div className="mt-6 bg-card rounded-xl p-4">
            <p className="text-text-light font-semibold mb-3 flex items-center">
              <span className="mr-2">🎯</span>
              Læringsmål
            </p>
            <ul className="space-y-2">
              {section.learningObjectives.map((objective, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="none"
                       viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-text-muted text-sm">{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Introduction */}
      {section.content.introduction && (
        <div className="bg-card rounded-xl p-6 shadow-lg border border-text-muted/10">
          <p className="text-text-muted leading-relaxed text-lg">
            {section.content.introduction}
          </p>
        </div>
      )}

      {/* Content Blocks */}
      <div className="bg-card rounded-xl p-8 shadow-lg">
        <h3 className="text-2xl font-bold text-text-light mb-6">Indhold</h3>
        <div className="space-y-4">
          {section.content.blocks.map((block, index) => (
            <ContentBlockRenderer key={index} block={block} />
          ))}
        </div>
      </div>

      {/* Code Examples */}
      {section.content.codeExamples.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-text-light mb-4 flex items-center">
            <span className="mr-2">💻</span>
            Kodeeksempler
          </h3>
          <div className="space-y-4">
            {section.content.codeExamples.map((example, index) => (
              <CodeBlock key={index} codeExample={example} />
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {section.content.summary && (
        <div className="bg-gradient-to-br from-secondary/10 to-background
                        border border-secondary/30 rounded-xl p-6">
          <h3 className="text-xl font-bold text-text-light mb-3 flex items-center">
            <span className="mr-2">📝</span>
            Opsummering
          </h3>
          <p className="text-text-muted leading-relaxed">
            {section.content.summary}
          </p>
        </div>
      )}

      {/* Key Takeaways */}
      {section.content.keyTakeaways.length > 0 && (
        <div className="bg-card rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-text-light mb-4 flex items-center">
            <span className="mr-2">✨</span>
            Nøglepunkter
          </h3>
          <ul className="space-y-3">
            {section.content.keyTakeaways.map((takeaway, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20
                                flex items-center justify-center mt-0.5">
                  <span className="text-primary text-xs font-bold">{index + 1}</span>
                </div>
                <span className="text-text-muted leading-relaxed">{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quiz */}
      {section.quiz && section.quiz.questions.length > 0 && (
        <div>
          <QuizPlayer
            key={section.sectionNumber}
            quiz={section.quiz}
            onComplete={onQuizComplete}
          />
        </div>
      )}
    </div>
  );
}
