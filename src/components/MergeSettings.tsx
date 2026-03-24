"use client";

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
    <div className="flex flex-col gap-4 p-4 border border-zinc-200 rounded-lg bg-white mt-4 shadow-sm">
      <h3 className="font-semibold text-zinc-800">2. Configurar Chaves de Relacionamento</h3>
      <p className="text-sm text-zinc-600">Selecione a coluna que servirá de identificador único (ex: ID, CPF, Email) para conectar as duas planilhas.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Chave da Tabela Antiga</label>
          <select 
            value={selectedOld}
            onChange={(e) => onColumnOldChange(e.target.value)}
            className="p-2 border border-zinc-300 rounded-md bg-zinc-50 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>Selecione uma coluna...</option>
            {columnsOld.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Chave da Tabela Atualizada</label>
          <select 
            value={selectedNew}
            onChange={(e) => onColumnNewChange(e.target.value)}
            className="p-2 border border-zinc-300 rounded-md bg-zinc-50 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>Selecione uma coluna...</option>
            {columnsNew.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
