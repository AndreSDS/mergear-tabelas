"use client";

import { useReducer, useCallback } from "react";
import {
  readExcelToJSON,
  getColumns,
  mergeTables,
  type Row,
  type MergeStats,
} from "@/lib/excel-util";

export type Step = 1 | 2 | 3;

interface FilesState {
  oldFile: File | null;
  newFile: File | null;
  oldData: Row[];
  newData: Row[];
  oldColumns: string[];
  newColumns: string[];
}

interface MergeState {
  selectedOldKey: string;
  selectedNewKey: string;
  mergedData: Row[];
  mergeStats: MergeStats | null;
}

interface UIState {
  step: Step;
  processing: boolean;
  error: string | null;
}

export interface WorkflowState extends FilesState, MergeState, UIState {}

type Action =
  | { type: "SET_OLD_FILE"; file: File; data: Row[]; columns: string[] }
  | { type: "SET_NEW_FILE"; file: File; data: Row[]; columns: string[] }
  | { type: "SET_OLD_KEY"; key: string }
  | { type: "SET_NEW_KEY"; key: string }
  | { type: "SET_MERGE_RESULT"; merged: Row[]; stats: MergeStats }
  | { type: "SET_STEP"; step: Step }
  | { type: "SET_PROCESSING"; processing: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "RESET" };

const initialState: WorkflowState = {
  step: 1,
  oldFile: null,
  newFile: null,
  oldData: [],
  newData: [],
  oldColumns: [],
  newColumns: [],
  selectedOldKey: "",
  selectedNewKey: "",
  mergedData: [],
  mergeStats: null,
  processing: false,
  error: null,
};

function mergeReducer(state: WorkflowState, action: Action): WorkflowState {
  switch (action.type) {
    case "SET_OLD_FILE":
      return {
        ...state,
        oldFile: action.file,
        oldData: action.data,
        oldColumns: action.columns,
        error: null,
      };
    case "SET_NEW_FILE":
      return {
        ...state,
        newFile: action.file,
        newData: action.data,
        newColumns: action.columns,
        error: null,
      };
    case "SET_OLD_KEY":
      return { ...state, selectedOldKey: action.key };
    case "SET_NEW_KEY":
      return { ...state, selectedNewKey: action.key };
    case "SET_MERGE_RESULT":
      return {
        ...state,
        mergedData: action.merged,
        mergeStats: action.stats,
      };
    case "SET_STEP":
      return { ...state, step: action.step };
    case "SET_PROCESSING":
      return { ...state, processing: action.processing };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export function useMergeWorkflow() {
  const [state, dispatch] = useReducer(mergeReducer, initialState);

  const handleOldFile = useCallback(async (file: File) => {
    try {
      const data = await readExcelToJSON(file);
      dispatch({
        type: "SET_OLD_FILE",
        file,
        data,
        columns: getColumns(data),
      });
    } catch {
      dispatch({
        type: "SET_ERROR",
        error:
          "Erro ao ler a Tabela Base. Verifique se é um arquivo .xlsx ou .csv válido.",
      });
    }
  }, []);

  const handleNewFile = useCallback(async (file: File) => {
    try {
      const data = await readExcelToJSON(file);
      dispatch({
        type: "SET_NEW_FILE",
        file,
        data,
        columns: getColumns(data),
      });
    } catch {
      dispatch({
        type: "SET_ERROR",
        error:
          "Erro ao ler a Tabela Atualizada. Verifique se é um arquivo .xlsx ou .csv válido.",
      });
    }
  }, []);

  const handleMerge = useCallback(async () => {
    if (!state.selectedOldKey || !state.selectedNewKey) return;

    dispatch({ type: "SET_PROCESSING", processing: true });
    dispatch({ type: "SET_ERROR", error: null });

    try {
      await new Promise((r) => setTimeout(r, 50));

      const result = mergeTables(
        state.oldData,
        state.newData,
        state.selectedOldKey,
        state.selectedNewKey
      );
      dispatch({
        type: "SET_MERGE_RESULT",
        merged: result.merged,
        stats: result.stats,
      });
      dispatch({ type: "SET_STEP", step: 3 });
    } catch {
      dispatch({
        type: "SET_ERROR",
        error:
          "Erro ao processar o merge. Verifique se as chaves selecionadas são válidas.",
      });
    } finally {
      dispatch({ type: "SET_PROCESSING", processing: false });
    }
  }, [state.oldData, state.newData, state.selectedOldKey, state.selectedNewKey]);

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const goToStep = useCallback((step: Step) => {
    dispatch({ type: "SET_STEP", step });
  }, []);

  const setSelectedOldKey = useCallback((key: string) => {
    dispatch({ type: "SET_OLD_KEY", key });
  }, []);

  const setSelectedNewKey = useCallback((key: string) => {
    dispatch({ type: "SET_NEW_KEY", key });
  }, []);

  return {
    ...state,
    handleOldFile,
    handleNewFile,
    handleMerge,
    handleReset,
    goToStep,
    setSelectedOldKey,
    setSelectedNewKey,
  };
}
