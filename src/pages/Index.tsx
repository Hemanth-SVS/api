import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import { useMonitorStore } from '@/store/monitorStore';
import { Header } from '@/components/Header';
import { QuickStats } from '@/components/QuickStats';
import { MonitorCard } from '@/components/MonitorCard';
import { AddMonitorForm } from '@/components/AddMonitorForm';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const monitors = useMonitorStore((s) => s.monitors);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = monitors.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.url.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Hero line */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl font-bold tracking-tight">Autonomous Observability</h1>
            <p className="mono text-muted-foreground mt-0.5">
              System operational · {monitors.length} monitors configured
            </p>
          </div>
          <Button onClick={() => setShowAdd(true)} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Monitor
          </Button>
        </motion.div>

        <QuickStats monitors={monitors} />

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search monitors..."
              className="pl-9 bg-secondary border-border"
            />
          </div>
          <div className="flex gap-1">
            {['all', 'up', 'down', 'pending'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Monitor Grid */}
        <motion.div
          className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } },
          }}
        >
          {filtered.map((monitor) => (
            <motion.div
              key={monitor.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <MonitorCard monitor={monitor} />
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div className="card-surface p-12 text-center">
            <p className="text-muted-foreground">No monitors found</p>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showAdd && <AddMonitorForm onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
