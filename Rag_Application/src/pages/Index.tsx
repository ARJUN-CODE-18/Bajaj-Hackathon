import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { DocumentUrlInput } from "@/components/features/document-url-input";
import { QuestionBuilder } from "@/components/features/question-builder";
import { AnswerDisplay } from "@/components/features/answer-display";
import { ProcessingStatus } from "@/components/features/processing-status";
import { FileSearch, Sparkles, Brain, Zap } from "lucide-react";
import RAGService from "@/services/ragService";
import { Answer, ProcessingStatus as ProcessingStatusType } from "@/types/rag";

const Index = () => {
  const [documentUrl, setDocumentUrl] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isUrlValid, setIsUrlValid] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatusType>({
    isProcessing: false,
    currentQuestion: 0,
    totalQuestions: 0
  });
  const { toast } = useToast();

  const canAnalyze = isUrlValid && questions.length > 0 && !processingStatus.isProcessing;

  const analyzeDocument = async () => {
    if (!canAnalyze) return;

    setProcessingStatus({
      isProcessing: true,
      currentQuestion: 0,
      totalQuestions: questions.length,
      message: "Initializing document analysis..."
    });

    try {
      // Simulate progress for better UX
      for (let i = 1; i <= questions.length; i++) {
        setProcessingStatus(prev => ({
          ...prev,
          currentQuestion: i,
          message: `Processing question ${i} of ${questions.length}...`
        }));
        
        // Add small delay for each question to show progress
        if (i < questions.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      const response = await RAGService.processDocumentQuestions(documentUrl, questions);
      
      setAnswers(response.answers);
      
      toast({
        title: "Analysis Complete!",
        description: `Successfully analyzed ${response.answers.length} questions with ${Math.round(response.retrieval_info.avg_confidence * 100)}% average confidence.`,
      });

    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingStatus({
        isProcessing: false,
        currentQuestion: 0,
        totalQuestions: questions.length
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                RAG Document QA
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-powered document analysis and question answering
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Hero Section */}
            <Card className="bg-gradient-primary text-white border-none shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-8 h-8" />
                  <div>
                    <h2 className="text-xl font-semibold">Smart Document Analysis</h2>
                    <p className="text-white/80 text-sm">
                      Upload documents, ask questions, get intelligent answers
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <FileSearch className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-xs font-medium">Smart Search</div>
                  </div>
                  <div className="text-center">
                    <Brain className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-xs font-medium">AI Analysis</div>
                  </div>
                  <div className="text-center">
                    <Zap className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-xs font-medium">Fast Results</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document URL Input */}
            <DocumentUrlInput
              value={documentUrl}
              onChange={setDocumentUrl}
              onValidate={setIsUrlValid}
            />

            {/* Question Builder */}
            <QuestionBuilder
              questions={questions}
              onChange={setQuestions}
            />

            {/* Analyze Button */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  onClick={analyzeDocument}
                  disabled={!canAnalyze}
                  className="w-full h-12 text-base font-medium"
                  size="lg"
                >
                  {processingStatus.isProcessing ? (
                    <>
                      <Brain className="w-5 h-5 mr-2 animate-pulse" />
                      Analyzing Document...
                    </>
                  ) : (
                    <>
                      <FileSearch className="w-5 h-5 mr-2" />
                      Analyze Document
                    </>
                  )}
                </Button>
                
                {!canAnalyze && !processingStatus.isProcessing && (
                  <p className="text-sm text-muted-foreground text-center mt-3">
                    {!isUrlValid && "Please enter a valid document URL"}
                    {isUrlValid && questions.length === 0 && "Please add at least one question"}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Processing Status */}
            <ProcessingStatus
              status={processingStatus}
              questions={questions}
            />

            {/* Answer Display */}
            <AnswerDisplay answers={answers} />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Brain className="w-4 h-4" />
                <span>Powered by advanced AI and vector search technology</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Supports PDF, DOCX, EML, and TXT documents with intelligent chunking and semantic search
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;