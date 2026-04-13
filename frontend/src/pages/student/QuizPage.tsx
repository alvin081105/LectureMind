import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QuizCard from '../../components/quiz/QuizCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BloomFilter from '../../components/note/BloomFilter';
import { quizApi } from '../../api/quizApi';
import { noteApi } from '../../api/noteApi';
import { BLOOM_LEVELS } from '../../constants/bloomColors';
import AILoader, { QUIZ_MESSAGES } from '../../components/common/AILoader';
import type { BloomLevel, QuizAnswer, QuizSet } from '../../types';

const TIMER_OPTIONS = [
  { label: '없음', value: 0 },
  { label: '30초', value: 30 },
  { label: '1분', value: 60 },
  { label: '2분', value: 120 },
];

export default function QuizPage() {
  const { lectureId } = useParams<{ lectureId: string }>();
  const navigate = useNavigate();
  const [quizSet, setQuizSet] = useState<QuizSet | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLevels, setSelectedLevels] = useState<BloomLevel[]>([...BLOOM_LEVELS]);
  const [count, setCount] = useState(10);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [noteId, setNoteId] = useState<number | null>(null);
  const [loadingNote, setLoadingNote] = useState(true);

  useEffect(() => {
    if (!lectureId) return;
    noteApi.findByLectureId(Number(lectureId))
      .then((note) => {
        if (note) setNoteId(note.noteId);
        else navigate(-1);
      })
      .catch(() => navigate(-1))
      .finally(() => setLoadingNote(false));
  }, [lectureId, navigate]);

  const handleGenerate = async () => {
    if (!noteId) return;
    setLoading(true);
    try {
      const res = await quizApi.generate({ noteId, bloomLevels: selectedLevels, count });
      setQuizSet(res.data);
      setCurrentIndex(0);
      setAnswers([]);
    } catch {
      alert('퀴즈 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (!quizSet) return;
    const quizId = quizSet.quizzes[currentIndex].quizId;
    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.quizId !== quizId);
      return [...filtered, { quizId, userAnswer: answer }];
    });
  };

  const handleNext = async () => {
    if (!quizSet) return;
    if (currentIndex + 1 >= quizSet.quizzes.length) {
      try {
        const res = await quizApi.submit(quizSet.quizSetId, answers);
        navigate(`/student/quiz/result/${quizSet.quizSetId}`, {
          state: { result: res.data, quizzes: quizSet.quizzes },
        });
      } catch {
        alert('결과 제출에 실패했습니다.');
      }
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  if (loadingNote) {
    return <div className="flex justify-center py-24"><LoadingSpinner message="노트 정보를 불러오는 중..." /></div>;
  }

  if (loading) {
    return <AILoader title="AI 퀴즈 생성 중" messages={QUIZ_MESSAGES} />;
  }

  if (!quizSet) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-800">← 뒤로</button>
          <h2 className="text-xl font-bold text-gray-800">퀴즈 설정</h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
          {/* 블룸 레벨 */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">블룸 레벨 선택</p>
            <BloomFilter selected={selectedLevels} onChange={setSelectedLevels} layout="row" />
          </div>

          {/* 문제 수 */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              문제 수: <span className="text-indigo-600 font-semibold">{count}개</span>
            </p>
            <input
              type="range" min={5} max={30} step={5} value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5개</span><span>30개</span>
            </div>
          </div>

          {/* 타이머 */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">문제당 제한 시간</p>
            <div className="flex gap-2 flex-wrap">
              {TIMER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTimerSeconds(opt.value)}
                  className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    timerSeconds === opt.value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {timerSeconds > 0 && (
              <p className="text-xs text-orange-500 mt-2">
                ⏰ 시간이 초과되면 자동으로 빈 답으로 처리됩니다.
              </p>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || selectedLevels.length === 0}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            퀴즈 생성 시작
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setQuizSet(null)} className="text-sm text-gray-500 hover:text-gray-800">← 설정으로</button>
          <h2 className="text-xl font-bold text-gray-800">퀴즈</h2>
        </div>
        {timerSeconds > 0 && (
          <span className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded-full border border-orange-200">
            ⏰ 타이머 모드
          </span>
        )}
      </div>

      <QuizCard
        quiz={quizSet.quizzes[currentIndex]}
        index={currentIndex}
        total={quizSet.quizzes.length}
        timerSeconds={timerSeconds > 0 ? timerSeconds : undefined}
        onAnswer={handleAnswer}
        onNext={handleNext}
        onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))}
      />
    </div>
  );
}
