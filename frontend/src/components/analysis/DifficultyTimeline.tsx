import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { DifficultyPoint, Improvement } from '../../types';

const ISSUE_COLORS: Record<string, string> = {
  DIFFICULTY_SPIKE: '#ef4444',
  MISSING_PREREQUISITE: '#f97316',
  INSUFFICIENT_EXPLANATION: '#eab308',
};

interface DifficultyTimelineProps {
  timeline: DifficultyPoint[];
  improvements: Improvement[];
  onSelectImprovement?: (imp: Improvement) => void;
}

export default function DifficultyTimeline({ timeline, improvements, onSelectImprovement: _onSelectImprovement }: DifficultyTimelineProps) {
  // 구 필드명(difficultyScore, startTime)과 신 필드명(difficulty, time) 모두 호환
  const normalizedTimeline = timeline.map((p) => ({
    time: (p as any).time ?? (p as any).startTime ?? '',
    difficulty: (p as any).difficulty ?? (p as any).difficultyScore ?? 0,
    issueType: p.issueType,
  }));

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={normalizedTimeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="diffGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Area type="monotone" dataKey="difficulty" stroke="#6366f1" fill="url(#diffGrad)" strokeWidth={2} />
          {improvements.map((imp) => (
            <ReferenceLine
              key={imp.id}
              x={imp.startTime}
              stroke={ISSUE_COLORS[imp.issueType] ?? '#6b7280'}
              strokeWidth={2}
              strokeDasharray="4 2"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex gap-4 text-xs text-gray-500">
        {Object.entries(ISSUE_COLORS).map(([type, color]) => (
          <span key={type} className="flex items-center gap-1">
            <span className="w-3 h-0.5 inline-block" style={{ backgroundColor: color }} />
            {type === 'DIFFICULTY_SPIKE' ? '난이도 급상승' : type === 'MISSING_PREREQUISITE' ? '전제 지식 누락' : '설명 부족'}
          </span>
        ))}
      </div>
    </div>
  );
}
