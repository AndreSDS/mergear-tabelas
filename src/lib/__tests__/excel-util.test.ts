import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getColumns, mergeTables, exportJSONToExcel, type Row } from "../excel-util";

// ============================================================
// getColumns
// ============================================================
describe("getColumns", () => {
  it("retorna array vazio para dados vazios", () => {
    expect(getColumns([])).toEqual([]);
  });

  it("extrai colunas de uma única linha", () => {
    const data: Row[] = [{ Nome: "Ana", Idade: 30 }];
    const cols = getColumns(data);
    expect(cols).toContain("Nome");
    expect(cols).toContain("Idade");
    expect(cols).toHaveLength(2);
  });

  it("retorna colunas únicas quando múltiplas linhas têm as mesmas chaves", () => {
    const data: Row[] = [
      { A: 1, B: 2 },
      { A: 3, B: 4 },
    ];
    expect(getColumns(data)).toEqual(["A", "B"]);
  });

  it("combina colunas de linhas diferentes (union)", () => {
    const data: Row[] = [{ A: 1 }, { B: 2 }];
    const cols = getColumns(data);
    expect(cols).toContain("A");
    expect(cols).toContain("B");
    expect(cols).toHaveLength(2);
  });
});

// ============================================================
// mergeTables
// ============================================================
describe("mergeTables", () => {
  const oldData: Row[] = [
    { ID: 1, Nome: "Ana", Cargo: "Dev" },
    { ID: 2, Nome: "Bruno", Cargo: "QA" },
    { ID: 3, Nome: "Carlos", Cargo: "PM" },
  ];

  it("mescla quando todas as chaves correspondem", () => {
    const newData: Row[] = [
      { ID: 1, Nome: "Ana L." },
      { ID: 2, Nome: "Bruno S." },
      { ID: 3, Nome: "Carlos M." },
    ];

    const result = mergeTables(oldData, newData, "ID", "ID");

    expect(result.merged).toHaveLength(3);
    expect(result.stats.rowsUpdated).toBe(3);
    expect(result.stats.totalRows).toBe(3);
    expect(result.stats.columnsAdded).toBe(0);

    expect(result.merged[0].Nome).toBe("Ana L.");
    expect(result.merged[0].Cargo).toBe("Dev");
  });

  it("mantém linhas antigas sem correspondência", () => {
    const newData: Row[] = [{ ID: 1, Nome: "Ana L." }];

    const result = mergeTables(oldData, newData, "ID", "ID");

    expect(result.merged).toHaveLength(3);
    expect(result.stats.rowsUpdated).toBe(1);
    expect(result.merged[1].Nome).toBe("Bruno");
    expect(result.merged[2].Nome).toBe("Carlos");
  });

  it("adiciona linhas novas que não existem na tabela antiga", () => {
    const newData: Row[] = [
      { ID: 1, Nome: "Ana L." },
      { ID: 4, Nome: "Diana", Cargo: "Designer" },
    ];

    const result = mergeTables(oldData, newData, "ID", "ID");

    expect(result.merged).toHaveLength(4);
    expect(result.merged[3].Nome).toBe("Diana");
    expect(result.merged[3].ID).toBe(4);
  });

  it("adiciona colunas novas presentes apenas na tabela nova", () => {
    const newData: Row[] = [
      { ID: 1, Email: "ana@test.com" },
    ];

    const result = mergeTables(oldData, newData, "ID", "ID");

    expect(result.stats.columnsAdded).toBe(1);
    expect(result.stats.newColumnsNames).toContain("Email");
    expect(result.merged[0]).toHaveProperty("Email", "ana@test.com");
    expect(result.merged[1]).toHaveProperty("Email", "");
  });

  it("funciona com chaves com nomes diferentes (oldKey ≠ newKey)", () => {
    const newData: Row[] = [
      { codigo: 1, Nome: "Ana L." },
      { codigo: 2, Nome: "Bruno S." },
    ];

    const result = mergeTables(oldData, newData, "ID", "codigo");

    expect(result.stats.rowsUpdated).toBe(2);
    expect(result.merged[0].Nome).toBe("Ana L.");
    expect(result.merged[1].Nome).toBe("Bruno S.");
  });

  it("ignora linhas com chave vazia/nula na tabela nova", () => {
    const newData: Row[] = [
      { ID: null, Nome: "Ghost" },
      { ID: "", Nome: "Empty" },
      { ID: 1, Nome: "Ana L." },
    ];

    const result = mergeTables(oldData, newData, "ID", "ID");

    expect(result.stats.rowsUpdated).toBe(1);
    expect(result.merged).toHaveLength(3);
  });

  it("retorna stats corretos", () => {
    const newData: Row[] = [
      { ID: 1, Nome: "Ana L.", Email: "ana@test.com" },
      { ID: 4, Nome: "Diana", Email: "diana@test.com" },
    ];

    const result = mergeTables(oldData, newData, "ID", "ID");

    expect(result.stats).toEqual({
      totalRows: 4,
      rowsUpdated: 1,
      columnsAdded: 1,
      newColumnsNames: ["Email"],
    });
  });

  it("não altera os dados originais", () => {
    const oldCopy = JSON.parse(JSON.stringify(oldData));
    const newData: Row[] = [{ ID: 1, Nome: "Ana L." }];

    mergeTables(oldData, newData, "ID", "ID");

    expect(oldData).toEqual(oldCopy);
  });
});

// ============================================================
// exportJSONToExcel — extensão e MIME type
// ============================================================
describe("exportJSONToExcel", () => {
  const sampleData: Row[] = [{ A: 1, B: 2 }];

  let createElementSpy: ReturnType<typeof vi.spyOn>;
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let appendChildSpy: ReturnType<typeof vi.spyOn>;
  let removeChildSpy: ReturnType<typeof vi.spyOn>;
  let clickSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    clickSpy = vi.fn();

    createElementSpy = vi.spyOn(document, "createElement").mockReturnValue({
      href: "",
      download: "",
      click: clickSpy,
    } as unknown as HTMLAnchorElement);

    appendChildSpy = vi
      .spyOn(document.body, "appendChild")
      .mockImplementation((node) => node);
    removeChildSpy = vi
      .spyOn(document.body, "removeChild")
      .mockImplementation((node) => node);

    createObjectURLSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:mock-url");
    revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("gera download com extensão .xlsx e MIME correto", () => {
    exportJSONToExcel(sampleData, "resultado.xlsx");

    expect(createElementSpy).toHaveBeenCalledWith("a");

    const anchor = createElementSpy.mock.results[0].value as unknown as HTMLAnchorElement;
    expect(anchor.download).toBe("resultado.xlsx");

    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(blob.type).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it("gera download com extensão .xls e MIME correto", () => {
    exportJSONToExcel(sampleData, "resultado.xls");

    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(blob.type).toBe("application/vnd.ms-excel");
  });

  it("gera download com extensão .csv e MIME correto", () => {
    exportJSONToExcel(sampleData, "resultado.csv");

    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(blob.type).toBe("text/csv;charset=utf-8");
  });

  it("fallback para xlsx quando extensão é desconhecida", () => {
    exportJSONToExcel(sampleData, "resultado.ods");

    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(blob.type).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  });

  it("fallback para xlsx quando não há extensão", () => {
    exportJSONToExcel(sampleData, "resultado");

    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(blob.type).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  });

  it("é case-insensitive para extensões", () => {
    exportJSONToExcel(sampleData, "resultado.CSV");

    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(blob.type).toBe("text/csv;charset=utf-8");
  });

  it("cria e limpa o elemento anchor do DOM", () => {
    exportJSONToExcel(sampleData, "teste.xlsx");

    expect(appendChildSpy).toHaveBeenCalledOnce();

    vi.advanceTimersByTime(100);

    expect(removeChildSpy).toHaveBeenCalledOnce();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");
  });

  it("define o atributo download com o nome correto do arquivo", () => {
    exportJSONToExcel(sampleData, "tabela_atualizada.csv");

    const anchor = createElementSpy.mock.results[0].value as unknown as HTMLAnchorElement;
    expect(anchor.download).toBe("tabela_atualizada.csv");
  });
});
