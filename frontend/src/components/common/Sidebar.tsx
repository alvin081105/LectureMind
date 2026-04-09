import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const STUDENT_ITEMS: NavItem[] = [
  { to: '/student', label: '대시보드', icon: '🏠' },
  { to: '/student/learning', label: '학습 경로', icon: '🗺️' },
];

const PROFESSOR_ITEMS: NavItem[] = [
  { to: '/professor', label: '대시보드', icon: '🏠' },
];

export default function Sidebar() {
  const role = useAuthStore((s) => s.user?.role);
  const items = role === 'PROFESSOR' ? PROFESSOR_ITEMS : STUDENT_ITEMS;

  return (
    <aside className="w-56 shrink-0 hidden md:flex flex-col bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4 flex flex-col gap-1 mt-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.split('/').length === 2}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
