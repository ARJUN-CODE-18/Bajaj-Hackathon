export interface DocumentQARequest {
  documents: string;
  questions: string[];
}

export interface SourceChunk {
  chunk_id: number;
  similarity_score: number;
  preview: string;
}

export interface Answer {
  question: string;
  answer: string;
  confidence: number;
  sources: SourceChunk[];
  chunks_retrieved: number;
}

export interface RetrievalInfo {
  total_questions: number;
  avg_chunks_retrieved: number;
  avg_confidence: number;
}

export interface DocumentQAResponse {
  answers: Answer[];
  document_id: string;
  retrieval_info: RetrievalInfo;
}

export interface DocumentUploadResponse {
  document_id: string;
  filename: string;
  status: 'processed' | 'processing' | 'failed';
  chunks_created: number;
  message: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  database_status: string;
  embedding_status: string;
  llm_status: string;
}

export interface ProcessingStatus {
  isProcessing: boolean;
  currentQuestion?: number;
  totalQuestions: number;
  message?: string;
}

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface QuestionTemplate {
  id: string;
  category: string;
  questions: string[];
}