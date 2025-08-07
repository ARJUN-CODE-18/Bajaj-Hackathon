import { DocumentQARequest, DocumentQAResponse, DocumentUploadResponse, HealthResponse } from '@/types/rag';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
const AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN || '5b6105937b7cc769e46557d6241353e800d99cb57def59fd962d1d6ea8fcf736';

class RAGService {
  private static getAuthHeaders() {
    // Use environment variable token, fallback to localStorage for backward compatibility
    const token = AUTH_TOKEN || localStorage.getItem('rag_auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  static async processDocumentQuestions(
    documentUrl: string,
    questions: string[]
  ): Promise<DocumentQAResponse> {
    const request: DocumentQARequest = {
      documents: documentUrl,
      questions
    };

    const response = await fetch(`${BASE_URL}/hackrx/run`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to process questions: ${error}`);
    }

    return response.json();
  }

  static async uploadDocument(file: File): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        // Remove Content-Type to let browser set it with boundary for FormData
        'Content-Type': undefined as any
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to upload document: ${error}`);
    }

    return response.json();
  }

  static async uploadFileForBlobUrl(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${BASE_URL}/documents/upload-blob`, {
        method: 'POST',
        headers: {
          // Only include Authorization header, let browser set Content-Type for FormData
          ...(localStorage.getItem('rag_auth_token') && { 
            'Authorization': `Bearer ${localStorage.getItem('rag_auth_token')}` 
          })
        },
        body: formData
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        } catch {
          // If response.text() fails, use status message
        }
        throw new Error(`Upload failed: ${errorMessage}`);
      }

      const result = await response.json();
      return result.blob_url || result.url || result.document_url;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please ensure the RAG backend is running on http://localhost:8000');
      }
      throw error;
    }
  }

  static async healthCheck(): Promise<HealthResponse> {
    const response = await fetch(`${BASE_URL}/health`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Health check failed');
    }

    return response.json();
  }

  static async testEmbedding(): Promise<any> {
    const response = await fetch(`${BASE_URL}/test-embedding`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Embedding test failed');
    }

    return response.json();
  }

  static async testGemini(): Promise<any> {
    const response = await fetch(`${BASE_URL}/test-gemini`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Gemini test failed');
    }

    return response.json();
  }

  // Database fetching functions
  static async fetchDatabaseData(endpoint: string = '/database/data'): Promise<any> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch database data: ${error}`);
    }

    return response.json();
  }

  static async fetchDocumentsFromDB(): Promise<any> {
    return this.fetchDatabaseData('/database/documents');
  }

  static async fetchQAHistoryFromDB(): Promise<any> {
    return this.fetchDatabaseData('/database/qa-history');
  }

  static async fetchUserDataFromDB(userId?: string): Promise<any> {
    const endpoint = userId ? `/database/users/${userId}` : '/database/users';
    return this.fetchDatabaseData(endpoint);
  }
}

export default RAGService;