/**
 * CoursePlayer Component
 *
 * Displays AI-generated course content with:
 * - Section navigation
 * - Rich text content (paragraphs, headings, lists, callouts)
 * - Code examples with syntax highlighting
 * - Interactive quizzes
 * - Progress tracking
 *
 * Supports extended curriculum format from n8n content generation
 */

import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

// ============================================================================
// TYPES (matching n8n content generation output)
// ============================================================================

type ContentBlock = {
  type: 'paragraph' | 'heading' | 'list' | 'callout' | 'quote';
  content: string;
  subItems?: string[];
  calloutType?: 'info' | 'warning' | 'tip' | 'example';
  heading?: 'h3' | 'h4';
};

type CodeExample = {
  title: string;
  description: string;
  language: string;
  code: string;
  explanation: string;
  highlightedLines?: number[];
};

type QuizQuestion = {
  questionNumber: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
};

type Quiz = {
  questions: QuizQuestion[];
};

type ExtendedCourseSection = {
  sectionNumber: number;
  title: string;
  description: string;
  learningObjectives: string[];
  estimatedMinutes: number;
  topics: string[];

  // Generated content
  content?: {
    introduction: string;
    blocks: ContentBlock[];
    summary: string;
    keyTakeaways: string[];
  };

  codeExamples?: CodeExample[];
  quiz?: Quiz;
};

type ExtendedCourseCurriculum = {
  courseTitle: string;
  courseDescription: string;
  estimatedDuration: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  sections: ExtendedCourseSection[];
  metadata?: {
    totalSections: number;
    totalQuizQuestions: number;
    generatedAt: string;
  };
};

type CoursePlayerProps = {
  curriculum: ExtendedCourseCurriculum;
  courseId: number;
  onProgressUpdate?: (sectionNumber: number, completed: boolean, quizScore?: number) => void;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CoursePlayer({ curriculum, courseId, onProgressUpdate }: CoursePlayerProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number | null>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  const currentSection = curriculum.sections[currentSectionIndex];
  const hasContent = currentSection?.content;
  const hasQuiz = currentSection?.quiz;

  // Navigate to section
  const goToSection = (index: number) => {
    setCurrentSectionIndex(index);
    setShowQuizResults(false);
    setQuizAnswers({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mark section as complete
  const markSectionComplete = () => {
    const newCompleted = new Set(completedSections);
    newCompleted.add(currentSection.sectionNumber);
    setCompletedSections(newCompleted);

    if (onProgressUpdate) {
      onProgressUpdate(currentSection.sectionNumber, true);
    }
  };

  // Calculate quiz score
  const calculateQuizScore = (): number => {
    if (!hasQuiz) return 0;

    const questions = currentSection.quiz.questions;
    const correctCount = questions.reduce((count, q) => {
      return quizAnswers[q.questionNumber] === q.correctAnswerIndex ? count + 1 : count;
    }, 0);

    return Math.round((correctCount / questions.length) * 100);
  };

  // Submit quiz
  const submitQuiz = () => {
    if (!hasQuiz) return;

    const score = calculateQuizScore();
    setShowQuizResults(true);

    // Mark complete if score >= 70%
    if (score >= 70) {
      markSectionComplete();
    }

    if (onProgressUpdate) {
      onProgressUpdate(currentSection.sectionNumber, score >= 70, score);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* LEFT SIDEBAR: Section Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-6 shadow-lg sticky top-24">
              <h2 className="text-lg font-bold text-text-light mb-4">Indhold</h2>

              <div className="space-y-2">
                {curriculum.sections.map((section, index) => {
                  const isActive = index === currentSectionIndex;
                  const isCompleted = completedSections.has(section.sectionNumber);

                  return (
                    <button
                      key={section.sectionNumber}
                      onClick={() => goToSection(index)}
                      className={`
                        w-full text-left px-4 py-3 rounded-xl transition-all
                        ${isActive
                          ? 'bg-primary text-white font-semibold'
                          : isCompleted
                          ? 'bg-success/10 text-success hover:bg-success/20'
                          : 'bg-card-light text-text-muted hover:bg-card-hover'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-xs mb-1 opacity-80">
                            {isCompleted && '✓ '}Section {section.sectionNumber}
                          </div>
                          <div className="text-sm line-clamp-2">{section.title}</div>
                          <div className="text-xs mt-1 opacity-70">
                            {section.estimatedMinutes} min
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Progress Summary */}
              <div className="mt-6 pt-6 border-t border-text-muted/20">
                <div className="text-sm text-text-muted mb-2">Fremskridt</div>
                <div className="w-full bg-card-light rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${(completedSections.size / curriculum.sections.length) * 100}%`
                    }}
                  />
                </div>
                <div className="text-xs text-text-muted mt-2">
                  {completedSections.size} af {curriculum.sections.length} sektioner gennemført
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT: Section Content */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-2xl p-8 shadow-lg">
              {/* Section Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-semibold text-primary">
                    Section {currentSection.sectionNumber} af {curriculum.sections.length}
                  </span>
                  <span className="text-sm text-text-muted">
                    {currentSection.estimatedMinutes} minutter
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-text-light mb-3">
                  {currentSection.title}
                </h1>
                <p className="text-text-muted">{currentSection.description}</p>
              </div>

              {/* Learning Objectives */}
              <div className="mb-8 p-6 bg-secondary/10 border border-secondary/20 rounded-xl">
                <h3 className="text-lg font-semibold text-text-light mb-3">
                  📚 Læringsmål
                </h3>
                <ul className="space-y-2">
                  {currentSection.learningObjectives.map((objective, i) => (
                    <li key={i} className="flex items-start gap-3 text-text-muted">
                      <span className="text-secondary mt-1">→</span>
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Main Content */}
              {hasContent ? (
                <div className="space-y-8">
                  {/* Introduction */}
                  {currentSection.content.introduction && (
                    <div>
                      <p className="text-text-muted leading-relaxed text-lg">
                        {currentSection.content.introduction}
                      </p>
                    </div>
                  )}

                  {/* Content Blocks */}
                  {currentSection.content.blocks.map((block, i) => (
                    <ContentBlockRenderer key={i} block={block} />
                  ))}

                  {/* Code Examples */}
                  {currentSection.codeExamples && currentSection.codeExamples.length > 0 && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-text-light mt-8 mb-4">
                        💻 Kodeeksempler
                      </h3>
                      {currentSection.codeExamples.map((example, i) => (
                        <CodeExampleRenderer key={i} example={example} />
                      ))}
                    </div>
                  )}

                  {/* Summary */}
                  {currentSection.content.summary && (
                    <div className="mt-8 p-6 bg-primary/10 border border-primary/20 rounded-xl">
                      <h3 className="text-lg font-semibold text-text-light mb-3">
                        📝 Opsummering
                      </h3>
                      <p className="text-text-muted leading-relaxed">
                        {currentSection.content.summary}
                      </p>
                    </div>
                  )}

                  {/* Key Takeaways */}
                  {currentSection.content.keyTakeaways && currentSection.content.keyTakeaways.length > 0 && (
                    <div className="mt-6 p-6 bg-accent/10 border border-accent/20 rounded-xl">
                      <h3 className="text-lg font-semibold text-text-light mb-3">
                        ✨ Vigtigste pointer
                      </h3>
                      <ul className="space-y-2">
                        {currentSection.content.keyTakeaways.map((takeaway, i) => (
                          <li key={i} className="flex items-start gap-3 text-text-muted">
                            <span className="text-accent mt-1">•</span>
                            <span>{takeaway}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Quiz */}
                  {hasQuiz && (
                    <div className="mt-12 border-t border-text-muted/20 pt-12">
                      <QuizRenderer
                        quiz={currentSection.quiz}
                        answers={quizAnswers}
                        showResults={showQuizResults}
                        onAnswerChange={(questionNumber, answerIndex) => {
                          setQuizAnswers({ ...quizAnswers, [questionNumber]: answerIndex });
                        }}
                        onSubmit={submitQuiz}
                        calculateScore={calculateQuizScore}
                      />
                    </div>
                  )}
                </div>
              ) : (
                // Fallback: No content generated yet
                <div className="p-8 bg-warning/10 border border-warning/20 rounded-xl">
                  <p className="text-warning font-semibold mb-2">
                    ⚠️ Indhold under generering
                  </p>
                  <p className="text-text-muted">
                    Detaljeret indhold for denne sektion er endnu ikke genereret. Dette kan tage
                    et par minutter. Prøv at genindlæse siden om lidt.
                  </p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-12 pt-8 border-t border-text-muted/20">
                <button
                  onClick={() => goToSection(currentSectionIndex - 1)}
                  disabled={currentSectionIndex === 0}
                  className={`
                    px-6 py-3 rounded-xl font-semibold transition-all
                    ${currentSectionIndex === 0
                      ? 'bg-card-light text-text-muted cursor-not-allowed'
                      : 'bg-secondary text-white hover:bg-secondary-dark'
                    }
                  `}
                >
                  ← Forrige sektion
                </button>

                {currentSectionIndex < curriculum.sections.length - 1 ? (
                  <button
                    onClick={() => goToSection(currentSectionIndex + 1)}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all"
                  >
                    Næste sektion →
                  </button>
                ) : (
                  <button
                    onClick={markSectionComplete}
                    className="px-6 py-3 bg-success text-white rounded-xl font-semibold hover:bg-success-dark transition-all"
                  >
                    ✓ Fuldfør kursus
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function ContentBlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'paragraph':
      return <p className="text-text-muted leading-relaxed">{block.content}</p>;

    case 'heading':
      const HeadingTag = block.heading || 'h3';
      return (
        <HeadingTag className="text-2xl font-bold text-text-light mt-6 mb-4">
          {block.content}
        </HeadingTag>
      );

    case 'list':
      return (
        <div>
          {block.content && (
            <p className="text-text-light font-semibold mb-2">{block.content}</p>
          )}
          <ul className="space-y-2 ml-6">
            {block.subItems?.map((item, i) => (
              <li key={i} className="text-text-muted list-disc">
                {item}
              </li>
            ))}
          </ul>
        </div>
      );

    case 'callout':
      const calloutStyles = {
        info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
        warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
        tip: 'bg-green-500/10 border-green-500/30 text-green-400',
        example: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
      };
      const style = calloutStyles[block.calloutType || 'info'];

      return (
        <div className={`p-4 border rounded-xl ${style}`}>
          <p className="text-sm">{block.content}</p>
        </div>
      );

    case 'quote':
      return (
        <blockquote className="border-l-4 border-primary pl-6 py-2 italic text-text-muted">
          {block.content}
        </blockquote>
      );

    default:
      return null;
  }
}

function CodeExampleRenderer({ example }: { example: CodeExample }) {
  return (
    <div className="bg-card-light rounded-xl overflow-hidden border border-text-muted/20">
      <div className="px-6 py-4 bg-card-hover border-b border-text-muted/20">
        <h4 className="font-semibold text-text-light mb-1">{example.title}</h4>
        <p className="text-sm text-text-muted">{example.description}</p>
      </div>

      <SyntaxHighlighter
        language={example.language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: '0.875rem',
          padding: '1.5rem',
        }}
        showLineNumbers
      >
        {example.code}
      </SyntaxHighlighter>

      <div className="px-6 py-4 bg-card-hover border-t border-text-muted/20">
        <p className="text-sm text-text-muted">{example.explanation}</p>
      </div>
    </div>
  );
}

function QuizRenderer({
  quiz,
  answers,
  showResults,
  onAnswerChange,
  onSubmit,
  calculateScore,
}: {
  quiz: Quiz;
  answers: Record<number, number | null>;
  showResults: boolean;
  onAnswerChange: (questionNumber: number, answerIndex: number) => void;
  onSubmit: () => void;
  calculateScore: () => number;
}) {
  const allAnswered = quiz.questions.every((q) => answers[q.questionNumber] !== null && answers[q.questionNumber] !== undefined);

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-light mb-2">📝 Quiz</h2>
      <p className="text-text-muted mb-8">
        Test din viden! Du skal score mindst 70% for at gennemføre denne sektion.
      </p>

      <div className="space-y-8">
        {quiz.questions.map((question) => (
          <QuestionRenderer
            key={question.questionNumber}
            question={question}
            selectedAnswer={answers[question.questionNumber]}
            showResult={showResults}
            onAnswerSelect={(index) => onAnswerChange(question.questionNumber, index)}
          />
        ))}
      </div>

      {!showResults ? (
        <button
          onClick={onSubmit}
          disabled={!allAnswered}
          className={`
            mt-8 px-8 py-4 rounded-xl font-semibold transition-all
            ${allAnswered
              ? 'bg-primary text-white hover:bg-primary-dark'
              : 'bg-card-light text-text-muted cursor-not-allowed'
            }
          `}
        >
          Indsend svar
        </button>
      ) : (
        <div className="mt-8 p-6 bg-card-light rounded-xl">
          <div className="text-center">
            <p className="text-2xl font-bold text-text-light mb-2">
              Din score: {calculateScore()}%
            </p>
            {calculateScore() >= 70 ? (
              <p className="text-success">✓ Godt klaret! Du har gennemført denne sektion.</p>
            ) : (
              <p className="text-warning">
                ⚠️ Du skal score mindst 70%. Prøv igen for at gennemføre sektionen.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionRenderer({
  question,
  selectedAnswer,
  showResult,
  onAnswerSelect,
}: {
  question: QuizQuestion;
  selectedAnswer: number | null | undefined;
  showResult: boolean;
  onAnswerSelect: (index: number) => void;
}) {
  return (
    <div className="p-6 bg-card-light rounded-xl">
      <div className="flex items-start gap-3 mb-4">
        <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
          {question.questionNumber}
        </span>
        <div className="flex-1">
          <p className="text-text-light font-semibold mb-1">{question.question}</p>
          <span className="text-xs text-text-muted">Sværhedsgrad: {question.difficulty}</span>
        </div>
      </div>

      <div className="space-y-3 ml-11">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = index === question.correctAnswerIndex;
          const showCorrect = showResult && isCorrect;
          const showIncorrect = showResult && isSelected && !isCorrect;

          return (
            <button
              key={index}
              onClick={() => !showResult && onAnswerSelect(index)}
              disabled={showResult}
              className={`
                w-full text-left px-4 py-3 rounded-xl border-2 transition-all
                ${showCorrect
                  ? 'bg-success/10 border-success text-success font-semibold'
                  : showIncorrect
                  ? 'bg-red-500/10 border-red-500 text-red-400'
                  : isSelected
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-card border-text-muted/20 text-text-muted hover:border-primary/50'
                }
                ${showResult ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
                {showCorrect && <span>✓</span>}
                {showIncorrect && <span>✗</span>}
              </div>
            </button>
          );
        })}
      </div>

      {showResult && (
        <div className="mt-4 ml-11 p-4 bg-card rounded-xl">
          <p className="text-sm text-text-muted">
            <span className="font-semibold text-text-light">Forklaring:</span>{' '}
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
