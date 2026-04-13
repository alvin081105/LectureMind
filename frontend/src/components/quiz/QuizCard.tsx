import { useEffect, useRef, useState } from 'react';
import BloomBadge from '../common/BloomBadge';
import type { Quiz } from '../../types';

interface QuizCardProps {
  quiz: Quiz;
  index: number;
  total: number;
  timerSeconds?: number; // undefined = 타이머 없음
  onAnswer: (answer: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function QuizCard({ quiz, index, total, timerSeconds, onAnswer, onNext, onPrev }: QuizCardProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerSeconds ?? 0);
  const [timeExpired, setTimeExpired] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isCorrect = userAnswer.trim().toLowerCase() === quiz.correctAnswer.trim().toLowerCase();

  // 문제 바뀔 때 타이머 리셋
  useEffect(() => {
    setUserAnswer('');
    setSubmitted(false);
    setTimeExpired(false);
    if (timerSeconds) setTimeLeft(timerSeconds);
  }, [quiz.quizId, timerSeconds]);

  // 타이머 카운트다운
  useEffect(() => {
    if (!timerSeconds || submitted) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setTimeExpired(true);
          setSubmitted(true);
          onAnswer('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [quiz.quizId, timerSeconds, submitted]);

  const handleSubmit = () => {
    if (!userAnswer) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSubmitted(true);
    onAnswer(userAnswer);
  };

  const handleNext = () => {
    setUserAnswer('');
    setSubmitted(false);
    setTimeExpired(false);
    onNext();
  };

  const progressPercent = Math.round(((index + 1) / total) * 100);
  const timerPercent = timerSeconds ? Math.round((timeLeft / timerSeconds) * 100) : 100;
  const timerColor = timerPercent > 50 ? 'bg-green-400' : timerPercent > 25 ? 'bg-yellow-400' : 'bg-red-500';

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden max-w-2xl mx-auto shadow-sm">
      {/* 전체 진행도 바 */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="p-6 space-y-5">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">{index + 1} / {total}</span>
            <BloomBadge level={quiz.bloomLevel} size="sm" />
          </div>
          {/* 타이머 */}
          {timerSeconds && (
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${timerColor}`}
                  style={{ width: `${timerPercent}%` }}
                />
              </div>
              <span className={`text-sm font-mono font-bold tabular-nums ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-600'}`}>
                {timeLeft}s
              </span>
            </div>
          )}
        </div>

        {/* 문제 */}
        <p className="text-base font-medium text-gray-800 leading-relaxed">{quiz.question}</p>

        {/* 시간 초과 메시지 */}
        {timeExpired && (
          <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-sm text-orange-700 font-medium">
            ⏰ 시간이 초과되었습니다.
          </div>
        )}

        {/* 선택지 or 입력 */}
        {!timeExpired && (
          <>
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
          </>
        )}

        {/* 제출 후 해설 */}
        {submitted && (
          <div className={`p-4 rounded-lg text-sm border ${
            timeExpired
              ? 'bg-orange-50 border-orange-200 text-orange-800'
              : isCorrect
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <p className="font-semibold mb-1">
              {timeExpired ? `시간 초과 · 정답: ${quiz.correctAnswer}` : isCorrect ? '✓ 정답입니다!' : `✗ 오답 · 정답: ${quiz.correctAnswer}`}
            </p>
            <p className="text-xs opacity-80 leading-relaxed">{quiz.explanation}</p>
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
              {index + 1 === total ? '결과 보기' : '다음 문제 →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
