import { create } from 'zustand';

export type MonitorStatus = 'up' | 'down' | 'pending' | 'maintenance';

export interface Heartbeat {
  id: string;
  monitorId: string;
  status: MonitorStatus;
  latency: number;
  statusCode: number;
  timestamp: Date;
  message?: string;
}

export interface Monitor {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'PATCH';
  interval: number;
  status: MonitorStatus;
  lastChecked: Date | null;
  avgLatency: number;
  uptime24h: number;
  uptime30d: number;
  heartbeats: Heartbeat[];
  aiDiagnostic: string | null;
  createdAt: Date;
  acceptedStatusCodes: string;
  maxRedirects: number;
  retries: number;
  description: string;
  tags: string[];
  paused: boolean;
}

const generateHeartbeats = (monitorId: string, status: MonitorStatus, count: number = 50): Heartbeat[] => {
  return Array.from({ length: count }, (_, i) => {
    const isDown = status === 'down' && i >= count - 3;
    const isRandomDown = !isDown && Math.random() < 0.03;
    const hbStatus: MonitorStatus = isDown || isRandomDown ? 'down' : 'up';
    const baseLatency = Math.floor(Math.random() * 150) + 30;
    const spike = Math.random() < 0.1 ? Math.floor(Math.random() * 400) : 0;
    return {
      id: `${monitorId}-hb-${i}`,
      monitorId,
      status: hbStatus,
      latency: hbStatus === 'up' ? baseLatency + spike : 0,
      statusCode: hbStatus === 'up' ? 200 : (hbStatus === 'down' ? 0 : 200),
      timestamp: new Date(Date.now() - (count - i) * 60000),
      message: hbStatus === 'down' ? 'Connection timeout' : undefined,
    };
  });
};

const initialMonitors: Monitor[] = [
  {
    id: '1',
    name: 'Production API',
    url: 'https://api.example.com/health',
    method: 'GET',
    interval: 60,
    status: 'up',
    lastChecked: new Date(),
    avgLatency: 142,
    uptime24h: 99.8,
    uptime30d: 99.95,
    heartbeats: generateHeartbeats('1', 'up'),
    aiDiagnostic: null,
    createdAt: new Date(Date.now() - 86400000 * 30),
    acceptedStatusCodes: '200-299',
    maxRedirects: 10,
    retries: 0,
    description: 'Main production API health endpoint',
    tags: ['production', 'api'],
    paused: false,
  },
  {
    id: '2',
    name: 'Auth Service',
    url: 'https://auth.example.com/status',
    method: 'GET',
    interval: 30,
    status: 'up',
    lastChecked: new Date(),
    avgLatency: 89,
    uptime24h: 100,
    uptime30d: 99.99,
    heartbeats: generateHeartbeats('2', 'up'),
    aiDiagnostic: null,
    createdAt: new Date(Date.now() - 86400000 * 45),
    acceptedStatusCodes: '200-299',
    maxRedirects: 5,
    retries: 1,
    description: 'Authentication microservice',
    tags: ['auth', 'critical'],
    paused: false,
  },
  {
    id: '3',
    name: 'Payment Gateway',
    url: 'https://payments.example.com/ping',
    method: 'GET',
    interval: 60,
    status: 'down',
    lastChecked: new Date(),
    avgLatency: 0,
    uptime24h: 87.5,
    uptime30d: 98.2,
    heartbeats: generateHeartbeats('3', 'down'),
    aiDiagnostic: 'DNS resolution failure detected. The CNAME record for payments.example.com is returning NXDOMAIN. Likely cause: expired domain or misconfigured DNS zone file. Recommend checking DNS provider and verifying zone records.',
    createdAt: new Date(Date.now() - 86400000 * 60),
    acceptedStatusCodes: '200-299',
    maxRedirects: 10,
    retries: 3,
    description: 'Stripe payment processing endpoint',
    tags: ['payments', 'critical'],
    paused: false,
  },
  {
    id: '4',
    name: 'CDN Origin',
    url: 'https://cdn.example.com/health',
    method: 'HEAD',
    interval: 120,
    status: 'up',
    lastChecked: new Date(),
    avgLatency: 34,
    uptime24h: 100,
    uptime30d: 100,
    heartbeats: generateHeartbeats('4', 'up', 40),
    aiDiagnostic: null,
    createdAt: new Date(Date.now() - 86400000 * 15),
    acceptedStatusCodes: '200-299',
    maxRedirects: 0,
    retries: 0,
    description: 'CDN origin server',
    tags: ['cdn', 'infrastructure'],
    paused: false,
  },
  {
    id: '5',
    name: 'Database Proxy',
    url: 'https://db-proxy.example.com/status',
    method: 'GET',
    interval: 60,
    status: 'pending',
    lastChecked: null,
    avgLatency: 0,
    uptime24h: 0,
    uptime30d: 0,
    heartbeats: [],
    aiDiagnostic: null,
    createdAt: new Date(),
    acceptedStatusCodes: '200-299',
    maxRedirects: 10,
    retries: 0,
    description: 'Newly added — awaiting first check',
    tags: ['database'],
    paused: false,
  },
  {
    id: '6',
    name: 'Notification Service',
    url: 'https://notify.example.com/health',
    method: 'GET',
    interval: 60,
    status: 'up',
    lastChecked: new Date(),
    avgLatency: 67,
    uptime24h: 99.9,
    uptime30d: 99.85,
    heartbeats: generateHeartbeats('6', 'up', 45),
    aiDiagnostic: null,
    createdAt: new Date(Date.now() - 86400000 * 20),
    acceptedStatusCodes: '200-299',
    maxRedirects: 5,
    retries: 1,
    description: 'Push notification delivery service',
    tags: ['notifications'],
    paused: false,
  },
  {
    id: '7',
    name: 'Search Engine',
    url: 'https://search.example.com/ping',
    method: 'GET',
    interval: 30,
    status: 'up',
    lastChecked: new Date(),
    avgLatency: 203,
    uptime24h: 99.5,
    uptime30d: 99.7,
    heartbeats: generateHeartbeats('7', 'up', 50),
    aiDiagnostic: null,
    createdAt: new Date(Date.now() - 86400000 * 10),
    acceptedStatusCodes: '200-299',
    maxRedirects: 3,
    retries: 2,
    description: 'Elasticsearch cluster health',
    tags: ['search', 'infrastructure'],
    paused: false,
  },
];

interface MonitorStore {
  monitors: Monitor[];
  selectedMonitorId: string | null;
  addMonitor: (monitor: Omit<Monitor, 'id' | 'status' | 'lastChecked' | 'avgLatency' | 'uptime24h' | 'uptime30d' | 'heartbeats' | 'aiDiagnostic' | 'createdAt' | 'paused'>) => void;
  deleteMonitor: (id: string) => void;
  getMonitor: (id: string) => Monitor | undefined;
  selectMonitor: (id: string | null) => void;
  togglePause: (id: string) => void;
  addHeartbeat: (monitorId: string, heartbeat: Heartbeat) => void;
}

export const useMonitorStore = create<MonitorStore>((set, get) => ({
  monitors: initialMonitors,
  selectedMonitorId: '1',
  addMonitor: (data) => {
    const newMonitor: Monitor = {
      ...data,
      id: Date.now().toString(),
      status: 'pending',
      lastChecked: null,
      avgLatency: 0,
      uptime24h: 0,
      uptime30d: 0,
      heartbeats: [],
      aiDiagnostic: null,
      createdAt: new Date(),
      paused: false,
    };
    set((state) => ({ monitors: [...state.monitors, newMonitor], selectedMonitorId: newMonitor.id }));
  },
  deleteMonitor: (id) => {
    set((state) => {
      const filtered = state.monitors.filter((m) => m.id !== id);
      return {
        monitors: filtered,
        selectedMonitorId: state.selectedMonitorId === id ? (filtered[0]?.id || null) : state.selectedMonitorId,
      };
    });
  },
  getMonitor: (id) => get().monitors.find((m) => m.id === id),
  selectMonitor: (id) => set({ selectedMonitorId: id }),
  togglePause: (id) => {
    set((state) => ({
      monitors: state.monitors.map((m) =>
        m.id === id ? { ...m, paused: !m.paused } : m
      ),
    }));
  },
  addHeartbeat: (monitorId, heartbeat) => {
    set((state) => ({
      monitors: state.monitors.map((m) => {
        if (m.id !== monitorId) return m;
        const newHeartbeats = [...m.heartbeats, heartbeat].slice(-100);
        const upBeats = newHeartbeats.filter(h => h.status === 'up');
        const avgLatency = upBeats.length > 0 ? Math.round(upBeats.reduce((sum, h) => sum + h.latency, 0) / upBeats.length) : 0;
        return {
          ...m,
          heartbeats: newHeartbeats,
          lastChecked: heartbeat.timestamp,
          status: heartbeat.status,
          avgLatency,
          uptime24h: newHeartbeats.length > 0
            ? Math.round((newHeartbeats.filter(h => h.status === 'up').length / newHeartbeats.length) * 10000) / 100
            : 0,
        };
      }),
    }));
  },
}));
