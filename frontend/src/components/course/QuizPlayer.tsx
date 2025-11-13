/**
 * QuizPlayer - Interactive quiz component for section quizzes
 *
 * Features:
 * - Support for multiple choice, true/false, and code completion questions
 * - Immediate feedback (green checkmark / red X)
 * - Explanations after answering
 * - Score tracking
 * - Code snippet display for code_completion questions
 */

import React, { useState } from 'react';
import { SectionQuiz, QuizQuestion } from './types';

type Props = {
  quiz: SectionQuiz;
  onComplete: (score: number) => void;
};

export default function QuizPlayer({ quiz, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    if (submitted) return; // Don't allow changes after submission

    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmit = () => {
    // Calculate score
    let correctCount = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / quiz.questions.length) * 100);
    setScore(calculatedScore);
    setSubmitted(true);
    onComplete(calculatedScore);
  };

  const isQuestionCorrect = (questionIndex: number): boolean | null => {
    if (!submitted) return null;
    const question = quiz.questions[questionIndex];
    return answers[questionIndex] === question.correctAnswer;
  };

  const allQuestionsAnswered = quiz.questions.every((_, index) => answers[index] !== undefined);

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-text-light flex items-center space-x-2">
          <span>🧠</span>
          <span>Section Quiz</span>
        </h3>
        {submitted && score !== null && (
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">{score}%</span>
            <span className="text-sm text-text-muted">
              ({quiz.questions.filter((_, i) => isQuestionCorrect(i)).length}/{quiz.questions.length} korrekte)
            </span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {quiz.questions.map((question, questionIndex) => (
          <QuestionCard
            key={questionIndex}
            question={question}
            questionNumber={questionIndex + 1}
            selectedAnswer={answers[questionIndex]}
            onAnswerSelect={(answer) => handleAnswerSelect(questionIndex, answer)}
            isCorrect={isQuestionCorrect(questionIndex)}
            submitted={submitted}
          />
        ))}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!allQuestionsAnswered}
          className="mt-6 w-full px-6 py-4 bg-primary rounded-xl text-white
                     hover:bg-primary-dark transition-colors font-semibold text-lg
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {allQuestionsAnswered ? 'Tjek Svar' : `Besvar alle spørgsmål (${Object.keys(answers).length}/${quiz.questions.length})`}
        </button>
      )}

      {submitted && (
        <div className="mt-6 bg-background rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-text-light font-semibold mb-1">Quiz gennemført!</p>
            <p className="text-text-muted text-sm">
              Du fik {score}% rigtige svar.
              {score && score >= 80 && ' Godt klaret! 🎉'}
              {score && score >= 60 && score < 80 && ' Fint arbejde! 👍'}
              {score && score < 60 && ' Prøv eventuelt at gennemgå sektionen igen.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// QUESTION CARD COMPONENT
// ============================================================================

type QuestionCardProps = {
  question: QuizQuestion;
  questionNumber: number;
  selectedAnswer?: string;
  onAnswerSelect: (answer: string) => void;
  isCorrect: boolean | null;
  submitted: boolean;
};

function QuestionCard({
  question,
  questionNumber,
  selectedAnswer,
  onAnswerSelect,
  isCorrect,
  submitted
}: QuestionCardProps) {
  return (
    <div className="bg-background rounded-xl p-5 border border-text-muted/20">
      {/* Question Header */}
      <div className="flex items-start space-x-3 mb-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
          <span className="text-secondary font-bold text-sm">{questionNumber}</span>
        </div>
        <div className="flex-1">
          <p className="text-text-light font-medium leading-relaxed">
            {question.questionText}
          </p>
          {question.difficulty && (
            <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
              question.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
              question.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {question.difficulty === 'easy' && 'Let'}
              {question.difficulty === 'medium' && 'Mellem'}
              {question.difficulty === 'hard' && 'Svær'}
            </span>
          )}
        </div>
        {submitted && isCorrect !== null && (
          <div className="flex-shrink-0">
            {isCorrect ? (
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Code Snippet (for code_completion questions) */}
      {question.codeSnippet && (
        <div className="mb-4 bg-card rounded-lg p-3 border border-text-muted/20">
          <pre className="text-sm text-text-muted overflow-x-auto">
            <code>{question.codeSnippet}</code>
          </pre>
        </div>
      )}

      {/* Answer Options */}
      <div className="space-y-2 mb-4">
        {question.options.map((option, optionIndex) => {
          const isSelected = selectedAnswer === option;
          const isCorrectOption = option === question.correctAnswer;
          const showCorrect = submitted && isCorrectOption;
          const showIncorrect = submitted && isSelected && !isCorrectOption;

          return (
            <label
              key={optionIndex}
              className={`flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                showCorrect ? 'border-green-500 bg-green-500/10' :
                showIncorrect ? 'border-red-500 bg-red-500/10' :
                isSelected ? 'border-secondary bg-secondary/10' :
                'border-text-muted/20 hover:border-text-muted/40'
              } ${submitted ? 'cursor-default' : ''}`}
            >
              <input
                type="radio"
                name={`question-${questionNumber}`}
                value={option}
                checked={isSelected}
                onChange={() => onAnswerSelect(option)}
                disabled={submitted}
                className="mt-1 w-4 h-4 text-secondary focus:ring-secondary focus:ring-offset-background"
              />
              <span className={`flex-1 text-sm ${
                showCorrect ? 'text-green-400 font-medium' :
                showIncorrect ? 'text-red-400' :
                isSelected ? 'text-text-light font-medium' :
                'text-text-muted'
              }`}>
                {option}
              </span>
              {showCorrect && (
                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </label>
          );
        })}
      </div>

      {/* Explanation (shown after submission) */}
      {submitted && question.explanation && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-400 font-semibold text-sm mb-2">💡 Forklaring:</p>
          <p className="text-text-muted text-sm leading-relaxed">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
