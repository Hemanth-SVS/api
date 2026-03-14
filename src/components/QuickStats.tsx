import { motion } from 'framer-motion';
import type { Monitor } from '@/store/monitorStore';

interface QuickStatsProps {
  monitors: Monitor[];
}

export const QuickStats = ({ monitors }: QuickStatsProps) => {
  const up = monitors.filter((m) => m.status === 'up').length;
  const down = monitors.filter((m) => m.status === 'down').length;
  const pending = monitors.filter((m) => m.status === 'pending').length;
  const total = monitors.length;

  const stats = [
    { label: 'Total', value: total, color: 'text-foreground' },
    { label: 'Up', value: up, color: 'text-primary' },
    { label: 'Down', value: down, color: 'text-destructive' },
    { label: 'Pending', value: pending, color: 'text-warning' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-surface p-4 text-center"
        >
          <p className={`stat-value ${stat.color}`}>{stat.value}</p>
          <p className="stat-label mt-1">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
};
