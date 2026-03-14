import { create } from 'zustand';

export type MonitorStatus = 'up' | 'down' | 'pending';

export interface Heartbeat {
  id: string;
  monitorId: string;
  status: MonitorStatus;
  latency: number;
  statusCode: number;
  timestamp: Date;
}

export interface Monitor {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
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
}

// Generate mock heartbeats
const generateHeartbeats = (monitorId: string, status: MonitorStatus, count: number = 30): Heartbeat[] => {
  return Array.from({ length: count }, (_, i) => {
    const isDown = status === 'down' && i >= count - 2;
    const isRandomDown = !isDown && Math.random() < 0.05;
    const hbStatus: MonitorStatus = isDown || isRandomDown ? 'down' : 'up';
    return {
      id: `${monitorId}-hb-${i}`,
      monitorId,
      status: hbStatus,
      latency: hbStatus === 'up' ? Math.floor(Math.random() * 300) + 50 : 0,
      statusCode: hbStatus === 'up' ? 200 : 0,
      timestamp: new Date(Date.now() - (count - i) * 60000),
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
    aiDiagnostic: 'DNS resolution failure detected. The CNAME record for payments.example.com is returning NXDOMAIN. Likely cause: expired domain or misconfigured DNS zone file.',
    createdAt: new Date(Date.now() - 86400000 * 60),
    acceptedStatusCodes: '200-299',
    maxRedirects: 10,
    retries: 3,
    description: 'Stripe payment processing endpoint',
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
    heartbeats: generateHeartbeats('4', 'up', 20),
    aiDiagnostic: null,
    createdAt: new Date(Date.now() - 86400000 * 15),
    acceptedStatusCodes: '200-299',
    maxRedirects: 0,
    retries: 0,
    description: 'CDN origin server',
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
  },
];

interface MonitorStore {
  monitors: Monitor[];
  addMonitor: (monitor: Omit<Monitor, 'id' | 'status' | 'lastChecked' | 'avgLatency' | 'uptime24h' | 'uptime30d' | 'heartbeats' | 'aiDiagnostic' | 'createdAt'>) => void;
  deleteMonitor: (id: string) => void;
  getMonitor: (id: string) => Monitor | undefined;
}

export const useMonitorStore = create<MonitorStore>((set, get) => ({
  monitors: initialMonitors,
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
    };
    set((state) => ({ monitors: [...state.monitors, newMonitor] }));
  },
  deleteMonitor: (id) => {
    set((state) => ({ monitors: state.monitors.filter((m) => m.id !== id) }));
  },
  getMonitor: (id) => {
    return get().monitors.find((m) => m.id === id);
  },
}));
