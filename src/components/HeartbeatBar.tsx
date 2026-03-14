import type { Heartbeat } from '@/store/monitorStore';

interface HeartbeatBarProps {
  heartbeats: Heartbeat[];
  maxBars?: number;
}

export const HeartbeatBar = ({ heartbeats, maxBars = 30 }: HeartbeatBarProps) => {
  const displayBeats = heartbeats.slice(-maxBars);
  
  if (displayBeats.length === 0) {
    return (
      <div className="flex items-end gap-[2px] h-6">
        {Array.from({ length: maxBars }).map((_, i) => (
          <div key={i} className="heartbeat-bar flex-1 h-full bg-muted/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-end gap-[2px] h-6">
      {displayBeats.map((hb) => (
        <div
          key={hb.id}
          className={
            hb.status === 'up' ? 'heartbeat-bar-up' :
            hb.status === 'down' ? 'heartbeat-bar-down' :
            'heartbeat-bar-pending'
          }
          style={{ flex: 1, height: '100%' }}
          title={`${hb.status} — ${hb.latency}ms — ${new Date(hb.timestamp).toLocaleTimeString()}`}
        />
      ))}
    </div>
  );
};
