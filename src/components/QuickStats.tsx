import type { Monitor } from '@/store/monitorStore';
import { Activity, ArrowUp, ArrowDown, Clock } from 'lucide-react';

interface QuickStatsProps {
  monitors: Monitor[];
}

export const QuickStats = ({ monitors }: QuickStatsProps) => {
  const up = monitors.filter((m) => m.status === 'up').length;
  const down = monitors.filter((m) => m.status === 'down').length;
  const pending = monitors.filter((m) => m.status === 'pending').length;
  const avgLatency = monitors.filter(m => m.avgLatency > 0).length > 0
    ? Math.round(monitors.filter(m => m.avgLatency > 0).reduce((sum, m) => sum + m.avgLatency, 0) / monitors.filter(m => m.avgLatency > 0).length)
    : 0;

  const overallUptime = monitors.filter(m => m.uptime24h > 0).length > 0
    ? (monitors.filter(m => m.uptime24h > 0).reduce((sum, m) => sum + m.uptime24h, 0) / monitors.filter(m => m.uptime24h > 0).length).toFixed(2)
    : '0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {[
        { icon: Activity, label: 'Total', value: monitors.length, color: 'text-foreground' },
        { icon: ArrowUp, label: 'Up', value: up, color: 'text-primary' },
        { icon: ArrowDown, label: 'Down', value: down, color: 'text-destructive' },
        { icon: Clock, label: 'Avg Latency', value: `${avgLatency}ms`, color: 'text-foreground' },
        { icon: Activity, label: 'Uptime', value: `${overallUptime}%`, color: 'text-primary' },
      ].map((stat) => (
        <div key={stat.label} className="card-surface p-3 text-center">
          <p className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};
