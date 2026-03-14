import { useState, useRef } from 'react';
import type { Heartbeat } from '@/store/monitorStore';

interface HeartbeatBarProps {
  heartbeats: Heartbeat[];
  maxBars?: number;
  height?: number;
}

export const HeartbeatBar = ({ heartbeats, maxBars = 50, height = 28 }: HeartbeatBarProps) => {
  const [tooltip, setTooltip] = useState<{ x: number; text: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayBeats = heartbeats.slice(-maxBars);

  if (displayBeats.length === 0) {
    return (
      <div className="flex items-end gap-[2px]" style={{ height }}>
        {Array.from({ length: maxBars }).map((_, i) => (
          <div key={i} className="heartbeat-bar-empty flex-1" style={{ height: '100%' }} />
        ))}
      </div>
    );
  }

  const handleMouseEnter = (hb: Heartbeat, e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = new Date(hb.timestamp).toLocaleTimeString();
    const text = `${hb.status.toUpperCase()} · ${hb.latency > 0 ? hb.latency + 'ms' : 'N/A'} · ${time}`;
    setTooltip({ x, text });
  };

  return (
    <div ref={containerRef} className="relative flex items-end gap-[2px]" style={{ height }}>
      {displayBeats.map((hb) => (
        <div
          key={hb.id}
          className={
            hb.status === 'up' ? 'heartbeat-bar-up' :
            hb.status === 'down' ? 'heartbeat-bar-down' :
            'heartbeat-bar-pending'
          }
          style={{
            flex: 1,
            height: hb.status === 'up'
              ? `${Math.max(40, Math.min(100, (hb.latency / 400) * 100))}%`
              : '100%',
          }}
          onMouseEnter={(e) => handleMouseEnter(hb, e)}
          onMouseLeave={() => setTooltip(null)}
        />
      ))}
      {tooltip && (
        <div
          className="hb-tooltip"
          style={{ left: tooltip.x, top: -4 }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};
