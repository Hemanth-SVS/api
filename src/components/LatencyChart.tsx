import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { Heartbeat } from '@/store/monitorStore';

interface LatencyChartProps {
  heartbeats: Heartbeat[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-surface px-3 py-2 shadow-lg text-xs">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-mono font-bold text-foreground">{payload[0].value}ms</p>
    </div>
  );
};

export const LatencyChart = ({ heartbeats }: LatencyChartProps) => {
  const data = heartbeats
    .filter((hb) => hb.status === 'up')
    .slice(-40)
    .map((hb) => ({
      time: new Date(hb.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      latency: hb.latency,
    }));

  if (data.length === 0) {
    return (
      <div className="card-surface p-6 flex items-center justify-center h-48">
        <p className="text-sm text-muted-foreground">No latency data available</p>
      </div>
    );
  }

  return (
    <div className="card-surface p-5">
      <h3 className="text-sm font-semibold mb-3">Response Time</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 88%)" opacity={0.3} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: 'hsl(220, 10%, 46%)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'hsl(220, 10%, 46%)' }}
            axisLine={false}
            tickLine={false}
            width={40}
            unit="ms"
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="latency"
            stroke="hsl(142, 71%, 45%)"
            strokeWidth={2}
            fill="url(#latencyGrad)"
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
