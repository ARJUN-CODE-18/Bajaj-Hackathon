import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, MessageSquare, FileText, Lightbulb, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuestionTemplate } from "@/types/rag";

interface QuestionBuilderProps {
  questions: string[];
  onChange: (questions: string[]) => void;
  maxQuestions?: number;
  className?: string;
}

const questionTemplates: QuestionTemplate[] = [
  {
    id: 'policy',
    category: 'Insurance Policy',
    questions: [
      'What is the grace period for premium payment?',
      'What is the waiting period for pre-existing diseases?',
      'Does this policy cover maternity expenses?',
      'What is the coverage limit for this policy?',
      'What are the exclusions in this policy?'
    ]
  },
  {
    id: 'contract',
    category: 'Legal Contract',
    questions: [
      'What are the termination clauses?',
      'What are the payment terms?',
      'What are the penalties for breach of contract?',
      'What is the duration of this contract?',
      'What are the deliverables mentioned?'
    ]
  },
  {
    id: 'financial',
    category: 'Financial Report',
    questions: [
      'What is the total revenue?',
      'What are the major expenses?',
      'What is the profit margin?',
      'What are the key financial highlights?',
      'What are the risk factors mentioned?'
    ]
  },
  {
    id: 'general',
    category: 'General Document',
    questions: [
      'What is the main purpose of this document?',
      'Who are the key stakeholders mentioned?',
      'What are the important dates or deadlines?',
      'What are the key requirements or conditions?',
      'What actions are required from the reader?'
    ]
  }
];

export function QuestionBuilder({ 
  questions, 
  onChange, 
  maxQuestions = 10, 
  className 
}: QuestionBuilderProps) {
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const addQuestion = () => {
    if (newQuestion.trim() && questions.length < maxQuestions) {
      onChange([...questions, newQuestion.trim()]);
      setNewQuestion('');
    }
  };

  const removeQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, value: string) => {
    const updated = [...questions];
    updated[index] = value;
    onChange(updated);
  };

  const addTemplateQuestions = (templateId: string) => {
    const template = questionTemplates.find(t => t.id === templateId);
    if (!template) return;

    const availableSlots = maxQuestions - questions.length;
    const questionsToAdd = template.questions.slice(0, availableSlots);
    onChange([...questions, ...questionsToAdd]);
  };

  const clearAllQuestions = () => {
    onChange([]);
  };

  const duplicateQuestion = (index: number) => {
    if (questions.length < maxQuestions) {
      const questionToDuplicate = questions[index];
      onChange([...questions, questionToDuplicate]);
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5 text-primary" />
            Questions
            <Badge variant="secondary" className="ml-2">
              {questions.length}/{maxQuestions}
            </Badge>
          </CardTitle>
          {questions.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAllQuestions}
              className="text-xs"
            >
              Clear All
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Add up to {maxQuestions} questions to analyze your document. Use templates for quick start.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Question Templates */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            <Label className="text-sm font-medium">Quick Templates</Label>
          </div>
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a question template..." />
            </SelectTrigger>
            <SelectContent>
              {questionTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedTemplate && (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                Select questions from {questionTemplates.find(t => t.id === selectedTemplate)?.category}:
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {questionTemplates.find(t => t.id === selectedTemplate)?.questions.map((q, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-2 p-2 bg-muted rounded hover:bg-muted/80 cursor-pointer transition-colors"
                    onClick={() => {
                      if (questions.length < maxQuestions && !questions.includes(q)) {
                        onChange([...questions, q]);
                      }
                    }}
                  >
                    <div className="text-xs font-mono text-muted-foreground shrink-0">
                      {i + 1}.
                    </div>
                    <div className="text-xs text-foreground flex-1">
                      {q}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (questions.length < maxQuestions && !questions.includes(q)) {
                          onChange([...questions, q]);
                        }
                      }}
                      disabled={questions.length >= maxQuestions || questions.includes(q)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => addTemplateQuestions(selectedTemplate)}
                  disabled={questions.length >= maxQuestions}
                  variant="outline"
                  className="flex-1"
                >
                  Add All ({Math.min(5, maxQuestions - questions.length)} available)
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setSelectedTemplate('')}
                  variant="ghost"
                  className="shrink-0"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Add New Question */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Add Custom Question</Label>
          <div className="flex gap-2">
            <Textarea
              placeholder="Enter your question here..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="min-h-[80px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  addQuestion();
                }
              }}
            />
            <Button
              onClick={addQuestion}
              disabled={!newQuestion.trim() || questions.length >= maxQuestions}
              size="sm"
              className="shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Current Questions */}
        {questions.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Your Questions</Label>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {questions.map((question, index) => (
                <div
                  key={index}
                  className="group flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="text-xs font-mono text-muted-foreground pt-1 shrink-0">
                    {index + 1}.
                  </div>
                  <Textarea
                    value={question}
                    onChange={(e) => updateQuestion(index, e.target.value)}
                    className="min-h-[60px] resize-none border-none shadow-none p-0 focus-visible:ring-0"
                  />
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => duplicateQuestion(index)}
                      disabled={questions.length >= maxQuestions}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-medium mb-1">💡 Tips for better questions:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Be specific and clear in your questions</li>
            <li>Ask about key facts, dates, numbers, or policies</li>
            <li>Use question words: What, When, How, Why, Who</li>
            <li>Focus on actionable information from the document</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}