import { Activity, Sun, Moon, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMonitorStore } from '@/store/monitorStore';
import { useState } from 'react';

export const Header = () => {
  const monitors = useMonitorStore((s) => s.monitors);
  const up = monitors.filter((m) => m.status === 'up').length;
  const down = monitors.filter((m) => m.status === 'down').length;
  const total = monitors.length;

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-5 flex-shrink-0">
      <Link to="/" className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <Activity className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-base tracking-tight">Lumen</span>
      </Link>

      <div className="flex items-center gap-5">
        <div className="hidden sm:flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">{up} Up</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-destructive" />
            <span className="text-muted-foreground">{down} Down</span>
          </div>
          <span className="text-muted-foreground">{total} Total</span>
        </div>

        <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
          <Bell className="h-4 w-4 text-muted-foreground" />
          {down > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
              {down}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
