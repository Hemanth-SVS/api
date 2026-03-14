import { Sparkles } from 'lucide-react';

interface AIInsightBadgeProps {
  text: string;
  full?: boolean;
}

export const AIInsightBadge = ({ text, full = false }: AIInsightBadgeProps) => {
  return (
    <div className="ai-insight-surface mt-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Sparkles className="h-3 w-3 text-accent" />
        <span className="text-[10px] uppercase tracking-widest font-bold text-accent">
          SLM Diagnostic
        </span>
      </div>
      <p className={`text-xs text-secondary-foreground/80 italic leading-relaxed ${full ? '' : 'line-clamp-2'}`}>
        "{text}"
      </p>
    </div>
  );
};
