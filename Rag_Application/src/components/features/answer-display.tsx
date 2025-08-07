import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ConfidenceMeter } from "@/components/ui/confidence-meter";
import { 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Copy, 
  ExternalLink,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Answer, SourceChunk } from "@/types/rag";
import { useToast } from "@/hooks/use-toast";

interface AnswerDisplayProps {
  answers: Answer[];
  documentId?: string;
  className?: string;
}

interface AnswerCardProps {
  answer: Answer;
  index: number;
  documentId?: string;
}

function SourceChunkPreview({ chunk, documentId }: { chunk: SourceChunk; documentId?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(chunk.preview);
    toast({
      description: "Source text copied to clipboard",
    });
  };

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Chunk #{chunk.chunk_id}
          </Badge>
          <Badge 
            variant="secondary" 
            className={cn(
              "text-xs",
              chunk.similarity_score >= 0.8 && "bg-confidence-high text-white",
              chunk.similarity_score >= 0.6 && chunk.similarity_score < 0.8 && "bg-confidence-medium text-white",
              chunk.similarity_score < 0.6 && "bg-confidence-low text-white"
            )}
          >
            {Math.round(chunk.similarity_score * 100)}% match
          </Badge>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-6 w-6 p-0"
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </Button>
        </div>
      </div>
      
      <div className={cn(
        "text-sm text-muted-foreground",
        !isExpanded && "line-clamp-2"
      )}>
        {chunk.preview}
      </div>
    </div>
  );
}

function AnswerCard({ answer, index, documentId }: AnswerCardProps) {
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(false);
  const { toast } = useToast();

  const copyAnswer = () => {
    const text = `Q: ${answer.question}\nA: ${answer.answer}`;
    navigator.clipboard.writeText(text);
    toast({
      description: "Question and answer copied to clipboard",
    });
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High Confidence";
    if (confidence >= 0.6) return "Medium Confidence";
    return "Low Confidence";
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-base font-medium leading-relaxed flex-1">
            <span className="text-sm font-mono text-muted-foreground mr-2">
              Q{index + 1}.
            </span>
            {answer.question}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyAnswer}
            className="shrink-0 h-8 w-8 p-0"
          >
            <Copy className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Answer */}
        <div className="space-y-3">
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {answer.answer}
            </p>
          </div>
          
          {/* Confidence Score */}
          <div className="space-y-2">
            <ConfidenceMeter score={answer.confidence} />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Based on {answer.chunks_retrieved} document chunks</span>
              <span>{getConfidenceLabel(answer.confidence)}</span>
            </div>
          </div>
        </div>

        {/* Sources */}
        <Collapsible open={isSourcesExpanded} onOpenChange={setIsSourcesExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                View Sources ({answer.sources.length})
              </div>
              {isSourcesExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-3 mt-4">
            <div className="space-y-2">
              {answer.sources.map((source, sourceIndex) => (
                <SourceChunkPreview
                  key={sourceIndex}
                  chunk={source}
                  documentId={documentId}
                />
              ))}
            </div>
            
            {answer.sources.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No source chunks available for this answer.
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

export function AnswerDisplay({ answers, documentId, className }: AnswerDisplayProps) {
  const { toast } = useToast();

  const exportAnswers = () => {
    const exportText = answers.map((answer, index) => 
      `Question ${index + 1}: ${answer.question}\n\nAnswer: ${answer.answer}\n\nConfidence: ${Math.round(answer.confidence * 100)}%\n\n---\n\n`
    ).join('');
    
    navigator.clipboard.writeText(exportText);
    toast({
      description: "All answers copied to clipboard",
    });
  };

  if (answers.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            No answers yet
          </p>
          <p className="text-sm text-muted-foreground text-center">
            Add a document URL and questions to get started with AI-powered analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Analysis Results
          <Badge variant="secondary">{answers.length} answers</Badge>
        </h3>
        <Button variant="outline" size="sm" onClick={exportAnswers}>
          <Copy className="w-4 h-4 mr-2" />
          Export All
        </Button>
      </div>
      
      <div className="space-y-4">
        {answers.map((answer, index) => (
          <AnswerCard
            key={index}
            answer={answer}
            index={index}
            documentId={documentId}
          />
        ))}
      </div>
      
      {/* Summary Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {answers.length}
              </div>
              <div className="text-sm text-muted-foreground">Questions Analyzed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {Math.round((answers.reduce((sum, a) => sum + a.confidence, 0) / answers.length) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Avg. Confidence</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {Math.round(answers.reduce((sum, a) => sum + a.chunks_retrieved, 0) / answers.length)}
              </div>
              <div className="text-sm text-muted-foreground">Avg. Sources</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}