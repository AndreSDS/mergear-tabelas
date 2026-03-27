import * as XLSX from "xlsx";

export type Row = Record<string, unknown>;

export interface MergeStats {
  totalRows: number;
  rowsUpdated: number;
  columnsAdded: number;
  newColumnsNames: string[];
}

export interface MergeResult {
  merged: Row[];
  stats: MergeStats;
}

export async function readExcelToJSON(file: File): Promise<Row[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json<Row>(sheet);
}

export function getColumns(data: Row[]): string[] {
  if (data.length === 0) return [];
  const colSet = new Set<string>();
  for (const row of data) {
    for (const key of Object.keys(row)) {
      colSet.add(key);
    }
  }
  return Array.from(colSet);
}

export function mergeTables(
  oldData: Row[],
  newData: Row[],
  oldKey: string,
  newKey: string
): MergeResult {
  const oldColumns = getColumns(oldData);
  const newColumns = getColumns(newData);

  const addedColumns = newColumns.filter(
    (col) => !oldColumns.includes(col) && col !== newKey
  );

  const allColumns = [
    ...oldColumns,
    ...addedColumns,
  ];

  const newMap = new Map<string, Row>();
  for (const row of newData) {
    const key = String(row[newKey] ?? "");
    if (key) newMap.set(key, row);
  }

  let rowsUpdated = 0;

  const merged: Row[] = oldData.map((oldRow) => {
    const keyValue = String(oldRow[oldKey] ?? "");
    const newRow = newMap.get(keyValue);

    const result: Row = {};

    for (const col of allColumns) {
      if (newRow && col in newRow) {
        result[col] = newRow[col];
      } else if (col in oldRow) {
        result[col] = oldRow[col];
      } else {
        result[col] = "";
      }
    }

    if (newRow) {
      rowsUpdated++;
      newMap.delete(keyValue);
    }

    return result;
  });

  for (const [, newRow] of newMap) {
    const result: Row = {};
    for (const col of allColumns) {
      if (col === oldKey && oldKey !== newKey) {
        result[col] = newRow[newKey] ?? "";
      } else if (col in newRow) {
        result[col] = newRow[col];
      } else {
        result[col] = "";
      }
    }
    merged.push(result);
  }

  return {
    merged,
    stats: {
      totalRows: merged.length,
      rowsUpdated,
      columnsAdded: addedColumns.length,
      newColumnsNames: addedColumns,
    },
  };
}

export function exportJSONToExcel(data: Row[], filename: string): void {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Resultado");

  const ext = filename.split(".").pop()?.toLowerCase() ?? "xlsx";
  const bookType = ext === "csv" ? "csv" : ext === "xls" ? "xls" : "xlsx";

  const wbOut = XLSX.write(workbook, { bookType, type: "array" });

  const mimeMap: Record<string, string> = {
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    csv: "text/csv;charset=utf-8",
  };

  const blob = new Blob([wbOut], { type: mimeMap[bookType] ?? mimeMap.xlsx });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
