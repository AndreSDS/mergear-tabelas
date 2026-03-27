"use client";

import { useState, useCallback } from "react";
import { Upload, File, CheckCircle, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadModernProps {
  label: string;
  onFileUpload: (file: File) => void;
  accept?: string;
  description?: string;
  maxSizeMB?: number;
  showProgress?: boolean;
}

export function FileUploadModern({
  label,
  onFileUpload,
  accept,
  description,
  maxSizeMB = 10,
  showProgress = true,
}: FileUploadModernProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulateUpload = useCallback(() => {
    if (!file) return;
    
    setIsUploading(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  }, [file]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        validateAndSetFile(droppedFile);
      }
    },
    []
  );

  const validateAndSetFile = (file: File) => {
    setError(null);
    
    // Validar tamanho
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`);
      return;
    }
    
    // Validar tipo
    if (accept) {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      // Se o arquivo não tem extensão, permitir (será tratado como genérico)
      const hasExtension = file.name.includes('.');
      if (hasExtension) {
        if (!acceptedTypes.some(t => file.name.endsWith(t.replace('*', '')))) {
          setError('Tipo de arquivo não suportado');
          return;
        }
      }
    }
    
    setFile(file);
    onFileUpload(file);
    
    if (showProgress) {
      simulateUpload();
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setProgress(0);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">{label}</span>
      
      <motion.div
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-40 rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden transition-all duration-300",
          isDragOver 
            ? "border-violet-500 bg-violet-50/50 dark:bg-violet-950/30 scale-[1.02]" 
            : file
              ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/30"
              : "border-gray-300 dark:border-gray-600 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 hover:border-violet-400 hover:bg-violet-50/30",
          error && "border-red-300 bg-red-50/50"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          type="file"
          accept={accept}
          onChange={(e) => {
            if (e.target.files?.[0]) {
              validateAndSetFile(e.target.files[0]);
            }
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="flex items-center gap-3">
                <File className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              
              {showProgress && isUploading && (
                <div className="w-full max-w-xs">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Enviando...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}
              
              {progress === 100 && !isUploading && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 text-emerald-600"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Arquivo pronto!</span>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full blur-lg opacity-30 animate-pulse" />
                <Upload className="w-10 h-10 text-gray-600 dark:text-gray-400 relative" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Arraste e solte seu arquivo aqui
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ou clique para selecionar
                </p>
              </div>
              {description && (
                <p className="text-xs text-gray-400 mt-2">{description}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-red-600 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}