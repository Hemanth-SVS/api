import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, Pause, Copy, ExternalLink } from 'lucide-react';
import { useMonitorStore } from '@/store/monitorStore';
import { Header } from '@/components/Header';
import { HeartbeatBar } from '@/components/HeartbeatBar';
import { LatencyChart } from '@/components/LatencyChart';
import { AIInsightBadge } from '@/components/AIInsightBadge';
import { Button } from '@/components/ui/button';

const MonitorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const monitor = useMonitorStore((s) => s.getMonitor(id || ''));
  const deleteMonitor = useMonitorStore((s) => s.deleteMonitor);

  if (!monitor) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Monitor not found</p>
          <Button variant="ghost" onClick={() => navigate('/')} className="mt-4">Go back</Button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    deleteMonitor(monitor.id);
    navigate('/');
  };

  const statusLabel = monitor.status === 'up' ? 'Operational' : monitor.status === 'down' ? 'Down' : 'Pending';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </button>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{monitor.name}</h1>
                <span className="mono text-muted-foreground">#{monitor.id}</span>
              </div>
              <a
                href={monitor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mono text-accent hover:underline flex items-center gap-1 mt-1"
              >
                {monitor.url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              monitor.status === 'up' ? 'bg-primary/20 text-primary' :
              monitor.status === 'down' ? 'bg-destructive/20 text-destructive' :
              'bg-warning/20 text-warning'
            }`}>
              {statusLabel}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Pause className="h-3.5 w-3.5" />
              Pause
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Copy className="h-3.5 w-3.5" />
              Clone
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </motion.div>

        {/* Heartbeat */}
        <div className="card-surface p-4">
          <p className="stat-label mb-3">Heartbeat History</p>
          <HeartbeatBar heartbeats={monitor.heartbeats} maxBars={50} />
          <p className="mono text-muted-foreground mt-2">
            Check every {monitor.interval} seconds ({Math.round(monitor.interval / 60)} minute{monitor.interval >= 120 ? 's' : ''})
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Response', value: monitor.avgLatency > 0 ? `${monitor.avgLatency}ms` : 'N/A' },
            { label: 'Avg Response (24h)', value: monitor.avgLatency > 0 ? `${monitor.avgLatency}ms` : 'N/A' },
            { label: 'Uptime (24h)', value: `${monitor.uptime24h}%` },
            { label: 'Uptime (30d)', value: `${monitor.uptime30d}%` },
            { label: 'Method', value: monitor.method },
          ].map((s) => (
            <div key={s.label} className="card-surface p-3 text-center">
              <p className="stat-label">{s.label}</p>
              <p className="text-lg font-bold font-mono mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* AI Diagnostic */}
        {monitor.aiDiagnostic && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AIInsightBadge text={monitor.aiDiagnostic} full />
          </motion.div>
        )}

        {/* Latency chart */}
        <LatencyChart heartbeats={monitor.heartbeats} />

        {/* Recent Events */}
        <div className="card-surface p-4">
          <p className="stat-label mb-3">Recent Events</p>
          <div className="space-y-2">
            {monitor.heartbeats.slice(-10).reverse().map((hb) => (
              <div key={hb.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={hb.status === 'up' ? 'status-dot-up' : 'status-dot-down'} />
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    hb.status === 'up' ? 'bg-primary/15 text-primary' : 'bg-destructive/15 text-destructive'
                  }`}>
                    {hb.status === 'up' ? 'Up' : 'Down'}
                  </span>
                </div>
                <span className="mono text-muted-foreground">
                  {new Date(hb.timestamp).toLocaleString()}
                </span>
                <span className="mono text-muted-foreground">
                  {hb.latency > 0 ? `${hb.latency}ms` : '—'}
                </span>
              </div>
            ))}
            {monitor.heartbeats.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No events yet</p>
            )}
          </div>
        </div>

        {/* Config */}
        <div className="card-surface p-4">
          <p className="stat-label mb-3">Configuration</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {[
              { label: 'Accepted Codes', value: monitor.acceptedStatusCodes },
              { label: 'Max Redirects', value: monitor.maxRedirects },
              { label: 'Retries', value: monitor.retries },
              { label: 'Interval', value: `${monitor.interval}s` },
              { label: 'Created', value: new Date(monitor.createdAt).toLocaleDateString() },
            ].map((c) => (
              <div key={c.label}>
                <p className="text-muted-foreground text-xs">{c.label}</p>
                <p className="font-mono mt-0.5">{c.value}</p>
              </div>
            ))}
            {monitor.description && (
              <div className="col-span-full">
                <p className="text-muted-foreground text-xs">Description</p>
                <p className="mt-0.5">{monitor.description}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MonitorDetailPage;
