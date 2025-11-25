import React, { useState } from 'react';
import { QuestionCard } from './QuestionCard';

interface SectionAccordionProps {
  section: any;
  sectionIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
  onQuestionEdit: (questionIndex: number, question: any) => void;
  isDraft: boolean;
}

export const SectionAccordion: React.FC<SectionAccordionProps> = ({
  section,
  sectionIndex,
  isExpanded,
  onToggle,
  onQuestionEdit,
  isDraft
}) => {
  const questionCount = section.questions?.length || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left"
      >
        <div className="flex items-center flex-1">
          <div className="flex-shrink-0 mr-4">
            {isExpanded ? (
              <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600 text-sm font-semibold mr-3">
                {section.order || sectionIndex + 1}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                {section.description && (
                  <p className="text-sm text-gray-600 mt-0.5">{section.description}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4 ml-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {questionCount} {questionCount === 1 ? 'question' : 'questions'}
            </span>
            {section.modeLabel && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {section.modeLabel}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Section Content */}
      {isExpanded && (
        <div className="px-6 py-4 space-y-3">
          {questionCount === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No questions in this section
            </div>
          ) : (
            section.questions.map((question: any, questionIndex: number) => (
              <QuestionCard
                key={question.id}
                question={question}
                questionIndex={questionIndex}
                onEdit={() => onQuestionEdit(questionIndex, question)}
                isDraft={isDraft}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

