import { useState, useMemo } from 'react';
import { Search, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { useMonitorStore, type Monitor, type MonitorStatus } from '@/store/monitorStore';
import { Input } from '@/components/ui/input';

interface MonitorSidebarProps {
  onAddClick: () => void;
}

const StatusIcon = ({ status }: { status: MonitorStatus }) => (
  <div
    className={`monitor-status-indicator ${
      status === 'up' ? '' : ''
    }`}
    style={{
      background:
        status === 'up' ? 'hsl(var(--status-up))' :
        status === 'down' ? 'hsl(var(--status-down))' :
        status === 'maintenance' ? 'hsl(var(--status-maintenance))' :
        'hsl(var(--status-pending))',
      boxShadow:
        status === 'up' ? '0 0 6px hsl(var(--status-up) / 0.4)' :
        status === 'down' ? '0 0 6px hsl(var(--status-down) / 0.4)' :
        'none',
    }}
  />
);

const UptimeBadge = ({ value }: { value: number }) => {
  if (value <= 0) return <span className="text-xs font-mono text-muted-foreground">—</span>;
  const cls = value >= 99 ? 'uptime-excellent' : value >= 95 ? 'uptime-good' : 'uptime-bad';
  return <span className={cls}>{value}%</span>;
};

export const MonitorSidebar = ({ onAddClick }: MonitorSidebarProps) => {
  const monitors = useMonitorStore((s) => s.monitors);
  const selectedId = useMonitorStore((s) => s.selectedMonitorId);
  const selectMonitor = useMonitorStore((s) => s.selectMonitor);
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    let list = monitors.filter(
      (m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.url.toLowerCase().includes(search.toLowerCase()) ||
        m.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    );
    // Sort: down first, then pending, then up
    list.sort((a, b) => {
      const order: Record<string, number> = { down: 0, pending: 1, maintenance: 2, up: 3 };
      const diff = order[a.status] - order[b.status];
      if (diff !== 0) return diff;
      return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });
    return list;
  }, [monitors, search, sortAsc]);

  const up = monitors.filter((m) => m.status === 'up').length;
  const down = monitors.filter((m) => m.status === 'down').length;

  return (
    <aside
      className="w-72 flex-shrink-0 flex flex-col border-r h-full"
      style={{
        background: 'hsl(var(--sidebar-bg))',
        borderColor: 'hsl(var(--sidebar-border))',
      }}
    >
      {/* Summary bar */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold" style={{ color: 'hsl(var(--sidebar-fg))' }}>
            Monitors
          </h2>
          <button
            onClick={onAddClick}
            className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors hover:bg-primary/20"
            style={{ color: 'hsl(var(--primary))' }}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: 'hsl(var(--sidebar-fg) / 0.4)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full h-8 rounded-lg pl-8 pr-3 text-xs border-0 outline-none focus:ring-1 focus:ring-primary/50"
            style={{
              background: 'hsl(var(--sidebar-hover))',
              color: 'hsl(var(--sidebar-fg))',
            }}
          />
        </div>
      </div>

      {/* Monitor list */}
      <div className="flex-1 overflow-y-auto sidebar-scroll">
        {filtered.map((monitor) => (
          <div
            key={monitor.id}
            onClick={() => selectMonitor(monitor.id)}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-150 border-l-[3px] ${
              selectedId === monitor.id
                ? 'border-l-primary'
                : 'border-l-transparent'
            }`}
            style={{
              background: selectedId === monitor.id ? 'hsl(var(--sidebar-active))' : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (selectedId !== monitor.id) {
                e.currentTarget.style.background = 'hsl(var(--sidebar-hover))';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedId !== monitor.id) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <StatusIcon status={monitor.status} />
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{ color: 'hsl(var(--sidebar-fg))' }}
              >
                {monitor.name}
              </p>
              {monitor.paused && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: 'hsl(var(--sidebar-hover))', color: 'hsl(var(--sidebar-fg) / 0.5)' }}>
                  PAUSED
                </span>
              )}
            </div>
            <UptimeBadge value={monitor.uptime24h} />
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-xs" style={{ color: 'hsl(var(--sidebar-fg) / 0.4)' }}>
              No monitors found
            </p>
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="px-4 py-3 border-t flex items-center justify-between text-xs" style={{ borderColor: 'hsl(var(--sidebar-border))', color: 'hsl(var(--sidebar-fg) / 0.5)' }}>
        <span>{monitors.length} monitors</span>
        <div className="flex items-center gap-2">
          {down > 0 && <span style={{ color: 'hsl(var(--status-down))' }}>{down} down</span>}
          <span style={{ color: 'hsl(var(--status-up))' }}>{up} up</span>
        </div>
      </div>
    </aside>
  );
};
