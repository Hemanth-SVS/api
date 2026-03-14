import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import type { Heartbeat } from '@/store/monitorStore';

interface LatencyChartProps {
  heartbeats: Heartbeat[];
}

export const LatencyChart = ({ heartbeats }: LatencyChartProps) => {
  const data = heartbeats
    .filter((hb) => hb.status === 'up')
    .map((hb) => ({
      time: new Date(hb.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      latency: hb.latency,
    }));

  if (data.length === 0) {
    return (
      <div className="card-surface p-6 flex items-center justify-center h-48">
        <p className="mono text-muted-foreground">No latency data available</p>
      </div>
    );
  }

  return (
    <div className="card-surface p-4">
      <p className="stat-label mb-3">Response Time (ms)</p>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(145, 63%, 49%)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(145, 63%, 49%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: 'hsl(240, 5%, 45%)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'hsl(240, 5%, 45%)' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(240, 5%, 9%)',
              border: '1px solid hsl(240, 4%, 16%)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Area
            type="monotone"
            dataKey="latency"
            stroke="hsl(145, 63%, 49%)"
            strokeWidth={2}
            fill="url(#latencyGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
