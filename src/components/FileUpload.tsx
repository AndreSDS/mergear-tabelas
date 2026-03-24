"use client";

import { UploadCloud } from "lucide-react";
import { useCallback } from "react";

interface FileUploadProps {
  label: string;
  onFileUpload: (file: File) => void;
  accept?: string;
  description?: string;
}

export function FileUpload({ label, onFileUpload, accept, description }: FileUploadProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFileUpload(e.dataTransfer.files[0]);
      }
    },
    [onFileUpload]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="font-semibold text-sm">{label}</span>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer relative"
      >
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <UploadCloud className="w-8 h-8 text-zinc-500 mb-2" />
        <p className="text-sm text-zinc-600 font-medium">Arraste ou clique para enviar</p>
        {description && <p className="text-xs text-zinc-400 mt-1">{description}</p>}
      </div>
    </div>
  );
}
