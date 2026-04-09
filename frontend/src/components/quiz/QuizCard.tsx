import { useState } from 'react';
import BloomBadge from '../common/BloomBadge';
import type { Quiz } from '../../types';

interface QuizCardProps {
  quiz: Quiz;
  index: number;
  total: number;
  onAnswer: (answer: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function QuizCard({ quiz, index, total, onAnswer, onNext, onPrev }: QuizCardProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = userAnswer.trim().toLowerCase() === quiz.correctAnswer.trim().toLowerCase();

  const handleSubmit = () => {
    if (!userAnswer) return;
    setSubmitted(true);
    onAnswer(userAnswer);
  };

  const handleNext = () => {
    setUserAnswer('');
    setSubmitted(false);
    onNext();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5 max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">{index + 1} / {total}</span>
        <BloomBadge level={quiz.bloomLevel} size="sm" />
      </div>

      {/* 문제 */}
      <p className="text-base font-medium text-gray-800 leading-relaxed">{quiz.question}</p>

      {/* 선택지 or 입력 */}
      {quiz.type === 'MULTIPLE_CHOICE' && quiz.options ? (
        <div className="space-y-2">
          {quiz.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => !submitted && setUserAnswer(opt)}
              disabled={submitted}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                submitted
                  ? opt === quiz.correctAnswer
                    ? 'border-green-400 bg-green-50 text-green-700'
                    : opt === userAnswer
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-400'
                  : userAnswer === opt
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-indigo-300 text-gray-700'
              }`}
            >
              {String.fromCharCode(9312 + i)} {opt}
            </button>
          ))}
        </div>
      ) : quiz.type === 'OX' ? (
        <div className="flex gap-3">
          {['O', 'X'].map((v) => (
            <button
              key={v}
              onClick={() => !submitted && setUserAnswer(v)}
              disabled={submitted}
              className={`flex-1 py-4 text-2xl font-bold rounded-xl border transition-colors ${
                submitted
                  ? v === quiz.correctAnswer
                    ? 'border-green-400 bg-green-50'
                    : v === userAnswer
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 text-gray-300'
                  : userAnswer === v
                  ? 'border-indigo-400 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      ) : (
        <textarea
          value={userAnswer}
          onChange={(e) => !submitted && setUserAnswer(e.target.value)}
          disabled={submitted}
          rows={3}
          placeholder="답을 입력하세요"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      )}

      {/* 제출 후 해설 */}
      {submitted && (
        <div className={`p-3 rounded-lg text-sm ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <p className="font-semibold mb-1">{isCorrect ? '정답입니다!' : `오답 · 정답: ${quiz.correctAnswer}`}</p>
          <p className="text-xs opacity-80">{quiz.explanation}</p>
        </div>
      )}

      {/* 네비게이션 */}
      <div className="flex justify-between pt-2">
        <button
          onClick={onPrev}
          disabled={index === 0}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30"
        >
          이전
        </button>
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!userAnswer}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40"
          >
            제출
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {index + 1 === total ? '결과 보기' : '다음 문제'}
          </button>
        )}
      </div>
    </div>
  );
}
