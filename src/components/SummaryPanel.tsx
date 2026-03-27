"use client";

import { useState } from "react";
import { Download, CheckCircle2, ChevronDown, ChevronUp, Columns3, BarChart3, RowsIcon, Sparkles } from "lucide-react";
import type { Row } from "@/lib/excel-util";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col gap-6">
      {/* Stats Card Modern */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg text-white">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">
              Processamento Concluído!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sua planilha está pronta para download
            </p>
          </div>
        </div>

        {/* Estatísticas em cards coloridos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            label="Linhas Totais" 
            value={totalRows} 
            icon={<RowsIcon className="w-5 h-5" />}
            gradient="from-violet-500 to-purple-500"
          />
          <StatCard 
            label="Atualizadas" 
            value={rowsUpdated} 
            icon={<BarChart3 className="w-5 h-5" />}
            gradient="from-emerald-500 to-teal-500"
          />
          <StatCard 
            label="Colunas Novas" 
            value={columnsAdded} 
            icon={<Sparkles className="w-5 h-5" />}
            gradient="from-rose-500 to-pink-500"
          />
        </div>

        {/* Colunas adicionadas */}
        {newColumnsNames.length > 0 && (
          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-xl border border-violet-200/50 dark:border-violet-800/50">
            <Columns3 className="w-5 h-5 text-violet-600 dark:text-violet-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-violet-800 dark:text-violet-200 mb-2">
                Colunas adicionadas:
              </p>
              <div className="flex flex-wrap gap-2">
                {newColumnsNames.map((name) => (
                  <span 
                    key={name}
                    className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Botão de download */}
        <Button
          onClick={onDownload}
          className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30"
        >
          <Download className="w-5 h-5" />
          Baixar Planilha Atualizada
        </Button>
      </div>

      {/* Preview Table Modern */}
      {mergedData.length > 0 && (
        <div className="border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-lg">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center justify-between w-full px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 text-sm font-medium text-gray-700 dark:text-gray-300 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-750 dark:hover:to-gray-800 transition-all duration-200"
          >
            <span>Preview dos dados ({Math.min(PREVIEW_LIMIT, mergedData.length)} de {mergedData.length} linhas)</span>
            {showPreview ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {showPreview && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850">
                    {columns.map((col) => (
                      <th
                        key={col}
                        className={`px-4 py-3 text-left font-semibold whitespace-nowrap ${
                          newColumnsNames.includes(col)
                            ? "bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40 text-violet-700 dark:text-violet-300"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {col}
                          {newColumnsNames.includes(col) && (
                            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr
                      key={i}
                      className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      {columns.map((col) => (
                        <td
                          key={col}
                          className={`px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap ${
                            newColumnsNames.includes(col)
                              ? "bg-violet-50/50 dark:bg-violet-900/20"
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
                <div className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center">
                  <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700">
                    +{mergedData.length - PREVIEW_LIMIT} linhas adicionais no arquivo final
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, gradient }: { 
  label: string; 
  value: number; 
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-6 bg-gradient-to-br ${gradient} rounded-2xl text-white shadow-lg`}>
      <div className="mb-3 opacity-80">{icon}</div>
      <span className="text-3xl font-bold mb-1">{value}</span>
      <span className="text-sm opacity-90">{label}</span>
    </div>
  );
}