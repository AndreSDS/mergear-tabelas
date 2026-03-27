"use client";

import { FileUploadModern } from "@/components/FileUploadModern";
import { MergeSettings } from "@/components/MergeSettings";
import { SummaryPanel } from "@/components/SummaryPanel";
import { exportJSONToExcel } from "@/lib/excel-util";
import { useMergeWorkflow, type Step } from "@/hooks/useMergeWorkflow";
import { FileSpreadsheet, ArrowRight, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CardModern } from "@/components/ui/card-modern";
import { StepperModern } from "@/components/StepperModern";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { showToast } from "@/components/ToastContainer";

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
    showToast.success("Download concluído!", "Sua planilha atualizada foi baixada com sucesso.");
  }

  const steps = [
    { id: 1, title: "Upload" },
    { id: 2, title: "Configurar" },
    { id: 3, title: "Resultado" },
  ];

  return (
    <div className="flex flex-col flex-1 items-center bg-gradient-to-br from-gray-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950 font-sans">
      {/* Header elegante */}
      <header className="w-full border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg blur opacity-20 animate-pulse" />
              <FileSpreadsheet className="w-7 h-7 text-violet-600 dark:text-violet-400 relative" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Comparador de Tabelas
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                100% privado — nenhum dado é enviado
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex flex-col w-full max-w-4xl py-8 px-4 gap-8 flex-1">
        {/* Stepper moderno */}
        <CardModern variant="glass" padding="lg" className="mt-4">
          <StepperModern
            steps={steps}
            currentStep={step - 1}
            onStepClick={(stepIndex) => {
              // Só permite voltar para etapas concluídas
              if (stepIndex < step - 1) {
                goToStep((stepIndex + 1) as Step);
              }
            }}
          />
        </CardModern>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 text-sm text-red-700 bg-red-50/80 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/50 rounded-xl backdrop-blur-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conteúdo das etapas */}
        <AnimatePresence mode="wait">
          {/* Step 1 — Upload */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <CardModern variant="gradient" padding="lg">
                <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-6">
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <FileUploadModern
                    label="Tabela Base (Antiga)"
                    onFileUpload={handleOldFile}
                    accept=".xlsx,.xls,.csv"
                    description=".xlsx, .xls ou .csv"
                    maxSizeMB={20}
                  />
                  <FileUploadModern
                    label="Tabela Atualizada (Nova)"
                    onFileUpload={handleNewFile}
                    accept=".xlsx,.xls,.csv"
                    description=".xlsx, .xls ou .csv"
                    maxSizeMB={20}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    disabled={!canProceedToStep2}
                    onClick={() => goToStep(2)}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25"
                  >
                    Próximo
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardModern>
            </motion.div>
          )}

          {/* Step 2 — Config */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <CardModern variant="colorful" padding="lg">
                <div className="flex flex-col gap-6">
                  <MergeSettings
                    columnsOld={oldColumns}
                    columnsNew={newColumns}
                    selectedOld={selectedOldKey}
                    selectedNew={selectedNewKey}
                    onColumnOldChange={setSelectedOldKey}
                    onColumnNewChange={setSelectedNewKey}
                  />

                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="ghost"
                      onClick={() => goToStep(1)}
                      className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      ← Voltar
                    </Button>
                    <Button
                      disabled={!canProcess || processing}
                      onClick={handleMerge}
                      className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        "Processar Merge"
                      )}
                    </Button>
                  </div>
                </div>
              </CardModern>
            </motion.div>
          )}

          {/* Step 3 — Result */}
          {step === 3 && mergeStats && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <CardModern variant="emerald" padding="lg">
                <SummaryPanel
                  totalRows={mergeStats.totalRows}
                  rowsUpdated={mergeStats.rowsUpdated}
                  columnsAdded={mergeStats.columnsAdded}
                  newColumnsNames={mergeStats.newColumnsNames}
                  mergedData={mergedData}
                  onDownload={handleDownload}
                />

                <div className="mt-6">
                  <Button
                    variant="ghost"
                    onClick={handleReset}
                    className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    ← Começar de novo
                  </Button>
                </div>
              </CardModern>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200/50 dark:border-gray-800/50">
        <p>Comparador de Tabelas — Processamento 100% local no seu navegador</p>
      </footer>
    </div>
  );
}