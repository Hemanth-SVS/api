import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useMonitorStore } from '@/store/monitorStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface AddMonitorFormProps {
  onClose: () => void;
}

export const AddMonitorForm = ({ onClose }: AddMonitorFormProps) => {
  const navigate = useNavigate();
  const addMonitor = useMonitorStore((s) => s.addMonitor);
  const [form, setForm] = useState({
    name: '',
    url: 'https://',
    method: 'GET' as const,
    interval: 60,
    acceptedStatusCodes: '200-299',
    maxRedirects: 10,
    retries: 0,
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.url || form.url === 'https://') return;
    addMonitor(form);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        className="card-surface p-6 w-full max-w-xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Add New Monitor</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Friendly Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="My API"
                className="mt-1.5 bg-secondary border-border"
              />
            </div>

            <div className="col-span-2">
              <Label>URL</Label>
              <Input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://api.example.com/health"
                className="mt-1.5 bg-secondary border-border font-mono text-sm"
              />
            </div>

            <div>
              <Label>Method</Label>
              <Select value={form.method} onValueChange={(v: any) => setForm({ ...form, method: v })}>
                <SelectTrigger className="mt-1.5 bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="HEAD">HEAD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Interval (seconds)</Label>
              <Input
                type="number"
                value={form.interval}
                onChange={(e) => setForm({ ...form, interval: Number(e.target.value) })}
                min={20}
                className="mt-1.5 bg-secondary border-border"
              />
            </div>

            <div>
              <Label>Accepted Status Codes</Label>
              <Input
                value={form.acceptedStatusCodes}
                onChange={(e) => setForm({ ...form, acceptedStatusCodes: e.target.value })}
                className="mt-1.5 bg-secondary border-border font-mono text-sm"
              />
            </div>

            <div>
              <Label>Max Redirects</Label>
              <Input
                type="number"
                value={form.maxRedirects}
                onChange={(e) => setForm({ ...form, maxRedirects: Number(e.target.value) })}
                min={0}
                className="mt-1.5 bg-secondary border-border"
              />
            </div>

            <div>
              <Label>Retries</Label>
              <Input
                type="number"
                value={form.retries}
                onChange={(e) => setForm({ ...form, retries: Number(e.target.value) })}
                min={0}
                className="mt-1.5 bg-secondary border-border"
              />
            </div>

            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description..."
                className="mt-1.5 bg-secondary border-border resize-none"
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Monitor</Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
