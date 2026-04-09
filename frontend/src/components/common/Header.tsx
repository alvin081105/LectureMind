import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-indigo-600">LectureMind</span>
          <span className="text-xs text-gray-400 font-medium hidden sm:block">AI 강의 분석 플랫폼</span>
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <span className="text-sm text-gray-600 hidden sm:block">
                {user.name}
                <span className="ml-2 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full">
                  {user.role === 'STUDENT' ? '학생' : '교수'}
                </span>
              </span>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                로그아웃
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
