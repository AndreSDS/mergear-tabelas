# Plano do Projeto: Comparador de Tabelas Excel

## 1. Visão Geral
Aplicação **Frontend-only** (React + Next.js App Router + TypeScript) para mesclar duas tabelas Excel ou CSV diretamente no navegador do usuário, garantindo privacidade (zero dados enviados ao servidor) e rapidez.

## 2. Requisitos de Negócio
- Fazer upload da **Tabela Base (Antiga)** e da **Tabela Atualizada (Nova)**.
- Selecionar a **Chave Primária** (ex: CPF, ID, Email) presente em ambas as tabelas para relacionar as linhas.
- Regra de Mesclagem:
  - Manter todas as colunas existentes na Tabela Antiga.
  - Atualizar os valores da Tabela Antiga com os valores da Tabela Nova (quando a chave for igual).
  - Adicionar as colunas que existem na Tabela Nova mas não existiam na Antiga.
- Exibir os resultados e permitir o download da nova tabela final mesclada.

## 3. Arquitetura Técnica
- **Framework:** Next.js (App Router)
- **Linguagem:** TypeScript
- **Estilização:** TailwindCSS + Shadcn UI (Componentes acessíveis)
- **Processamento de Excel:** `xlsx` (SheetJS)
- **Manipulação de Ícones:** `lucide-react`

## 4. Estrutura de Componentes
- `FileUpload`: Zona de soltar/clicar para enviar os arquivos .xlsx/.csv.
- `MergeSettings`: Seleção das colunas de chaves primárias.
- `SummaryPanel`: Exibição visual do quantitativo de linhas atualizadas e colunas adicionadas.
- `excel-util.ts`: Arquivo central em `/src/lib/` contendo algoritmos puros de conversão e merge determinístico.
