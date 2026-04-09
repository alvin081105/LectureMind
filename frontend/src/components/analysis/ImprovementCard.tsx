import type { Improvement } from '../../types';

const ISSUE_LABELS: Record<string, string> = {
  DIFFICULTY_SPIKE: '난이도 급상승',
  MISSING_PREREQUISITE: '전제 지식 누락',
  INSUFFICIENT_EXPLANATION: '설명 부족',
};

const ISSUE_COLORS: Record<string, string> = {
  DIFFICULTY_SPIKE: 'bg-red-50 border-red-200 text-red-700',
  MISSING_PREREQUISITE: 'bg-orange-50 border-orange-200 text-orange-700',
  INSUFFICIENT_EXPLANATION: 'bg-yellow-50 border-yellow-200 text-yellow-700',
};

const PRIORITY_LABELS: Record<string, string> = {
  HIGH: '높음',
  MEDIUM: '보통',
  LOW: '낮음',
};

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-gray-100 text-gray-600',
};

interface ImprovementCardProps {
  improvement: Improvement;
  onClick?: () => void;
}

export default function ImprovementCard({ improvement, onClick }: ImprovementCardProps) {
  return (
    <div
      onClick={onClick}
      className={`border rounded-xl p-4 space-y-2 cursor-pointer hover:shadow-sm transition-shadow ${ISSUE_COLORS[improvement.issueType]}`}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{ISSUE_LABELS[improvement.issueType]}</span>
          <span className="text-xs text-gray-500">{improvement.startTime}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[improvement.priority]}`}>
          우선순위: {PRIORITY_LABELS[improvement.priority]}
        </span>
      </div>

      <p className="text-sm font-medium">{improvement.targetSection}</p>
      <p className="text-xs opacity-80">{improvement.issue}</p>

      <div className="pt-1 border-t border-current/10">
        <p className="text-xs font-medium mb-0.5">제안</p>
        <p className="text-xs opacity-80">{improvement.suggestion}</p>
      </div>
    </div>
  );
}
