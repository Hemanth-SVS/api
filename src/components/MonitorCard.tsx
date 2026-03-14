import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Monitor } from '@/store/monitorStore';
import { HeartbeatBar } from './HeartbeatBar';
import { AIInsightBadge } from './AIInsightBadge';

interface MonitorCardProps {
  monitor: Monitor;
}

export const MonitorCard = ({ monitor }: MonitorCardProps) => {
  const navigate = useNavigate();
  const isUp = monitor.status === 'up';
  const isDown = monitor.status === 'down';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={() => navigate(`/monitor/${monitor.id}`)}
      className="card-surface p-4 cursor-pointer hover:border-foreground/10 transition-colors"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-foreground truncate">{monitor.name}</h3>
          <p className="mono text-muted-foreground truncate mt-0.5">{monitor.url}</p>
        </div>
        <div className={
          isUp ? 'status-dot-up' :
          isDown ? 'status-dot-down' :
          'status-dot-pending'
        } />
      </div>

      <HeartbeatBar heartbeats={monitor.heartbeats} />

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          <span className="mono text-muted-foreground">
            {monitor.interval}s
          </span>
          {monitor.avgLatency > 0 && (
            <span className="mono text-muted-foreground">
              {monitor.avgLatency}ms
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {monitor.uptime24h > 0 && (
            <span className={`mono ${monitor.uptime24h >= 99 ? 'text-primary' : monitor.uptime24h >= 95 ? 'text-warning' : 'text-destructive'}`}>
              {monitor.uptime24h}%
            </span>
          )}
          {monitor.status === 'pending' && (
            <span className="mono text-warning">pending</span>
          )}
        </div>
      </div>

      {monitor.aiDiagnostic && <AIInsightBadge text={monitor.aiDiagnostic} />}
    </motion.div>
  );
};
