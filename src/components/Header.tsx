import { Activity, Zap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useMonitorStore } from '@/store/monitorStore';

export const Header = () => {
  const location = useLocation();
  const monitors = useMonitorStore((s) => s.monitors);
  const up = monitors.filter((m) => m.status === 'up').length;
  const anomalies = monitors.filter((m) => m.aiDiagnostic).length;

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-sm tracking-tight">LUMEN</span>
        </Link>

        <div className="flex items-center gap-4">
          <p className="hidden sm:block mono text-muted-foreground">
            {up} nodes active
            {anomalies > 0 && (
              <span className="text-accent"> · SLM analyzing {anomalies} anomal{anomalies === 1 ? 'y' : 'ies'}</span>
            )}
          </p>
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              location.pathname === '/'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
};
