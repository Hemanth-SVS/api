import { motion } from 'framer-motion';
import { Trash2, Pause, Play, Copy, ExternalLink, Clock, Wifi, Activity, TrendingUp, AlertTriangle, Settings } from 'lucide-react';
import { useMonitorStore } from '@/store/monitorStore';
import { HeartbeatBar } from '@/components/HeartbeatBar';
import { LatencyChart } from '@/components/LatencyChart';
import { AIInsightBadge } from '@/components/AIInsightBadge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export const MonitorDetailView = () => {
  const selectedId = useMonitorStore((s) => s.selectedMonitorId);
  const monitor = useMonitorStore((s) => s.monitors.find((m) => m.id === selectedId));
  const deleteMonitor = useMonitorStore((s) => s.deleteMonitor);
  const togglePause = useMonitorStore((s) => s.togglePause);
  const { toast } = useToast();

  if (!monitor) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Select a monitor to view details</p>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    deleteMonitor(monitor.id);
    toast({ title: 'Monitor deleted', description: `${monitor.name} has been removed.` });
  };

  const handlePause = () => {
    togglePause(monitor.id);
    toast({
      title: monitor.paused ? 'Monitor resumed' : 'Monitor paused',
      description: `${monitor.name} monitoring ${monitor.paused ? 'resumed' : 'paused'}.`,
    });
  };

  const statusLabel = monitor.status === 'up' ? 'Up' : monitor.status === 'down' ? 'Down' : monitor.status === 'maintenance' ? 'Maintenance' : 'Pending';
  const statusColor = monitor.status === 'up' ? 'bg-primary text-primary-foreground' : monitor.status === 'down' ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground';

  const lastPing = monitor.heartbeats.length > 0 ? monitor.heartbeats[monitor.heartbeats.length - 1] : null;

  return (
    <div className="flex-1 overflow-y-auto">
      <motion.div
        key={monitor.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="max-w-5xl mx-auto p-6 space-y-5"
      >
        {/* Title section */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{monitor.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                {statusLabel}
              </span>
              {monitor.paused && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  Paused
                </span>
              )}
            </div>
            <a
              href={monitor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mt-1.5 font-mono transition-colors"
            >
              {monitor.method} {monitor.url}
              <ExternalLink className="h-3 w-3" />
            </a>
            {monitor.description && (
              <p className="text-sm text-muted-foreground mt-1">{monitor.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handlePause}>
              {monitor.paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              {monitor.paused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              icon: Clock,
              label: 'Response Time',
              value: lastPing && lastPing.latency > 0 ? `${lastPing.latency}ms` : 'N/A',
              sub: `avg ${monitor.avgLatency}ms`,
            },
            {
              icon: TrendingUp,
              label: 'Uptime (24h)',
              value: `${monitor.uptime24h}%`,
              sub: monitor.uptime24h >= 99.9 ? 'Excellent' : monitor.uptime24h >= 99 ? 'Good' : 'Degraded',
            },
            {
              icon: Wifi,
              label: 'Check Interval',
              value: `${monitor.interval}s`,
              sub: `Every ${Math.round(monitor.interval / 60) || 1} min`,
            },
            {
              icon: Activity,
              label: 'Total Checks',
              value: monitor.heartbeats.length.toString(),
              sub: monitor.lastChecked ? `Last: ${new Date(monitor.lastChecked).toLocaleTimeString()}` : 'Never',
            },
          ].map((stat) => (
            <div key={stat.label} className="card-surface p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
              </div>
              <p className="text-xl font-bold font-mono">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* AI Diagnostic */}
        {monitor.aiDiagnostic && (
          <AIInsightBadge text={monitor.aiDiagnostic} full />
        )}

        {/* Heartbeat section */}
        <div className="card-surface p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Heartbeat</h3>
            <span className="text-xs text-muted-foreground font-mono">
              Last {Math.min(monitor.heartbeats.length, 50)} checks
            </span>
          </div>
          <HeartbeatBar heartbeats={monitor.heartbeats} maxBars={60} height={36} />
        </div>

        {/* Latency chart */}
        <LatencyChart heartbeats={monitor.heartbeats} />

        {/* Recent events */}
        <div className="card-surface p-5">
          <h3 className="text-sm font-semibold mb-3">Recent Events</h3>
          <div className="space-y-0">
            {monitor.heartbeats.slice(-15).reverse().map((hb) => (
              <div key={hb.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={hb.status === 'up' ? 'status-dot-up' : 'status-dot-down'} />
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    hb.status === 'up'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-destructive/10 text-destructive'
                  }`}>
                    {hb.statusCode || '—'}
                  </span>
                  {hb.message && (
                    <span className="text-xs text-muted-foreground">{hb.message}</span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-muted-foreground">
                    {hb.latency > 0 ? `${hb.latency}ms` : '—'}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {new Date(hb.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {monitor.heartbeats.length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No events yet — waiting for first check
              </p>
            )}
          </div>
        </div>

        {/* Configuration */}
        <div className="card-surface p-5">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Configuration</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
            {[
              { label: 'Method', value: monitor.method },
              { label: 'Accepted Codes', value: monitor.acceptedStatusCodes },
              { label: 'Max Redirects', value: monitor.maxRedirects },
              { label: 'Retries', value: monitor.retries },
              { label: 'Interval', value: `${monitor.interval}s` },
              { label: 'Created', value: new Date(monitor.createdAt).toLocaleDateString() },
            ].map((c) => (
              <div key={c.label}>
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="font-mono text-sm mt-0.5">{c.value}</p>
              </div>
            ))}
          </div>
          {monitor.tags.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1.5">Tags</p>
              <div className="flex gap-1.5 flex-wrap">
                {monitor.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded text-xs bg-accent text-accent-foreground font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
