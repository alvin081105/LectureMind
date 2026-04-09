import {
  Radar,
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import { BLOOM_COLORS, BLOOM_LEVELS } from '../../constants/bloomColors';
import type { QuizResult } from '../../types';

interface RadarChartProps {
  result: QuizResult;
}

export default function RadarChart({ result }: RadarChartProps) {
  const data = BLOOM_LEVELS.map((level) => {
    const levelData = result.scoreByLevel[level];
    const rate = levelData?.total > 0 ? Math.round((levelData.correct / levelData.total) * 100) : 0;
    return { level: BLOOM_COLORS[level].label, rate };
  });

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ReRadarChart data={data}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis dataKey="level" tick={{ fontSize: 12, fill: '#6b7280' }} />
        <Radar name="정답률" dataKey="rate" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
      </ReRadarChart>
    </ResponsiveContainer>
  );
}
