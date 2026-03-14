import { useEffect, useRef } from 'react';
import { useMonitorStore } from '@/store/monitorStore';
import type { Heartbeat } from '@/store/monitorStore';

export const useRealtimeSimulation = () => {
  const monitors = useMonitorStore((s) => s.monitors);
  const addHeartbeat = useMonitorStore((s) => s.addHeartbeat);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const activeMonitors = monitors.filter(m => !m.paused && m.status !== 'pending');
      if (activeMonitors.length === 0) return;

      // Pick a random monitor to simulate a heartbeat
      const monitor = activeMonitors[Math.floor(Math.random() * activeMonitors.length)];
      
      const isDown = monitor.status === 'down' ? Math.random() < 0.7 : Math.random() < 0.03;
      const status = isDown ? 'down' as const : 'up' as const;
      const baseLatency = monitor.avgLatency > 0 ? monitor.avgLatency : 100;
      const variance = Math.floor(Math.random() * 80) - 40;
      const spike = Math.random() < 0.08 ? Math.floor(Math.random() * 300) : 0;

      const heartbeat: Heartbeat = {
        id: `${monitor.id}-hb-${Date.now()}`,
        monitorId: monitor.id,
        status,
        latency: status === 'up' ? Math.max(10, baseLatency + variance + spike) : 0,
        statusCode: status === 'up' ? 200 : 0,
        timestamp: new Date(),
        message: status === 'down' ? 'Connection refused' : undefined,
      };

      addHeartbeat(monitor.id, heartbeat);
    }, 3000);

    return () => clearInterval(intervalRef.current);
  }, [monitors.length]);
};
