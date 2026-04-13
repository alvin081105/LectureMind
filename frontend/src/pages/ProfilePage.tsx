import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/authApi';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser, clearAuth } = useAuthStore();

  // 이름 변경
  const [name, setName] = useState(user?.name ?? '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMsg, setNameMsg] = useState('');

  // 비밀번호 변경
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  // 회원탈퇴
  const [deletePw, setDeletePw] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setNameLoading(true);
    setNameMsg('');
    try {
      const res = await authApi.updateProfile(name.trim());
      updateUser({ name: res.data.name });
      setNameMsg('✓ 이름이 변경되었습니다.');
    } catch {
      setNameMsg('이름 변경에 실패했습니다.');
    } finally {
      setNameLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) { setPwMsg('새 비밀번호가 일치하지 않습니다.'); return; }
    if (newPw.length < 8) { setPwMsg('새 비밀번호는 8자 이상이어야 합니다.'); return; }
    setPwLoading(true);
    setPwMsg('');
    try {
      await authApi.changePassword(currentPw, newPw);
      setPwMsg('✓ 비밀번호가 변경되었습니다.');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (e: any) {
      setPwMsg(e?.response?.data?.message ?? '비밀번호 변경에 실패했습니다.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePw) return;
    setDeleteLoading(true);
    try {
      await authApi.deleteAccount(deletePw);
      clearAuth();
      navigate('/');
    } catch (e: any) {
      alert(e?.response?.data?.message ?? '회원탈퇴에 실패했습니다.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 transition-colors';

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
          ← 뒤로
        </button>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">프로필 설정</h2>
      </div>

      {/* 계정 정보 */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xl font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">{user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300">
              {user?.role === 'STUDENT' ? '학생' : '교수'}
            </span>
          </div>
        </div>
      </div>

      {/* 이름 변경 */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
        <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">이름 변경</h3>
        <form onSubmit={handleUpdateName} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="새 이름"
            className={inputClass}
          />
          {nameMsg && (
            <p className={`text-sm ${nameMsg.startsWith('✓') ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
              {nameMsg}
            </p>
          )}
          <button
            type="submit"
            disabled={nameLoading || !name.trim()}
            className="w-full py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {nameLoading ? '변경 중...' : '이름 변경'}
          </button>
        </form>
      </div>

      {/* 비밀번호 변경 */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
        <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">비밀번호 변경</h3>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <input
            type="password"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            placeholder="현재 비밀번호"
            className={inputClass}
          />
          <input
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            placeholder="새 비밀번호 (8자 이상)"
            className={inputClass}
          />
          <input
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            placeholder="새 비밀번호 확인"
            className={inputClass}
          />
          {pwMsg && (
            <p className={`text-sm ${pwMsg.startsWith('✓') ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
              {pwMsg}
            </p>
          )}
          <button
            type="submit"
            disabled={pwLoading || !currentPw || !newPw || !confirmPw}
            className="w-full py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {pwLoading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>
      </div>

      {/* 회원탈퇴 */}
      <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/50 rounded-2xl p-6">
        <h3 className="text-base font-semibold text-red-600 dark:text-red-400 mb-2">회원 탈퇴</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          탈퇴 시 모든 강의, 노트, 퀴즈 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-2.5 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            회원 탈퇴
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">확인을 위해 비밀번호를 입력하세요.</p>
            <input
              type="password"
              value={deletePw}
              onChange={(e) => setDeletePw(e.target.value)}
              placeholder="비밀번호"
              className={inputClass}
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeletePw(''); }}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading || !deletePw}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deleteLoading ? '처리 중...' : '탈퇴 확인'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
