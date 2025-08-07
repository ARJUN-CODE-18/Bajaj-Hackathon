import { cn } from "@/lib/utils";
import { CheckCircle, Circle, Loader2 } from "lucide-react";

interface ProgressIndicatorProps {
  total: number;
  current: number;
  labels?: string[];
  className?: string;
}

export function ProgressIndicator({ 
  total, 
  current, 
  labels, 
  className 
}: ProgressIndicatorProps) {
  const steps = Array.from({ length: total }, (_, index) => index + 1);
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Processing Questions
        </span>
        <span className="text-sm text-muted-foreground">
          {current} of {total}
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        {steps.map((step) => {
          const isCompleted = step < current;
          const isCurrent = step === current;
          const isPending = step > current;
          
          return (
            <div key={step} className="flex items-center">
              <div className="flex items-center justify-center">
                {isCompleted && (
                  <CheckCircle className="w-6 h-6 text-success" />
                )}
                {isCurrent && (
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                )}
                {isPending && (
                  <Circle className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              
              {step < total && (
                <div 
                  className={cn(
                    "w-8 h-0.5 mx-2 transition-colors duration-300",
                    isCompleted ? "bg-success" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {labels && (
        <div className="grid grid-cols-1 gap-2 mt-4">
          {labels.slice(0, current).map((label, index) => (
            <div 
              key={index}
              className="text-xs text-muted-foreground truncate"
            >
              {index + 1}. {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}