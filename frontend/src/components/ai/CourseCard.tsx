// Course card component for AI recommendations
import React from 'react';
import Link from 'next/link';
import { AIRecommendation } from '@/lib/ai/prompts';

interface CourseCardProps {
  recommendation: AIRecommendation;
  onSelect?: (courseId: number) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  recommendation,
  onSelect,
}) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect(recommendation.course_id);
    }
  };

  // Calculate relevance percentage
  const relevancePercent = Math.round(recommendation.relevance_score * 100);

  return (
    <Link
      href={`/courses/${recommendation.course_id}`}
      onClick={handleClick}
      className="block group"
    >
      <div
        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 transition-all hover:scale-105 hover:bg-white/15 cursor-pointer"
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Relevance badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-[#FF6A3D]/20 border border-[#FF6A3D]/40 rounded-full">
              <span className="text-[#FF6A3D] text-xs font-semibold">
                {relevancePercent}% match
              </span>
            </div>
          </div>
          <div className="text-white/60 text-sm">
            {recommendation.duration}
          </div>
        </div>

        {/* Course title */}
        <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[#FF6A3D] transition-colors">
          {recommendation.title}
        </h3>

        {/* Provider */}
        <p className="text-white/60 text-sm mb-3">
          {recommendation.provider}
        </p>

        {/* Reasoning */}
        <p className="text-white/80 text-sm leading-relaxed mb-4">
          {recommendation.reasoning}
        </p>

        {/* Price and CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="text-white">
            <span className="text-2xl font-bold">
              {recommendation.price_dkk.toLocaleString('da-DK')} kr
            </span>
            <span className="text-white/60 text-sm ml-1">eksl. moms</span>
          </div>

          <div className="px-4 py-2 bg-gradient-to-r from-[#FF6A3D] to-[#FF8A3D] text-white rounded-xl text-sm font-semibold group-hover:scale-105 transition-transform">
            Se kursus →
          </div>
        </div>

        {/* Next available date (if provided) */}
        {recommendation.next_available && (
          <div className="mt-3 text-white/50 text-xs">
            Næste ledige dato: {recommendation.next_available}
          </div>
        )}
      </div>
    </Link>
  );
};
