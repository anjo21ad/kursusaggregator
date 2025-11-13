/**
 * CoursePlayer - Main course player container component
 *
 * Features:
 * - Section navigation (prev/next buttons)
 * - Progress tracking (completed sections, quiz scores)
 * - Progress bar visualization
 * - State management for current section
 * - Completion detection
 */

import React, { useState, useEffect } from 'react';
import { ExtendedCourseCurriculum } from './types';
import SectionContent from './SectionContent';

type Props = {
  curriculum: ExtendedCourseCurriculum;
  courseId: number;
};

export default function CoursePlayer({ curriculum, courseId }: Props) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [quizScores, setQuizScores] = useState<Record<number, number>>({});
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  const currentSection = curriculum.sections[currentSectionIndex];
  const totalSections = curriculum.sections.length;
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === totalSections - 1;
  const progressPercentage = Math.round((completedSections.length / totalSections) * 100);
  const allSectionsCompleted = completedSections.length === totalSections;

  // Reset quiz completion status when changing sections
  useEffect(() => {
    setIsQuizCompleted(completedSections.includes(currentSectionIndex));
  }, [currentSectionIndex, completedSections]);

  const handleQuizComplete = (score: number) => {
    setQuizScores(prev => ({
      ...prev,
      [currentSectionIndex]: score
    }));
    setIsQuizCompleted(true);

    // Mark section as completed
    if (!completedSections.includes(currentSectionIndex)) {
      setCompletedSections(prev => [...prev, currentSectionIndex]);
    }
  };

  const handleNext = () => {
    if (!isLastSection) {
      setCurrentSectionIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (!isFirstSection) {
      setCurrentSectionIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleJumpToSection = (sectionIndex: number) => {
    setCurrentSectionIndex(sectionIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-text-light">
            Kursusforløb
          </h3>
          <span className="text-sm text-text-muted">
            {completedSections.length} af {totalSections} sections gennemført
          </span>
        </div>
        <div className="h-3 bg-card rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        {allSectionsCompleted && (
          <div className="mt-4 bg-success/10 border border-success/30 rounded-xl p-4 flex items-center space-x-3">
            <span className="text-3xl">🎉</span>
            <div>
              <p className="text-success font-semibold">Tillykke! Kurset er gennemført!</p>
              <p className="text-text-muted text-sm mt-1">
                Du har gennemført alle {totalSections} sections med en gennemsnitlig score på {
                  Math.round(Object.values(quizScores).reduce((a, b) => a + b, 0) / Object.values(quizScores).length)
                }%.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Section Navigator */}
      <div className="mb-6 bg-card rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-muted text-sm">Section {currentSectionIndex + 1} af {totalSections}</p>
            <h2 className="text-xl font-bold text-text-light">{currentSection.title}</h2>
          </div>
          <div className="flex space-x-2">
            {curriculum.sections.map((section, index) => (
              <button
                key={index}
                onClick={() => handleJumpToSection(index)}
                className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                  index === currentSectionIndex
                    ? 'bg-primary text-white'
                    : completedSections.includes(index)
                    ? 'bg-success/20 text-success'
                    : 'bg-background text-text-muted hover:bg-background/80'
                }`}
                title={section.title}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Section Content */}
      <SectionContent
        section={currentSection}
        onQuizComplete={handleQuizComplete}
      />

      {/* Navigation Buttons */}
      <div className="mt-8 flex items-center justify-between bg-card rounded-xl p-6 shadow-lg">
        <button
          onClick={handlePrevious}
          disabled={isFirstSection}
          className="flex items-center space-x-2 px-6 py-3 bg-background rounded-xl
                     text-text-light hover:bg-background/80 transition-colors font-semibold
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Forrige</span>
        </button>

        <div className="text-center">
          {isQuizCompleted ? (
            <div className="flex items-center space-x-2 text-success">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold">Section gennemført</span>
            </div>
          ) : (
            <p className="text-text-muted text-sm">Gennemfør quizzen for at fortsætte</p>
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={isLastSection || !isQuizCompleted}
          className="flex items-center space-x-2 px-6 py-3 bg-primary rounded-xl
                     text-white hover:bg-primary-dark transition-colors font-semibold
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isLastSection ? 'Afslut' : 'Næste'}</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Course Info Footer */}
      <div className="mt-6 text-center text-text-muted text-sm">
        <p>
          🤖 Dette kursus er genereret af AI · Estimeret tid: {curriculum.estimatedDuration} minutter · Niveau: {curriculum.level}
        </p>
      </div>
    </div>
  );
}
