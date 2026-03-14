import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { MonitorSidebar } from '@/components/MonitorSidebar';
import { MonitorDetailView } from '@/components/MonitorDetail';
import { AddMonitorForm } from '@/components/AddMonitorForm';
import { useRealtimeSimulation } from '@/hooks/useRealtimeSimulation';

const Dashboard = () => {
  const [showAdd, setShowAdd] = useState(false);

  // Enable real-time heartbeat simulation
  useRealtimeSimulation();

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <MonitorSidebar onAddClick={() => setShowAdd(true)} />
        <MonitorDetailView />
      </div>

      <AnimatePresence>
        {showAdd && <AddMonitorForm onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
