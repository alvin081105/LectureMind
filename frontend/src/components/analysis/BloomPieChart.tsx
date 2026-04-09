import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { BLOOM_COLORS, BLOOM_LEVELS } from '../../constants/bloomColors';
import type { BloomLevel } from '../../types';

interface BloomPieChartProps {
  distribution: Record<BloomLevel, number>;
}

export default function BloomPieChart({ distribution }: BloomPieChartProps) {
  const data = BLOOM_LEVELS
    .filter((l) => (distribution[l] ?? 0) > 0)
    .map((level) => ({
      name: BLOOM_COLORS[level].label,
      value: distribution[level],
      color: BLOOM_COLORS[level].text,
      bg: BLOOM_COLORS[level].bg,
    }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={false} labelLine={false}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value}%`} />
      </PieChart>
    </ResponsiveContainer>
  );
}
