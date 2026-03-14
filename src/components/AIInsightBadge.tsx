import { Sparkles, AlertTriangle } from 'lucide-react';

interface AIInsightBadgeProps {
  text: string;
  full?: boolean;
}

export const AIInsightBadge = ({ text, full = false }: AIInsightBadgeProps) => {
  return (
    <div className="ai-insight-surface">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ background: 'hsl(var(--ai-accent) / 0.1)' }}>
          <Sparkles className="h-3 w-3" style={{ color: 'hsl(var(--ai-accent))' }} />
          <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'hsl(var(--ai-accent))' }}>
            AI Diagnostic
          </span>
        </div>
      </div>
      <p className={`text-sm leading-relaxed text-muted-foreground ${full ? '' : 'line-clamp-2'}`}>
        {text}
      </p>
    </div>
  );
};
