import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import ThreeBackground from '../components/common/ThreeBackground';
import type { LoginRequest } from '../types';

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>();

  const onSubmit = async (data: LoginRequest) => {
    setError('');
    setLoading(true);
    try {
      await login(data);
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #ffffff 0%, #f5f3ff 45%, #eff6ff 100%)' }}
    >
      {/* ── 3D 배경 ── */}
      <ThreeBackground />

      {/* ── 카드 ── */}
      <div
        className="animate-card-in relative z-10 w-full max-w-sm mx-4 rounded-2xl p-8"
        style={{
          background: 'rgba(255,255,255,0.72)',
          border: '1px solid rgba(139,92,246,0.15)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(139,92,246,0.10), 0 1px 0 rgba(255,255,255,0.9) inset',
        }}
      >
        {/* 로고 */}
        <div className="animate-fade-up text-center mb-8">
          <h1 className="animate-shimmer-text text-3xl font-bold tracking-tight mb-1">
            LectureMind
          </h1>
          <p className="text-sm text-gray-400">AI 강의 분석 & 구조화 학습 플랫폼</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 이메일 */}
          <div className="animate-fade-up delay-100">
            <label className="block text-xs font-medium mb-1.5 text-gray-500">이메일</label>
            <input
              type="email"
              {...register('email', { required: '이메일을 입력해주세요' })}
              placeholder="your@email.com"
              className="input-light w-full px-4 py-3 rounded-xl text-sm"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div className="animate-fade-up delay-150">
            <label className="block text-xs font-medium mb-1.5 text-gray-500">비밀번호</label>
            <input
              type="password"
              {...register('password', { required: '비밀번호를 입력해주세요' })}
              placeholder="••••••••"
              className="input-light w-full px-4 py-3 rounded-xl text-sm"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* 에러 */}
          {error && (
            <div className="animate-fade-up px-4 py-3 rounded-xl text-sm bg-red-50 text-red-600 border border-red-100">
              {error}
            </div>
          )}

          {/* 버튼 */}
          <div className="animate-fade-up delay-200 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="btn-shimmer-wrap w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  로그인 중...
                </span>
              ) : '로그인'}
            </button>
          </div>
        </form>

        <p className="animate-fade-up delay-300 mt-6 text-center text-sm text-gray-400">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="font-medium text-violet-600 hover:text-violet-700 transition-colors">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
