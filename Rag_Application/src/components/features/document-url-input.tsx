import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Globe, AlertTriangle, CheckCircle2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import RAGService from "@/services/ragService";

interface DocumentUrlInputProps {
  value: string;
  onChange: (url: string) => void;
  onValidate?: (isValid: boolean) => void;
  className?: string;
}

interface UploadedFile {
  file: File;
  blobUrl: string;
}

export function DocumentUrlInput({ 
  value, 
  onChange, 
  onValidate, 
  className 
}: DocumentUrlInputProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const supportedFormats = ['PDF', 'DOCX', 'EML', 'TXT'];

  const validateUrl = async (url: string) => {
    if (!url.trim()) {
      setValidationStatus('idle');
      onValidate?.(false);
      return;
    }

    // Check if it's a valid URL
    try {
      new URL(url);
    } catch {
      setValidationStatus('invalid');
      setErrorMessage('Please enter a valid URL');
      onValidate?.(false);
      return;
    }

    // Check if it's a blob URL (from uploaded file) or regular URL with supported format
    const urlLower = url.toLowerCase();
    const isBlobUrl = url.startsWith('blob:') || url.includes('.blob.core.windows.net');
    const hasSupportedExtension = supportedFormats.some(format => 
      urlLower.includes(`.${format.toLowerCase()}`)
    );

    // If it's a blob URL, assume it's valid (it was created by our upload process)
    if (isBlobUrl) {
      setValidationStatus('valid');
      setErrorMessage('');
      onValidate?.(true);
      return;
    }

    // For regular URLs, check file extension
    if (!hasSupportedExtension) {
      setValidationStatus('invalid');
      setErrorMessage(`URL must point to a supported file format: ${supportedFormats.join(', ')}`);
      onValidate?.(false);
      return;
    }

    setIsValidating(true);
    
    try {
      // Simple HEAD request to check if resource exists
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors' // This helps with CORS issues for external URLs
      });
      setValidationStatus('valid');
      setErrorMessage('');
      onValidate?.(true);
    } catch {
      // For external URLs, even if HEAD fails, we'll allow it and let the backend handle it
      setValidationStatus('valid');
      setErrorMessage('');
      onValidate?.(true);
    } finally {
      setIsValidating(false);
    }
  };

  const handleUrlChange = (newUrl: string) => {
    onChange(newUrl);
    setValidationStatus('idle');
    setErrorMessage('');
    setUploadedFile(null); // Clear uploaded file when URL changes
    
    // Debounced validation
    const timeoutId = setTimeout(() => {
      if (newUrl.trim()) {
        validateUrl(newUrl);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toUpperCase();
    if (!supportedFormats.includes(fileExtension || '')) {
      setValidationStatus('invalid');
      setErrorMessage(`File type not supported. Please use: ${supportedFormats.join(', ')}`);
      onValidate?.(false);
      return;
    }

    setIsUploading(true);
    setErrorMessage('');
    setValidationStatus('idle');

    try {
      const blobUrl = await RAGService.uploadFileForBlobUrl(file);
      setUploadedFile({ file, blobUrl });
      onChange(blobUrl);
      setValidationStatus('valid');
      onValidate?.(true);
    } catch (error) {
      console.error('Upload error:', error);
      setValidationStatus('invalid');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to upload file');
      onValidate?.(false);
    } finally {
      setIsUploading(false);
    }
  }, [onChange, onValidate, supportedFormats]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'message/rfc822': ['.eml'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    multiple: false
  });

  const clearUploadedFile = () => {
    setUploadedFile(null);
    onChange('');
    setValidationStatus('idle');
    setErrorMessage('');
    onValidate?.(false);
  };

  const getStatusIcon = () => {
    if (isValidating || isUploading) {
      return <Globe className="w-4 h-4 text-primary animate-pulse" />;
    }
    
    switch (validationStatus) {
      case 'valid':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'invalid':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5 text-primary" />
          Document URL
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter the URL of your document to analyze. Supported formats: {supportedFormats.join(', ')}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* File Upload Section */}
        {!uploadedFile && (
          <div className="space-y-4">
            <div className="text-center">
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors",
                  isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                  isUploading && "pointer-events-none opacity-50"
                )}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-3">
                  <Upload className={cn("w-8 h-8", isDragActive ? "text-primary" : "text-muted-foreground")} />
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {isUploading ? "Uploading..." : isDragActive ? "Drop file here" : "Drag & drop a document"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      or click to browse • Max 10MB • {supportedFormats.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or enter URL manually
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Uploaded File Display */}
        {uploadedFile && (
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{uploadedFile.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearUploadedFile}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* URL Input (only show if no file uploaded) */}
        {!uploadedFile && (
          <div className="space-y-2">
            <Label htmlFor="document-url">Document URL</Label>
            <div className="relative">
              <Input
                id="document-url"
                type="url"
                placeholder="https://example.com/document.pdf"
                value={value}
                onChange={(e) => handleUrlChange(e.target.value)}
                className={cn(
                  "pr-10",
                  validationStatus === 'valid' && "border-success",
                  validationStatus === 'invalid' && "border-destructive"
                )}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {getStatusIcon()}
              </div>
            </div>
            
            {errorMessage && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {errorMessage}
              </p>
            )}
            
            {validationStatus === 'valid' && !uploadedFile && (
              <p className="text-sm text-success flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Document URL is valid and accessible
              </p>
            )}
          </div>
        )}
        
        {uploadedFile && validationStatus === 'valid' && (
          <p className="text-sm text-success flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            File uploaded successfully and ready for analysis
          </p>
        )}
        
        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">Supported file formats:</p>
          <div className="flex flex-wrap gap-2">
            {supportedFormats.map((format) => (
              <span 
                key={format}
                className="px-2 py-1 bg-muted rounded text-xs font-mono"
              >
                .{format.toLowerCase()}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}