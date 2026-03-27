import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import * as excelUtil from "@/lib/excel-util";
import type { Row, MergeResult } from "@/lib/excel-util";

// Mock lucide-react icons (simple stubs)
vi.mock("lucide-react", () => ({
  FileSpreadsheet: (props: Record<string, unknown>) => React.createElement("svg", props),
  ArrowRight: (props: Record<string, unknown>) => React.createElement("svg", props),
  Loader2: (props: Record<string, unknown>) => React.createElement("svg", props),
  Download: (props: Record<string, unknown>) => React.createElement("svg", props),
  CheckCircle2: (props: Record<string, unknown>) => React.createElement("svg", props),
  ChevronDown: (props: Record<string, unknown>) => React.createElement("svg", props),
  ChevronUp: (props: Record<string, unknown>) => React.createElement("svg", props),
  Columns3: (props: Record<string, unknown>) => React.createElement("svg", props),
  UploadCloud: (props: Record<string, unknown>) => React.createElement("svg", props),
}));

// We need to import Home after mocking
import Home from "@/app/page";

// Spy on the export function
const exportSpy = vi.spyOn(excelUtil, "exportJSONToExcel").mockImplementation(() => {});

// Mock readExcelToJSON
const readSpy = vi.spyOn(excelUtil, "readExcelToJSON");

// Mock mergeTables
const mergeSpy = vi.spyOn(excelUtil, "mergeTables");

// Mock getColumns
const getColumnsSpy = vi.spyOn(excelUtil, "getColumns");

/**
 * Helper: simula o fluxo completo de upload -> config -> merge -> download
 * e retorna o nome do arquivo passado para exportJSONToExcel.
 */
async function simulateDownloadFlow(
  oldFileName: string,
  mergedRows: Row[] = [{ ID: 1, Nome: "Teste" }]
): Promise<string | undefined> {
  const oldData: Row[] = [{ ID: 1, Nome: "Ana" }];
  const newData: Row[] = [{ ID: 1, Nome: "Ana L." }];

  readSpy.mockResolvedValueOnce(oldData).mockResolvedValueOnce(newData);
  getColumnsSpy.mockReturnValue(["ID", "Nome"]);

  const mergeResult: MergeResult = {
    merged: mergedRows,
    stats: { totalRows: mergedRows.length, rowsUpdated: 1, columnsAdded: 0, newColumnsNames: [] },
  };
  mergeSpy.mockReturnValue(mergeResult);

  exportSpy.mockClear();

  render(<Home />);

  // Step 1 — Upload old file
  const fileInputs = document.querySelectorAll('input[type="file"]');
  const oldInput = fileInputs[0] as HTMLInputElement;
  const oldFile = new File(["dummy"], oldFileName, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  fireEvent.change(oldInput, { target: { files: [oldFile] } });

  await waitFor(() => expect(readSpy).toHaveBeenCalledTimes(1));

  // Step 1 — Upload new file
  const newInput = fileInputs[1] as HTMLInputElement;
  const newFile = new File(["dummy"], "nova.xlsx", {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  fireEvent.change(newInput, { target: { files: [newFile] } });

  await waitFor(() => expect(readSpy).toHaveBeenCalledTimes(2));

  // Step 1 — Click "Próximo"
  const nextButton = screen.getByText("Próximo");
  fireEvent.click(nextButton);

  // Step 2 — Select keys and merge
  await waitFor(() => {
    expect(screen.getByText("Processar Merge")).toBeInTheDocument();
  });

  // Select primary keys from dropdowns
  const selects = document.querySelectorAll("select");
  if (selects.length >= 2) {
    fireEvent.change(selects[0], { target: { value: "ID" } });
    fireEvent.change(selects[1], { target: { value: "ID" } });
  }

  const mergeButton = screen.getByText("Processar Merge");
  fireEvent.click(mergeButton);

  // Step 3 — Wait for result and click download
  await waitFor(() => {
    expect(screen.getByText("Baixar Planilha Atualizada")).toBeInTheDocument();
  });

  const downloadButton = screen.getByText("Baixar Planilha Atualizada");
  fireEvent.click(downloadButton);

  return exportSpy.mock.calls[0]?.[1];
}

describe("handleDownload — extensão do arquivo de download", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gera download com .xlsx quando o arquivo antigo é .xlsx", async () => {
    const filename = await simulateDownloadFlow("tabela_ANTIGA.xlsx");
    expect(filename).toBe("tabela_atualizada.xlsx");
  });

  it("gera download com .xls quando o arquivo antigo é .xls", async () => {
    const filename = await simulateDownloadFlow("dados.xls");
    expect(filename).toBe("tabela_atualizada.xls");
  });

  it("gera download com .csv quando o arquivo antigo é .csv", async () => {
    const filename = await simulateDownloadFlow("export.csv");
    expect(filename).toBe("tabela_atualizada.csv");
  });

  it("gera download com .xlsx quando o arquivo antigo não tem extensão", async () => {
    const filename = await simulateDownloadFlow("arquivo");
    expect(filename).toBe("tabela_atualizada.xlsx");
  });

  it("usa a última extensão quando há múltiplos pontos no nome", async () => {
    const filename = await simulateDownloadFlow("backup.2024.xlsx");
    expect(filename).toBe("tabela_atualizada.xlsx");
  });

  it("não chama exportJSONToExcel quando não há dados merged", async () => {
    await simulateDownloadFlow("teste.xlsx", []);
    // mergedData vazio → handleDownload retorna early
    expect(exportSpy).not.toHaveBeenCalled();
  });
});
