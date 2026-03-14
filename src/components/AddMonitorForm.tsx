import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useMonitorStore } from '@/store/monitorStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface AddMonitorFormProps {
  onClose: () => void;
}

export const AddMonitorForm = ({ onClose }: AddMonitorFormProps) => {
  const addMonitor = useMonitorStore((s) => s.addMonitor);
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: '',
    url: 'https://',
    method: 'GET' as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'PATCH',
    interval: 60,
    acceptedStatusCodes: '200-299',
    maxRedirects: 10,
    retries: 0,
    description: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.url || form.url === 'https://') {
      toast({ title: 'Validation error', description: 'Name and URL are required.', variant: 'destructive' });
      return;
    }
    addMonitor(form);
    toast({ title: 'Monitor added', description: `${form.name} is now being monitored.` });
    onClose();
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'PATCH'] as const;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-foreground/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="card-surface p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Add New Monitor</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs font-medium">Friendly Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="My API"
              className="mt-1.5"
              autoFocus
            />
          </div>

          <div>
            <Label className="text-xs font-medium">URL *</Label>
            <Input
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://api.example.com/health"
              className="mt-1.5 font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium">Method</Label>
              <div className="mt-1.5 grid grid-cols-3 gap-1">
                {methods.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setForm({ ...form, method: m })}
                    className={`text-xs py-1.5 rounded-lg font-mono font-medium transition-colors ${
                      form.method === m
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium">Interval (seconds)</Label>
              <Input
                type="number"
                value={form.interval}
                onChange={(e) => setForm({ ...form, interval: Number(e.target.value) })}
                min={20}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-medium">Accepted Codes</Label>
              <Input
                value={form.acceptedStatusCodes}
                onChange={(e) => setForm({ ...form, acceptedStatusCodes: e.target.value })}
                className="mt-1.5 font-mono text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Max Redirects</Label>
              <Input
                type="number"
                value={form.maxRedirects}
                onChange={(e) => setForm({ ...form, maxRedirects: Number(e.target.value) })}
                min={0}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Retries</Label>
              <Input
                type="number"
                value={form.retries}
                onChange={(e) => setForm({ ...form, retries: Number(e.target.value) })}
                min={0}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium">Tags</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add tag..."
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag}>Add</Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mt-2">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-xs bg-accent text-accent-foreground cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={() => setForm({ ...form, tags: form.tags.filter((t) => t !== tag) })}
                  >
                    {tag} ×
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs font-medium">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description..."
              className="mt-1.5 resize-none"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Monitor</Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
