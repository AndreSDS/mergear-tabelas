"use client";

import { Download, CheckCircle2 } from "lucide-react";

interface SummaryPanelProps {
  totalRows: number;
  rowsUpdated: number;
  columnsAdded: number;
  onDownload: () => void;
}

export function SummaryPanel({ totalRows, rowsUpdated, columnsAdded, onDownload }: SummaryPanelProps) {
  return (
    <div className="flex flex-col gap-4 p-6 border border-zinc-200 rounded-lg bg-emerald-50 mt-4">
      <div className="flex items-center gap-2 text-emerald-700">
        <CheckCircle2 className="w-6 h-6" />
        <h3 className="font-semibold text-lg">Processamento Concluído!</h3>
      </div>
      
      <ul className="text-sm text-emerald-800 space-y-1 ml-8 list-disc">
        <li><strong>{totalRows}</strong> linhas presentes no arquivo final.</li>
        <li><strong>{rowsUpdated}</strong> registros atualizados ou preservados com nova estrutura.</li>
        <li><strong>{columnsAdded}</strong> novas colunas acrescentadas.</li>
      </ul>

      <button
        onClick={onDownload}
        className="flex items-center justify-center gap-2 mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition-colors shadow-sm"
      >
        <Download className="w-5 h-5" />
        Baixar Planilha Atualizada
      </button>
    </div>
  );
}
