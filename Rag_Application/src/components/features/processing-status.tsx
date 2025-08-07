import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressIndicator } from "@/components/ui/progress-indicator";
import { Loader2, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProcessingStatus as ProcessingStatusType } from "@/types/rag";

interface ProcessingStatusProps {
  status: ProcessingStatusType;
  questions: string[];
  className?: string;
}

export function ProcessingStatus({ 
  status, 
  questions, 
  className 
}: ProcessingStatusProps) {
  const getStatusIcon = () => {
    if (status.isProcessing) {
      return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
    }
    return <Clock className="w-5 h-5 text-muted-foreground" />;
  };

  const getStatusBadge = () => {
    if (status.isProcessing) {
      return (
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          Processing...
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        Ready
      </Badge>
    );
  };

  const getCurrentMessage = () => {
    if (!status.isProcessing) {
      return "Ready to process your questions";
    }

    if (status.message) {
      return status.message;
    }

    if (status.currentQuestion !== undefined) {
      const questionText = questions[status.currentQuestion - 1];
      return `Processing: ${questionText?.substring(0, 50)}${questionText?.length > 50 ? '...' : ''}`;
    }

    return "Processing your document questions...";
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getStatusIcon()}
            Processing Status
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Status Message */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-sm font-medium mb-1">
            {status.isProcessing ? "Current Task" : "Status"}
          </p>
          <p className="text-sm text-muted-foreground">
            {getCurrentMessage()}
          </p>
        </div>

        {/* Progress Indicator */}
        {questions.length > 0 && (
          <ProgressIndicator
            total={status.totalQuestions}
            current={status.currentQuestion || 0}
            labels={questions}
          />
        )}

        {/* Processing Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {status.currentQuestion || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              Questions Processed
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {status.totalQuestions}
            </div>
            <div className="text-xs text-muted-foreground">
              Total Questions
            </div>
          </div>
        </div>

        {/* Help Text */}
        {!status.isProcessing && questions.length === 0 && (
          <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
            <p className="font-medium mb-1">💡 Getting Started:</p>
            <ol className="space-y-1 list-decimal list-inside">
              <li>Enter a valid document URL above</li>
              <li>Add questions you want to analyze</li>
              <li>Click "Analyze Document" to start processing</li>
            </ol>
          </div>
        )}

        {/* Processing Help */}
        {status.isProcessing && (
          <div className="text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/20">
            <p className="font-medium mb-1">🔄 Processing in progress...</p>
            <p>
              Your questions are being analyzed using advanced AI. This typically takes 
              30-60 seconds depending on document size and question complexity.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}