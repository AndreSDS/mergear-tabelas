# Documentação de Arquitetura – Comparador de Tabelas

> **Público:** Desenvolvedores experientes  
> **Objetivo:** Compreender a arquitetura, decisões de design e fluxos técnicos do projeto  
> **Formato:** Referência técnica (Diátxis – quadrant Referência)  
> **Última atualização:** 27 de março de 2026

---

## 1. Visão Geral do Projeto

**Comparador de Tabelas** é uma aplicação web que permite mesclar duas planilhas Excel (antiga e nova) 100% no navegador, sem envio de dados a servidores. A ferramenta identifica linhas correspondentes via uma coluna chave e mescla automaticamente colunas novas, exportando o resultado atualizado.

### Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| **Framework** | vinext (Vite + Next.js App Router) | vinext 0.0.36 |
| **Runtime** | React | 19.2.4 |
| **Estilização** | Tailwind CSS + shadcn/ui | Tailwind 4, shadcn 4.1.0 |
| **Processamento Excel** | xlsx (client-side) | 0.18.5 |
| **Deploy** | Cloudflare Workers | – |
| **Testes** | Vitest + Testing Library | Vitest 4.1.1 |

### Principais Características
- **Privacidade:** Todo processamento ocorre no browser; nenhum upload para servidor.
- **Offline:** Funciona sem conexão após o carregamento inicial.
- **Portabilidade:** Deploy como Worker estático com assets incluídos.

---

## 2. Arquitetura de Diretórios

```
comparador-tabelas/
├── src/
│   ├── app/                    # App Router (Next.js 16)
│   │   ├── layout.tsx          # Layout raíz (fonts, metadata)
│   │   ├── page.tsx            # Página principal (client component)
│   │   └── globals.css         # Estilos globais (Tailwind)
│   ├── components/
│   │   ├── FileUpload.tsx      # Upload de arquivo via drag‑and‑drop
│   │   ├── MergeSettings.tsx   # Seleção de colunas chave
│   │   ├── SummaryPanel.tsx    # Resultado e estatísticas
│   │   └── ui/                 # Componentes shadcn (button, etc.)
│   ├── hooks/
│   │   └── useMergeWorkflow.ts # Lógica central de estado (useReducer)
│   ├── lib/
│   │   ├── excel-util.ts       # Funções de leitura, merge e exportação
│   │   └── utils.ts            # Utilitários gerais (cn, etc.)
│   └── test/
│       ├── setup.ts            # Configuração de testes
│       └── ...                 # Testes de componentes e hooks
├── public/                     # Estáticos (favicon, imagens)
├── worker/                     # Entrada do Worker (gerado)
├── dist/                       # Saída do build (gerado)
├── docs/                       # Documentação
└── ... (arquivos de configuração)
```

### Papéis dos Diretórios Principais
- **`src/app/`**: Define rotas e layout via App Router. Apenas uma página (`page.tsx`) que renderiza todo o fluxo.
- **`src/components/`**: Componentes React focados em UI, sem lógica de negócio.
- **`src/hooks/`**: Hook `useMergeWorkflow` concentra todo o estado e ações do workflow (upload → configuração → merge → resultado).
- **`src/lib/`**: Funções puras para manipulação de Excel (`excel-util.ts`), sem dependência de React.

---

## 3. Diagrama de Fluxo de Dados

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  FileUpload     │───▶│  readExcelToJSON  │───▶│  Estado local   │
│  (old/new)      │    │  (xlsx parse)     │    │  (useReducer)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │  MergeSettings  │
                                              │  (seleção de    │
                                              │   colunas chave)│
                                              └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │  mergeTables    │
                                              │  (lógica de     │
                                              │   corresponência│
                                              │   e combinação) │
                                              └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │  SummaryPanel   │
                                              │  (exibição de   │
                                              │   estatísticas) │
                                              └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │exportJSONToExcel│
                                              │  (download do   │
                                              │   arquivo XLSX) │
                                              └─────────────────┘
```

### Detalhes do Fluxo
1. **Upload:** O usuário arrasta ou seleciona dois arquivos `.xlsx`/`.csv`.
2. **Parsing:** `readExcelToJSON` converte a primeira planilha em array de objetos (`Row[]`).
3. **Extração de colunas:** `getColumns` coleta todas as chaves únicas dos objetos.
4. **Configuração:** O usuário seleciona uma coluna chave em cada tabela para correspondência.
5. **Merge:** `mergeTables` combina as tabelas:
   - Para cada linha da tabela antiga, procura correspondência na nova via chave.
   - Adiciona colunas novas que não existiam na tabela antiga.
   - Linhas novas (sem correspondência) são incluídas no final.
6. **Resultado:** Estatísticas (total de linhas, atualizadas, colunas novas) são exibidas.
7. **Exportação:** `exportJSONToExcel` gera um arquivo XLSX/CSV para download.

---

## 4. Configuração e Build

### Arquivos de Configuração Críticos

| Arquivo | Função | Observações |
|---------|--------|-------------|
| `package.json` | Dependências e scripts | `"type": "module"` habilitado |
| `vite.config.ts` | Configuração do Vite + vinext + Cloudflare | Inclui `vinext()` e `cloudflare()` plugins |
| `wrangler.jsonc` | Configuração do Worker Cloudflare | Gerado pelo `vinext deploy` |
| `next.config.ts` | Configuração Next.js (lida pelo vinext) | Mínima, vazia |
| `tsconfig.json` | Configuração TypeScript | Path alias `@/*` para `src/*` |
| `vitest.config.ts` | Configuração de testes | Usa `@vitejs/plugin-react` |
| `postcss.config.mjs` | Processamento CSS (Tailwind) | Plugin `@tailwindcss/postcss` |

### Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| `dev` | `vinext dev --port 3001` | Servidor de desenvolvimento (vinext) |
| `build` | `vinext build` | Build de produção para Workers |
| `start` | `vinext start` | Servidor de produção local |
| `deploy` | `vinext deploy` | Build + deploy para Cloudflare Workers |
| `test` | `vitest run` | Executa testes |
| `lint` | `eslint` | Linting com configuração Next.js |

### Variáveis de Ambiente
Nenhuma variável de ambiente é necessária; a aplicação é 100% client‑side.

---

## 5. Integração Cloudflare Workers

### Configuração do Worker (`wrangler.jsonc`)

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "comparador-tabelas",
  "compatibility_date": "2026-03-27",
  "compatibility_flags": ["nodejs_compat"],
  "main": "./worker/index.ts",
  "assets": {
    "directory": "dist/client",
    "not_found_handling": "none",
    "binding": "ASSETS"
  },
  "images": {
    "binding": "IMAGES"
  }
}
```

### Entrada do Worker (`worker/index.ts`)
- **Função:** Ponto de entrada do Worker; serve assets estáticos e lida com otimização de imagens.
- **Bindings:**
  - `ASSETS`: Acesso aos arquivos estáticos (HTML, CSS, JS).
  - `IMAGES`: Otimização de imagens via Cloudflare Images.
- **Roteamento:** Todas as requisições são delegadas a `vinext/server/app-router‑entry` (exceto `/_vinext/image`).

### Deploy Automatizado
O comando `pnpm vinext deploy`:
1. Instala `@cloudflare/vite-plugin` e `wrangler`.
2. Gera `wrangler.jsonc` e `worker/index.ts` (se não existirem).
3. Faz o build do projeto (ambientes RSC, SSR e client).
4. Faz upload dos assets e do Worker.
5. Retorna a URL do Worker (ex: `https://comparador-tabelas.rammpk.workers.dev`).

---

## 6. Sistema de Estilização

### Tailwind CSS 4
- **Configuração:** Via plugin `@tailwindcss/postcss` (arquivo `postcss.config.mjs`).
- **Customização:** Variáveis CSS definidas em `globals.css` (ex: `--font‑geist‑sans`).
- **Modo escuro:** Implementado via classes Tailwind (`dark:`), sem script toggle.

### shadcn/ui
- **Componentes:** Button, Card, etc., localizados em `src/components/ui/`.
- **Integração:** Utilitário `cn()` (em `src/lib/utils.ts`) para mesclar classes Tailwind.
- **Temas:** Cores e estilos seguem o padrão shadcn (variáveis CSS).

### Fonts
- **Geist Sans e Geist Mono:** Importadas via `next/font/google` (CDN, não self‑hosted).
- **Variáveis CSS:** `--font‑geist‑sans` e `--font‑geist‑mono` usadas no layout.

---

## 7. Processamento de Excel

### Biblioteca `xlsx`
- **Uso:** Somente no client‑side; não importada em componentes server.
- **Funções principais:**
  - `readExcelToJSON(file)`: Lê arquivo (ArrayBuffer) e converte para JSON.
  - `mergeTables(oldData, newData, oldKey, newKey)`: Lógica de merge baseada em chaves.
  - `exportJSONToExcel(data, filename)`: Gera arquivo XLSX/CSV para download.

### Algoritmo de Merge
1. **Colunas novas:** Identifica colunas presentes na tabela nova que não existem na antiga.
2. **Mapa de correspondência:** Cria um `Map` usando a coluna chave da tabela nova.
3. **Merge:** Para cada linha antiga, procura correspondência no mapa. Se encontrada, mescla valores; senão, mantém valores antigos.
4. **Linhas novas:** Adiciona linhas da tabela nova que não correspondem a nenhuma linha antiga.

### Limitações de Performance
- **Tamanho máximo:** Limite de memória do browser (arquivos muito grandes podem travar a aba).
- **Processamento síncrono:** O merge é síncrono, mas com `await new Promise(r => setTimeout(r, 50))` para evitar bloqueio da UI.

---

## 8. Testes e Qualidade

### Vitest + Testing Library
- **Configuração:** `vitest.config.ts` com ambiente `jsdom`, arquivos de setup em `src/test/setup.ts`.
- **Cobertura:** Testes de componentes (interações de usuário) e hooks (`useMergeWorkflow`).
- **Comandos:**
  - `pnpm test` → execução única.
  - `pnpm test:watch` → modo watch.
  - `pnpm test:coverage` → relatório de cobertura.

### ESLint
- **Configuração:** `eslint.config.mjs` usando `eslint-config-next` (core‑web‑vitals + typescript).
- **Ignorados:** Diretórios `.next`, `out`, `build`.

### Qualidade de Código
- **TypeScript:** Strict mode habilitado (`tsconfig.json`).
- **Path alias:** `@/*` → `src/*` para imports absolutos.
- **Formatação:** Não configurada automaticamente (assumir Prettier padrão).

---

## 9. Deployment e CI/CD

### Pipeline de Deploy
1. **Desenvolvimento local:** `pnpm dev:vinext` (ou `pnpm dev` para Next.js).
2. **Build:** `pnpm build:vinext` gera `dist/` (client + server + worker).
3. **Deploy:** `pnpm deploy` (ou `vinext deploy`) faz upload para Cloudflare Workers.
4. **Verificação:** Acessar a URL do Worker e testar o fluxo completo.

### Custom Domain
- Configurável via Cloudflare Dashboard → Workers → comparador-tabelas → Triggers → Custom Domains.
- DNS e SSL gerenciados automaticamente.

### Rollback
- Para reverter, mantenha os scripts `dev:next`/`build:next` que ainda funcionam com Next.js puro.
- O Worker deployado pode ser versionado via Cloudflare Dashboard.

---

## 10. Considerações de Performance

### Tamanho do Bundle
- **Total:** ~1.6 MB (gzip: ~386 KB).
- **Componentes principais:**
  - `framework-CGepZGkM.js` (React): 189 KB (gzip 60 KB)
  - `worker-entry-BxV-W2OV.js` (vinext): 439 KB (gzip 146 KB)
  - `index-CJxNMa6D.js` (código do app): 33 KB (gzip 11 KB)
  - CSS: 29 KB (gzip 6 KB)

### Tempo de Inicialização
- **Worker startup:** 20 ms.
- **Primeiro paint:** Dependente da latência da rede e do tamanho do bundle.

### Otimizações Automáticas (Vite)
- **Code splitting:** Por rota (apenas uma rota neste caso).
- **Tree shaking:** Remoção de código não usado.
- **Minificação:** Usando Oxc (Vite 8).

### Possíveis Melhorias
- **Lazy loading:** Componentes `SummaryPanel` e `MergeSettings` poderiam ser carregados sob demanda.
- **Compressão:** Ativar Brotli no Cloudflare (já padrão).
- **Cache:** Configurar `cacheControl` nos assets estáticos.

---

## Apêndice

### Dependências Principais
```json
{
  "next": "16.2.1",
  "react": "19.2.4",
  "vinext": "0.0.36",
  "vite": "8.0.3",
  "xlsx": "0.18.5",
  "tailwindcss": "4",
  "shadcn": "4.1.0",
  "@cloudflare/vite-plugin": "1.30.2",
  "wrangler": "4.78.0"
}
```

### Links Úteis
- **Repositório:** `https://github.com/...` (privado)
- **Worker:** `https://comparador-tabelas.rammpk.workers.dev`
- **Documentação vinext:** `https://vinext.ai/docs`
- **Diátxis Framework:** `https://diataxis.fr/`

---

*Esta documentação foi gerada automaticamente e deve ser atualizada sempre que houver mudanças significativas na arquitetura.*