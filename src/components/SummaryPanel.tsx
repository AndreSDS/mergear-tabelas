"use client";

import { useState } from "react";
import { Download, CheckCircle2, ChevronDown, ChevronUp, Columns3 } from "lucide-react";
import type { Row } from "@/lib/excel-util";

interface SummaryPanelProps {
  totalRows: number;
  rowsUpdated: number;
  columnsAdded: number;
  newColumnsNames: string[];
  mergedData: Row[];
  onDownload: () => void;
}

const PREVIEW_LIMIT = 10;

export function SummaryPanel({
  totalRows,
  rowsUpdated,
  columnsAdded,
  newColumnsNames,
  mergedData,
  onDownload,
}: SummaryPanelProps) {
  const [showPreview, setShowPreview] = useState(false);

  const columns = mergedData.length > 0 ? Object.keys(mergedData[0]) : [];
  const previewRows = mergedData.slice(0, PREVIEW_LIMIT);

  return (
    <div className="flex flex-col gap-5">
      {/* Stats Card */}
      <div className="flex flex-col gap-4 p-6 border border-emerald-200 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="w-6 h-6" />
          <h3 className="font-semibold text-lg">Processamento Concluído!</h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Linhas Totais" value={totalRows} />
          <StatCard label="Atualizadas" value={rowsUpdated} />
          <StatCard label="Colunas Novas" value={columnsAdded} />
        </div>

        {newColumnsNames.length > 0 && (
          <div className="flex items-start gap-2 text-sm text-emerald-800 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-900/30 rounded-md p-3">
            <Columns3 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Colunas adicionadas:{" "}
              {newColumnsNames.map((name, i) => (
                <span key={name}>
                  <code className="bg-emerald-200/60 dark:bg-emerald-800/50 px-1.5 py-0.5 rounded text-xs font-mono">
                    {name}
                  </code>
                  {i < newColumnsNames.length - 1 && ", "}
                </span>
              ))}
            </span>
          </div>
        )}

        <button
          onClick={onDownload}
          className="flex items-center justify-center gap-2 mt-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition-colors shadow-sm"
        >
          <Download className="w-5 h-5" />
          Baixar Planilha Atualizada
        </button>
      </div>

      {/* Preview Table */}
      {mergedData.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center justify-between w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-750 transition-colors"
          >
            <span>Preview dos dados ({Math.min(PREVIEW_LIMIT, mergedData.length)} de {mergedData.length} linhas)</span>
            {showPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showPreview && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-zinc-100 dark:bg-zinc-800">
                    {columns.map((col) => (
                      <th
                        key={col}
                        className={`px-3 py-2 text-left font-semibold text-zinc-600 dark:text-zinc-400 whitespace-nowrap ${
                          newColumnsNames.includes(col)
                            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
                            : ""
                        }`}
                      >
                        {col}
                        {newColumnsNames.includes(col) && (
                          <span className="ml-1 text-[10px] text-emerald-500">●</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr
                      key={i}
                      className="border-t border-zinc-100 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    >
                      {columns.map((col) => (
                        <td
                          key={col}
                          className={`px-3 py-2 text-zinc-700 dark:text-zinc-300 whitespace-nowrap ${
                            newColumnsNames.includes(col)
                              ? "bg-emerald-50/50 dark:bg-emerald-900/20"
                              : ""
                          }`}
                        >
                          {String(row[col] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {mergedData.length > PREVIEW_LIMIT && (
                <div className="px-4 py-2 text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-800 border-t border-zinc-100 dark:border-zinc-700">
                  +{mergedData.length - PREVIEW_LIMIT} linhas adicionais no arquivo final
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center p-3 bg-white dark:bg-zinc-900 rounded-md border border-emerald-100 dark:border-emerald-800/50">
      <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{value}</span>
      <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{label}</span>
    </div>
  );
}
