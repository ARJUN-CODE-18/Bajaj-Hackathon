import { cn } from "@/lib/utils";
import { ConfidenceLevel } from "@/types/rag";

interface ConfidenceMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ConfidenceMeter({ 
  score, 
  size = 'md', 
  showLabel = true, 
  className 
}: ConfidenceMeterProps) {
  const getConfidenceLevel = (score: number): ConfidenceLevel => {
    if (score >= 0.8) return 'high';
    if (score >= 0.6) return 'medium';
    return 'low';
  };

  const getConfidenceColor = (level: ConfidenceLevel) => {
    switch (level) {
      case 'high': return 'bg-confidence-high';
      case 'medium': return 'bg-confidence-medium';
      case 'low': return 'bg-confidence-low';
    }
  };

  const getConfidenceText = (level: ConfidenceLevel) => {
    switch (level) {
      case 'high': return 'High Confidence';
      case 'medium': return 'Medium Confidence';
      case 'low': return 'Low Confidence';
    }
  };

  const level = getConfidenceLevel(score);
  const percentage = Math.round(score * 100);

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium text-muted-foreground">
            {getConfidenceText(level)}
          </span>
          <span className="font-semibold text-foreground">
            {percentage}%
          </span>
        </div>
      )}
      <div className={cn(
        "w-full bg-muted rounded-full overflow-hidden",
        sizeClasses[size]
      )}>
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            getConfidenceColor(level)
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}