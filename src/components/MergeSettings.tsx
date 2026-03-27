"use client";

import { ArrowRight, Key, Table2 } from "lucide-react";

interface MergeSettingsProps {
  columnsOld: string[];
  columnsNew: string[];
  selectedOld: string;
  selectedNew: string;
  onColumnOldChange: (col: string) => void;
  onColumnNewChange: (col: string) => void;
}

export function MergeSettings({
  columnsOld,
  columnsNew,
  selectedOld,
  selectedNew,
  onColumnOldChange,
  onColumnNewChange,
}: MergeSettingsProps) {
  if (columnsOld.length === 0 || columnsNew.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg text-white">
          <Key className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">
            Configurar Chaves de Relacionamento
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Selecione a coluna que servirá de identificador único para conectar as planilhas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Table2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Chave da Tabela Antiga
            </label>
          </div>
          <select 
            value={selectedOld}
            onChange={(e) => onColumnOldChange(e.target.value)}
            className="p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
          >
            <option value="" disabled>Selecione uma coluna...</option>
            {columnsOld.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Table2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Chave da Tabela Atualizada
            </label>
          </div>
          <select 
            value={selectedNew}
            onChange={(e) => onColumnNewChange(e.target.value)}
            className="p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
          >
            <option value="" disabled>Selecione uma coluna...</option>
            {columnsNew.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedOld && selectedNew && (
        <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-xl border border-violet-200/50 dark:border-violet-800/50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
              {selectedOld}
            </span>
            <ArrowRight className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              {selectedNew}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}