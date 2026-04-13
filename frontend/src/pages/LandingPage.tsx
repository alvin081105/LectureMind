import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReveal } from '../hooks/useReveal';

// ── 스크롤 트리거 섹션 래퍼 ──────────────────────────
function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal();
  return <section ref={ref} className={className}>{children}</section>;
}

// ── 카운터 애니메이션 ──────────────────────────────────
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1800;
        const step = 16;
        const steps = duration / step;
        let current = 0;
        const inc = to / steps;
        const timer = setInterval(() => {
          current += inc;
          if (current >= to) { current = to; clearInterval(timer); }
          setCount(Math.floor(current));
        }, step);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [to]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const FEATURES = [
  { icon: '🎙️', title: 'AI 음성 인식 (STT)', desc: '강의 녹음을 업로드하면 Whisper AI가 자동으로 텍스트로 변환합니다.', color: 'from-blue-500 to-cyan-500' },
  { icon: '📝', title: '구조화 노트 생성', desc: '블룸 분류 체계 기반으로 Claude AI가 핵심 내용을 자동 정리합니다.', color: 'from-violet-500 to-purple-500' },
  { icon: '🧠', title: '맞춤형 퀴즈', desc: '학습 수준에 맞는 퀴즈를 생성하고 오답을 체계적으로 관리합니다.', color: 'from-pink-500 to-rose-500' },
  { icon: '📊', title: '강의 분석 리포트', desc: '난이도 타임라인, 블룸 분포, AI 개선 제안을 교수자에게 제공합니다.', color: 'from-orange-500 to-amber-500' },
  { icon: '🔄', title: '간격 반복 학습', desc: '망각 곡선 알고리즘으로 최적의 복습 일정을 자동으로 설정합니다.', color: 'from-emerald-500 to-teal-500' },
  { icon: '📄', title: 'PDF 내보내기', desc: '분석 리포트를 PDF로 저장해 언제 어디서든 활용할 수 있습니다.', color: 'from-indigo-500 to-blue-500' },
];

const STEPS = [
  { num: '01', icon: '☁️', title: '강의 업로드', desc: 'MP3·MP4 파일을 드래그 앤 드롭으로 간단하게 업로드', color: 'bg-blue-500' },
  { num: '02', icon: '⚡', title: 'AI 자동 분석', desc: 'STT + Claude AI가 10분 안에 강의 전체를 분석', color: 'bg-violet-500' },
  { num: '03', icon: '🎯', title: '스마트 학습', desc: '노트·퀴즈·학습 경로로 효율적인 복습 시작', color: 'bg-emerald-500' },
];

const TICKER_ITEMS = ['AI 음성 인식', '블룸 분류 체계', '스마트 퀴즈', '오답 노트', '학습 경로', '간격 반복', '강의 분석', 'PDF 내보내기', '난이도 타임라인', 'AI 개선 제안'];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  // 히어로 마우스 패럴랙스
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY, currentTarget } = e;
      const el = currentTarget as HTMLElement;
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = (clientX - left) / width - 0.5;
      const y = (clientY - top) / height - 0.5;
      const orbs = el.querySelectorAll<HTMLElement>('[data-parallax]');
      orbs.forEach((orb) => {
        const speed = Number(orb.dataset.parallax ?? 20);
        orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });
    };
    hero.addEventListener('mousemove', handleMouseMove);
    return () => hero.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-x-hidden transition-colors">

      {/* ── 헤더 ── */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div
          className="mx-3 sm:mx-4 mt-3 sm:mt-4 rounded-2xl px-4 sm:px-5 py-3 flex items-center justify-between"
          style={{
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(99,102,241,0.12)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">L</span>
            </div>
            <span className="text-base font-bold text-gray-900">LectureMind</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link to="/login" className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-xl hover:bg-gray-100">
              로그인
            </Link>
            <Link to="/signup" className="px-3 sm:px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
              시작하기 →
            </Link>
          </div>
        </div>
      </header>

      {/* ── 히어로 ── */}
      <div ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24 pb-16">

        {/* 배경 블롭들 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div data-parallax="30" className="animate-blob absolute -top-32 -left-32 w-[280px] h-[280px] sm:w-[500px] sm:h-[500px] opacity-30 dark:opacity-15"
            style={{ background: 'radial-gradient(circle, #6366f1 0%, #a78bfa 60%, transparent 100%)', transition: 'transform 0.1s ease-out' }} />
          <div data-parallax="-20" className="animate-blob-delay absolute -bottom-20 -right-20 w-[250px] h-[250px] sm:w-[450px] sm:h-[450px] opacity-25 dark:opacity-10"
            style={{ background: 'radial-gradient(circle, #06b6d4 0%, #3b82f6 60%, transparent 100%)', transition: 'transform 0.1s ease-out' }} />
          <div data-parallax="15" className="animate-blob absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[160px] sm:w-[600px] sm:h-[300px] opacity-15 dark:opacity-8"
            style={{ background: 'radial-gradient(ellipse, #f59e0b 0%, #ec4899 60%, transparent 100%)', transition: 'transform 0.1s ease-out' }} />
        </div>

        {/* 파티클 (모바일 숨김) */}
        {[
          { cls: 'animate-particle-1', style: { top: '20%', left: '10%', width: 8, height: 8 } },
          { cls: 'animate-particle-2', style: { top: '30%', right: '15%', width: 6, height: 6 } },
          { cls: 'animate-particle-3', style: { bottom: '25%', left: '20%', width: 10, height: 10 } },
          { cls: 'animate-particle-4', style: { top: '60%', right: '10%', width: 7, height: 7 } },
          { cls: 'animate-particle-5', style: { top: '10%', right: '30%', width: 5, height: 5 } },
        ].map((p, i) => (
          <div key={i} className={`${p.cls} hidden sm:block absolute rounded-full bg-indigo-400/40 dark:bg-indigo-400/30 pointer-events-none`}
            style={{ ...p.style, transition: 'transform 0.1s' }} />
        ))}

        {/* 회전 링 장식 (모바일 숨김) */}
        <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="animate-spin-slow w-[700px] h-[700px] rounded-full opacity-5 dark:opacity-8"
            style={{ border: '1px solid', borderColor: '#6366f1' }} />
          <div className="animate-spin-reverse absolute inset-12 rounded-full opacity-5 dark:opacity-8"
            style={{ border: '1px dashed', borderColor: '#a78bfa' }} />
        </div>

        {/* 히어로 콘텐츠 */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          {/* 뱃지 */}
          <div className="animate-fade-up inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full mb-6 sm:mb-8 text-xs sm:text-sm font-medium"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', backdropFilter: 'blur(8px)' }}>
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
            <span className="text-indigo-600 dark:text-indigo-300">AI 강의 분석 & 구조화 학습 플랫폼</span>
            <span className="text-indigo-400 hidden sm:inline">✦</span>
          </div>

          {/* 메인 타이틀 */}
          <h1 className="animate-fade-up delay-100 text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-5 sm:mb-6 leading-[1.05]">
            강의를 들으면<br />
            <span className="gradient-text-animated">AI가 완성합니다</span>
          </h1>

          <p className="animate-fade-up delay-200 text-base sm:text-xl text-gray-500 dark:text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
            음성 인식부터 노트 정리, 퀴즈 생성, 오답 노트, 간격 반복까지.<br className="hidden sm:block" />
            강의의 처음부터 끝까지 AI가 함께합니다.
          </p>

          {/* CTA 버튼 */}
          <div className="animate-fade-up delay-300 flex flex-col sm:flex-row gap-3 justify-center mb-10 sm:mb-16">
            <Link to="/signup"
              className="animate-glow-pulse group relative px-7 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#06b6d4 100%)', backgroundSize: '200% 200%' }}>
              <span className="relative z-10 flex items-center justify-center gap-2">
                무료로 시작하기
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
            <Link to="/login"
              className="px-7 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold rounded-2xl border transition-all hover:scale-105 active:scale-95 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              style={{ backdropFilter: 'blur(8px)' }}>
              로그인
            </Link>
          </div>

          {/* 플로팅 카드들 (sm 이상에서만 표시) */}
          <div className="hidden sm:block relative h-56 max-w-3xl mx-auto">
            {/* 노트 카드 */}
            <div className="animate-float-slow absolute left-4 top-0 w-56 text-left rounded-2xl p-4 shadow-2xl"
              style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(99,102,241,0.15)', boxShadow: '0 20px 60px rgba(99,102,241,0.15)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-indigo-100 flex items-center justify-center text-xs">📝</div>
                <span className="text-xs font-semibold text-gray-700">AI 노트</span>
              </div>
              <div className="space-y-1.5">
                <div className="h-2 bg-gray-200 rounded-full w-full" />
                <div className="h-2 bg-indigo-200 rounded-full w-4/5" />
                <div className="h-2 bg-gray-100 rounded-full w-3/5" />
              </div>
              <div className="mt-2 flex gap-1">
                <span className="px-1.5 py-0.5 rounded text-xs bg-violet-100 text-violet-600 font-medium">ANALYZE</span>
                <span className="px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-600 font-medium">APPLY</span>
              </div>
            </div>

            {/* 퀴즈 카드 */}
            <div className="animate-float-medium absolute right-4 top-4 w-52 text-left rounded-2xl p-4 shadow-2xl"
              style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(16,185,129,0.2)', boxShadow: '0 20px 60px rgba(16,185,129,0.15)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center text-xs">🧠</div>
                <span className="text-xs font-semibold text-gray-700">퀴즈 결과</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="3.5" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="3.5"
                      strokeDasharray={`${0.85 * 88} 88`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-emerald-600">85%</span>
                </div>
                <div className="text-xs text-gray-500 leading-relaxed">우수<br /><span className="text-emerald-500 font-semibold">+12점 ↑</span></div>
              </div>
            </div>

            {/* 분석 카드 */}
            <div className="animate-float-fast absolute left-1/2 -translate-x-1/2 bottom-0 w-48 text-left rounded-2xl p-3 shadow-2xl"
              style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(245,158,11,0.2)', boxShadow: '0 20px 60px rgba(245,158,11,0.12)' }}>
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-5 h-5 rounded bg-amber-100 flex items-center justify-center text-xs">📊</div>
                <span className="text-xs font-semibold text-gray-700">난이도 분석</span>
              </div>
              <div className="flex items-end gap-1 h-8">
                {[3,5,4,7,5,8,6,9,7,5].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm transition-all"
                    style={{ height: `${h * 10}%`, background: h > 7 ? '#f59e0b' : '#6366f1', opacity: 0.7 + i * 0.03 }} />
                ))}
              </div>
            </div>
          </div>

          {/* 모바일 전용: 미니 기능 뱃지들 */}
          <div className="sm:hidden flex flex-wrap justify-center gap-2 mt-2">
            {['📝 AI 노트', '🧠 스마트 퀴즈', '📊 강의 분석'].map((item) => (
              <span key={item} className="px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* 스크롤 힌트 */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span className="text-xs text-gray-400">스크롤</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-400 to-transparent animate-pulse" />
        </div>
      </div>

      {/* ── 티커 배너 ── */}
      <div className="py-4 border-y border-gray-100 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-gray-900">
        <div className="animate-ticker flex gap-8 whitespace-nowrap">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="text-sm font-medium text-gray-400 dark:text-gray-500 flex items-center gap-2">
              <span className="text-indigo-400">✦</span> {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── 통계 ── */}
      <Section className="py-12 sm:py-20 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { value: 95, suffix: '%', label: '학습 효율 향상', color: 'text-indigo-600 dark:text-indigo-400' },
              { value: 5, suffix: '분', label: '자동 노트 생성', color: 'text-violet-600 dark:text-violet-400' },
              { value: 10, suffix: '+', label: '지원 강의 형식', color: 'text-cyan-600 dark:text-cyan-400' },
              { value: 99, suffix: '%', label: 'AI 분석 정확도', color: 'text-emerald-600 dark:text-emerald-400' },
            ].map((s) => (
              <div key={s.label} className="reveal text-center p-4 sm:p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <p className={`text-3xl sm:text-4xl font-black mb-1 ${s.color}`}>
                  <Counter to={s.value} suffix={s.suffix} />
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 기능 섹션 ── */}
      <Section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="reveal text-center mb-10 sm:mb-16">
            <p className="text-sm font-semibold text-indigo-500 dark:text-indigo-400 mb-3 tracking-widest uppercase">Features</p>
            <h2 className="text-3xl sm:text-5xl font-black mb-4">모든 것이 자동으로</h2>
            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">강의 업로드 하나로 학습의 전 과정을 AI가 지원합니다.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`reveal card-glow group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 cursor-default`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {/* 호버 그라디언트 배경 */}
                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-300`} />

                <div className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-4 shadow-lg`}
                  style={{ transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
                  {f.icon}
                </div>
                <h3 className="relative text-base font-bold mb-2 text-gray-800 dark:text-gray-100">{f.title}</h3>
                <p className="relative text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>

                {/* 코너 장식 */}
                <div className={`absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-8 rounded-tl-3xl transition-opacity duration-300`} />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 사용 흐름 ── */}
      <Section className="py-16 sm:py-24 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4">
          <div className="reveal text-center mb-10 sm:mb-16">
            <p className="text-sm font-semibold text-indigo-500 dark:text-indigo-400 mb-3 tracking-widest uppercase">How it works</p>
            <h2 className="text-3xl sm:text-5xl font-black mb-4">3단계로 끝나는 학습</h2>
            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">복잡한 설정 없이, 파일 하나만 업로드하세요.</p>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* 연결선 */}
            <div className="hidden sm:block absolute top-10 h-0.5 bg-gradient-to-r from-blue-200 via-violet-200 to-emerald-200 dark:from-blue-900 dark:via-violet-900 dark:to-emerald-900" style={{ left: '16.67%', right: '16.67%' }} />

            {STEPS.map((s, i) => (
              <div key={s.num}
                className={`reveal text-center ${i === 0 ? 'reveal-left' : i === 2 ? 'reveal-right' : ''}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="relative inline-flex items-center justify-center mb-6">
                  {/* 펄스 링 */}
                  <div className={`absolute w-20 h-20 rounded-full ${s.color} opacity-20`}
                    style={{ animation: `pulse-ring 2.5s ease-out infinite ${i * 0.5}s` }} />
                  <div className={`relative w-16 h-16 rounded-2xl ${s.color} flex items-center justify-center text-3xl shadow-xl animate-morph-border`}
                    style={{ animation: `morph-border 8s ease-in-out infinite ${i * 2}s` }}>
                    {s.icon}
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-black flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 역할 섹션 (교수/학생) ── */}
      <Section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4">
          <div className="reveal text-center mb-10 sm:mb-16">
            <p className="text-sm font-semibold text-indigo-500 dark:text-indigo-400 mb-3 tracking-widest uppercase">For Everyone</p>
            <h2 className="text-3xl sm:text-5xl font-black mb-4">누구를 위한 플랫폼인가요?</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* 학생 */}
            <div className="reveal-left card-glow bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-indigo-50 to-transparent dark:from-indigo-950/30 rounded-bl-3xl" />
              <div className="text-4xl mb-4">👩‍🎓</div>
              <h3 className="text-2xl font-black mb-3 text-indigo-600 dark:text-indigo-400">학생</h3>
              <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
                {['자동 생성된 구조화 노트로 효율적인 학습', '맞춤형 퀴즈로 이해도 즉시 확인', '오답 노트로 취약점 집중 공략', '간격 반복으로 장기 기억 강화', '학습 경로 시각화로 진도 관리'].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5 shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 교수 */}
            <div className="reveal-right card-glow bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-violet-50 to-transparent dark:from-violet-950/30 rounded-bl-3xl" />
              <div className="text-4xl mb-4">👨‍🏫</div>
              <h3 className="text-2xl font-black mb-3 text-violet-600 dark:text-violet-400">교수자</h3>
              <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
                {['강의 맹점 진단으로 품질 개선 포인트 파악', '블룸 분류 분포로 교육 목표 점검', '난이도 타임라인으로 강의 흐름 분석', 'AI 개선 제안으로 강의 완성도 향상', 'PDF 리포트로 강의 평가 자료 생성'].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5 shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* ── CTA 섹션 ── */}
      <section className="py-16 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #06b6d4 100%)', backgroundSize: '200% 200%', animation: 'gradient-shift 6s ease infinite' }} />
        {/* 장식 */}
        <div className="absolute top-0 left-0 right-0 h-px bg-white/20" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-indigo-200 text-base sm:text-lg mb-8 sm:mb-10">교수자와 학생 모두를 위한 AI 강의 플랫폼</p>
          <Link to="/signup"
            className="inline-flex items-center gap-2 px-10 py-4 text-base font-bold text-indigo-600 bg-white rounded-2xl hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 shadow-2xl"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            무료로 시작하기
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer className="py-8 bg-gray-950 text-center text-sm text-gray-600">
        <p>© 2025 LectureMind · Powered by <span className="text-indigo-400">Claude AI</span> & <span className="text-cyan-400">Whisper STT</span></p>
      </footer>
    </div>
  );
}
