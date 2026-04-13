import { useEffect, useState } from 'react';

interface AILoaderProps {
  title?: string;
  messages?: string[];
}

const NOTE_MESSAGES = [
  'AI가 강의 내용을 분석하고 있습니다...',
  'STT 텍스트에서 핵심 개념을 추출 중...',
  '블룸 분류 체계에 맞게 구조화하는 중...',
  '학습 단계별로 섹션을 정리하고 있습니다...',
  '거의 완료되었습니다...',
];

export const QUIZ_MESSAGES = [
  '노트 내용을 기반으로 문제를 설계하는 중...',
  '블룸 레벨별 난이도를 조정하고 있습니다...',
  '선택지와 해설을 생성하고 있습니다...',
  '최종 검토 중...',
];

export const ANALYSIS_MESSAGES = [
  'AI가 강의 전체를 스캔하는 중...',
  '난이도 변화 패턴을 분석하고 있습니다...',
  '학생이 어려워할 구간을 탐지 중...',
  '개선 제안을 작성하고 있습니다...',
  '리포트를 마무리하고 있습니다...',
];

export default function AILoader({
  title = 'AI 처리 중',
  messages = NOTE_MESSAGES,
}: AILoaderProps) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'in' | 'out'>('in');

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase('out');
      setTimeout(() => {
        setIndex((i) => (i + 1) % messages.length);
        setPhase('in');
      }, 380);
    }, 3000);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: 'rgba(9, 7, 24, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* ── 중앙 오비트 애니메이션 ── */}
      <div className="relative flex items-center justify-center mb-10" style={{ width: 200, height: 200 }}>

        {/* 퍼지는 링 3개 */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 72, height: 72,
              border: '2px solid rgba(139,92,246,0.7)',
              animation: `ai-ring-pulse 2.4s ease-out ${i * 0.8}s infinite`,
            }}
          />
        ))}

        {/* 안쪽 궤도 도트 3개 */}
        {(['ai-orbit-a', 'ai-orbit-b', 'ai-orbit-c'] as const).map((anim, i) => (
          <div
            key={anim}
            className="absolute"
            style={{ animation: `${anim} ${3.2 + i * 0.4}s linear infinite` }}
          >
            <div
              className="rounded-full"
              style={{
                width: 9, height: 9,
                background: `radial-gradient(circle, ${['#c4b5fd','#a5b4fc','#f0abfc'][i]}, ${['#7c3aed','#4f46e5','#9333ea'][i]})`,
                boxShadow: `0 0 8px 2px ${['rgba(196,181,253,0.8)','rgba(165,180,252,0.8)','rgba(240,171,252,0.8)'][i]}`,
              }}
            />
          </div>
        ))}

        {/* 바깥 궤도 도트 3개 */}
        {(['ai-orbit-d', 'ai-orbit-e', 'ai-orbit-f'] as const).map((anim, i) => (
          <div
            key={anim}
            className="absolute"
            style={{ animation: `${anim} ${5.0 + i * 0.6}s linear infinite` }}
          >
            <div
              className="rounded-full"
              style={{
                width: 6, height: 6,
                background: `radial-gradient(circle, ${['#ddd6fe','#bfdbfe','#fbcfe8'][i]}, ${['#6366f1','#2563eb','#ec4899'][i]})`,
                boxShadow: `0 0 6px 1px ${['rgba(221,214,254,0.7)','rgba(191,219,254,0.7)','rgba(251,207,232,0.7)'][i]}`,
              }}
            />
          </div>
        ))}

        {/* 스캔 라인 */}
        <div
          className="absolute overflow-hidden rounded-full"
          style={{ width: 72, height: 72, opacity: 0.25 }}
        >
          <div
            className="absolute w-full"
            style={{
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #a78bfa, transparent)',
              animation: 'ai-scan 1.8s ease-in-out infinite',
            }}
          />
        </div>

        {/* 중앙 글로우 코어 */}
        <div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            width: 40, height: 40,
            background: 'linear-gradient(135deg, #818cf8, #8b5cf6)',
            animation: 'ai-center-breathe 2s ease-in-out infinite',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="white" opacity="0.9"/>
          </svg>
        </div>
      </div>

      {/* ── 텍스트 영역 ── */}
      <div className="text-center px-6 max-w-sm">
        <h2 className="text-white text-xl font-bold mb-3 tracking-tight">
          {title}
        </h2>

        {/* 사이클링 메시지 */}
        <div className="h-6 flex items-center justify-center overflow-hidden mb-8">
          <p
            key={index}
            className={`text-sm text-violet-300 ${phase === 'in' ? 'ai-loader-in' : 'ai-loader-out'}`}
          >
            {messages[index]}
          </p>
        </div>

        {/* 진행 바 */}
        <div className="w-64 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: '100%',
              background: 'linear-gradient(90deg, #4f46e5, #8b5cf6, #c4b5fd, #8b5cf6, #4f46e5)',
              backgroundSize: '300% 100%',
              animation: 'ai-bar-shimmer 2.2s ease-in-out infinite',
            }}
          />
        </div>

        <p className="mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          백그라운드에서 처리 중이니 잠시만 기다려 주세요
        </p>
      </div>
    </div>
  );
}
