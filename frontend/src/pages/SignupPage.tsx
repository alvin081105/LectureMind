import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import ThreeBackground from '../components/common/ThreeBackground';
import type { Role, SignupRequest } from '../types';

export default function SignupPage() {
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('STUDENT');

  const { register, handleSubmit, formState: { errors } } =
    useForm<SignupRequest & { passwordConfirm: string }>();

  const onSubmit = async (data: SignupRequest & { passwordConfirm: string }) => {
    if (data.password !== data.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signup({ email: data.email, password: data.password, name: data.name, role: selectedRole });
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      setError(status === 409 ? '이미 사용 중인 이메일입니다.' : '회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden py-8"
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
        <div className="animate-fade-up text-center mb-6">
          <h1 className="animate-shimmer-text text-3xl font-bold tracking-tight mb-1">
            LectureMind
          </h1>
          <p className="text-sm text-gray-400">계정을 만들어 시작하세요</p>
        </div>

        {/* 역할 선택 */}
        <div className="animate-fade-up delay-100 grid grid-cols-2 gap-3 mb-5">
          {([
            { role: 'STUDENT' as Role, emoji: '🎓', label: '학생' },
            { role: 'PROFESSOR' as Role, emoji: '👨‍🏫', label: '교수' },
          ]).map(({ role, emoji, label }) => (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRole(role)}
              className={`role-card-light py-4 rounded-xl border text-center transition-all ${
                selectedRole === role ? 'selected' : ''
              }`}
              style={{
                background: selectedRole === role ? 'rgba(139,92,246,0.08)' : 'rgba(249,250,251,0.8)',
                borderColor: selectedRole === role ? 'rgba(139,92,246,0.5)' : 'rgba(229,231,235,1)',
              }}
            >
              <div className="text-2xl mb-1">{emoji}</div>
              <p className={`text-xs font-semibold ${selectedRole === role ? 'text-violet-600' : 'text-gray-400'}`}>
                {label}
              </p>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* 이름 */}
          <div className="animate-fade-up delay-150">
            <label className="block text-xs font-medium mb-1.5 text-gray-500">이름</label>
            <input
              {...register('name', { required: '이름을 입력해주세요' })}
              placeholder="홍길동"
              className="input-light w-full px-4 py-2.5 rounded-xl text-sm"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {/* 이메일 */}
          <div className="animate-fade-up delay-200">
            <label className="block text-xs font-medium mb-1.5 text-gray-500">이메일</label>
            <input
              type="email"
              {...register('email', {
                required: '이메일을 입력해주세요',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '올바른 이메일 형식이 아닙니다' },
              })}
              placeholder="your@email.com"
              className="input-light w-full px-4 py-2.5 rounded-xl text-sm"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* 비밀번호 */}
          <div className="animate-fade-up delay-250">
            <label className="block text-xs font-medium mb-1.5 text-gray-500">비밀번호</label>
            <input
              type="password"
              {...register('password', {
                required: '비밀번호를 입력해주세요',
                minLength: { value: 8, message: '8자 이상이어야 합니다' },
                pattern: {
                  value: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
                  message: '영문 + 숫자 + 특수문자 각 1개 이상',
                },
              })}
              placeholder="8자 이상, 영문+숫자+특수문자"
              className="input-light w-full px-4 py-2.5 rounded-xl text-sm"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          {/* 비밀번호 확인 */}
          <div className="animate-fade-up delay-300">
            <label className="block text-xs font-medium mb-1.5 text-gray-500">비밀번호 확인</label>
            <input
              type="password"
              {...register('passwordConfirm', { required: '비밀번호를 다시 입력해주세요' })}
              placeholder="••••••••"
              className="input-light w-full px-4 py-2.5 rounded-xl text-sm"
            />
            {errors.passwordConfirm && <p className="mt-1 text-xs text-red-500">{errors.passwordConfirm.message}</p>}
          </div>

          {/* 에러 */}
          {error && (
            <div className="animate-fade-up px-4 py-3 rounded-xl text-sm bg-red-50 text-red-600 border border-red-100">
              {error}
            </div>
          )}

          {/* 버튼 */}
          <div className="animate-fade-up delay-350 pt-1">
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
                  처리 중...
                </span>
              ) : '회원가입'}
            </button>
          </div>
        </form>

        <p className="animate-fade-up delay-400 mt-5 text-center text-sm text-gray-400">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="font-medium text-violet-600 hover:text-violet-700 transition-colors">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
