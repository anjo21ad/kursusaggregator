// Course recommendations display component
import React from 'react';
import { CourseCard } from './CourseCard';
import { AIResponse } from '@/lib/ai/prompts';

interface CourseRecommendationsProps {
  response: AIResponse;
  interactionId?: number;
  onCourseSelect?: (courseId: number) => void;
}

export const CourseRecommendations: React.FC<CourseRecommendationsProps> = ({
  response,
  interactionId,
  onCourseSelect,
}) => {
  if (!response || !response.recommendations || response.recommendations.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
        <div className="text-white/60 mb-2">😔</div>
        <p className="text-white">
          Desværre fandt jeg ingen kurser der matcher din forespørgsel.
        </p>
        <p className="text-white/60 text-sm mt-2">
          Prøv at formulere din forespørgsel anderledes, eller kontakt os for personlig hjælp.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Understanding section */}
      {response.understanding && (
        <div className="bg-[#7E6BF1]/20 border border-[#7E6BF1]/40 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="text-white font-semibold mb-2">
                Sådan forstår jeg dit behov:
              </h4>
              <p className="text-white/80 text-sm leading-relaxed">
                {response.understanding}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div>
        <h3 className="text-white text-xl font-semibold mb-4">
          Mine anbefalinger til dig ({response.recommendations.length})
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {response.recommendations.map((recommendation, index) => (
            <CourseCard
              key={`${recommendation.course_id}-${index}`}
              recommendation={recommendation}
              onSelect={(courseId) => {
                if (onCourseSelect) {
                  onCourseSelect(courseId);
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Clarifying questions */}
      {response.clarifying_questions && response.clarifying_questions.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <h4 className="text-white font-semibold mb-3">
            For at hjælpe dig bedre, kan du svare på:
          </h4>
          <ul className="space-y-2">
            {response.clarifying_questions.map((question, index) => (
              <li key={index} className="text-white/80 text-sm flex items-start">
                <span className="text-[#FF6A3D] mr-2">•</span>
                {question}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Call to action */}
      <div className="bg-gradient-to-r from-[#FF6A3D]/20 to-[#7E6BF1]/20 border border-white/20 rounded-2xl p-6 text-center">
        <p className="text-white mb-4">
          Har du spørgsmål eller brug for hjælp til at vælge det rette kursus?
        </p>
        <button className="px-6 py-3 bg-gradient-to-r from-[#FF6A3D] to-[#FF8A3D] text-white rounded-xl font-semibold hover:scale-105 transition-transform">
          Kontakt os
        </button>
      </div>
    </div>
  );
};
