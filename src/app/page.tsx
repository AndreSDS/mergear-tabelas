"use client";

import { FileUpload } from "@/components/FileUpload";
import { MergeSettings } from "@/components/MergeSettings";
import { SummaryPanel } from "@/components/SummaryPanel";
import { exportJSONToExcel } from "@/lib/excel-util";
import { useMergeWorkflow, type Step } from "@/hooks/useMergeWorkflow";
import { FileSpreadsheet, ArrowRight, Loader2 } from "lucide-react";

export default function Home() {
  const {
    step,
    oldFile,
    newFile,
    oldData,
    newData,
    oldColumns,
    newColumns,
    selectedOldKey,
    selectedNewKey,
    mergedData,
    mergeStats,
    processing,
    error,
    handleOldFile,
    handleNewFile,
    handleMerge,
    handleReset,
    goToStep,
    setSelectedOldKey,
    setSelectedNewKey,
  } = useMergeWorkflow();

  const canProceedToStep2 = oldFile !== null && newFile !== null && oldData.length > 0 && newData.length > 0;
  const canProcess = selectedOldKey !== "" && selectedNewKey !== "";

  function handleDownload() {
    if (mergedData.length === 0 || !oldFile) return;
    const dotIndex = oldFile.name.lastIndexOf(".");
    const ext = dotIndex !== -1 ? oldFile.name.slice(dotIndex + 1) : "xlsx";
    exportJSONToExcel(mergedData, `tabela_atualizada.${ext}`);
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-zinc-950 font-sans">
      <main className="flex flex-col w-full max-w-2xl py-12 px-6 gap-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Comparador de Tabelas
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Mescle duas planilhas Excel direto no navegador — 100% privado.
            </p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 text-sm font-medium">
          <StepBadge n={1} current={step} label="Upload" />
          <ArrowRight className="w-4 h-4 text-zinc-300" />
          <StepBadge n={2} current={step} label="Configurar" />
          <ArrowRight className="w-4 h-4 text-zinc-300" />
          <StepBadge n={3} current={step} label="Resultado" />
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {/* Step 1 — Upload */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">
              1. Enviar Planilhas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileUpload
                label="Tabela Base (Antiga)"
                onFileUpload={handleOldFile}
                accept=".xlsx,.xls,.csv"
                description={oldFile ? `✓ ${oldFile.name}` : ".xlsx, .xls ou .csv"}
              />
              <FileUpload
                label="Tabela Atualizada (Nova)"
                onFileUpload={handleNewFile}
                accept=".xlsx,.xls,.csv"
                description={newFile ? `✓ ${newFile.name}` : ".xlsx, .xls ou .csv"}
              />
            </div>

            <button
              disabled={!canProceedToStep2}
              onClick={() => goToStep(2)}
              className="self-end flex items-center gap-2 py-2.5 px-5 bg-zinc-900 text-white font-medium rounded-md transition-colors hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Próximo
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2 — Config */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <MergeSettings
              columnsOld={oldColumns}
              columnsNew={newColumns}
              selectedOld={selectedOldKey}
              selectedNew={selectedNewKey}
              onColumnOldChange={setSelectedOldKey}
              onColumnNewChange={setSelectedNewKey}
            />

            <div className="flex items-center justify-between">
              <button
                onClick={() => goToStep(1)}
                className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
              >
                ← Voltar
              </button>
              <button
                disabled={!canProcess || processing}
                onClick={handleMerge}
                className="flex items-center gap-2 py-2.5 px-5 bg-emerald-600 text-white font-medium rounded-md transition-colors hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Processar Merge"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Result */}
        {step === 3 && mergeStats && (
          <div className="flex flex-col gap-6">
            <SummaryPanel
              totalRows={mergeStats.totalRows}
              rowsUpdated={mergeStats.rowsUpdated}
              columnsAdded={mergeStats.columnsAdded}
              newColumnsNames={mergeStats.newColumnsNames}
              mergedData={mergedData}
              onDownload={handleDownload}
            />

            <button
              onClick={handleReset}
              className="self-start text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
            >
              ← Começar de novo
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function StepBadge({ n, current, label }: { n: number; current: Step; label: string }) {
  const isActive = n === current;
  const isDone = n < current;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs transition-colors ${
        isActive
          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          : isDone
            ? "bg-emerald-100 text-emerald-700"
            : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
      }`}
    >
      {label}
    </span>
  );
}
