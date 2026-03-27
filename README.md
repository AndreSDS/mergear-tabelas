# Comparador de Tabelas Excel

Uma aplicação web que permite mesclar duas planilhas Excel (antiga e nova) **100% no navegador**, sem envio de dados a servidores. A ferramenta identifica linhas correspondentes via uma coluna chave e mescla automaticamente colunas novas, exportando o resultado atualizado.

## Tecnologias

- **Framework:** vinext (Vite + Next.js App Router)
- **Runtime:** React 19
- **Estilização:** Tailwind CSS 4 + shadcn/ui
- **Processamento Excel:** xlsx (client‑side)
- **Deploy:** Cloudflare Workers

## Começando

### Desenvolvimento local

```bash
# Instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento (vinext)
pnpm dev

# Ou iniciar com Next.js puro
pnpm dev:next
```

Abra [http://localhost:3001](http://localhost:3001) (vinext) ou [http://localhost:3000](http://localhost:3000) (Next.js) no navegador.

### Build de produção

```bash
pnpm build          # Vinext build para Workers
pnpm build:next     # Next.js build (opcional)
```

### Deploy na Cloudflare Workers

```bash
# Autenticar (primeira vez)
npx wrangler login

# Deploy automatizado
pnpm deploy
```

O deploy cria um Worker em `https://comparador-tabelas.rammpk.workers.dev`.

### CI/CD com GitHub Actions

O projeto inclui um pipeline CI/CD que faz deploy automático para Cloudflare Workers quando há push para a branch `main`.

**Configuração necessária:**

Adicione os seguintes secrets no repositório GitHub (Settings → Secrets and variables → Actions → New repository secret):

| Secret | Valor |
|--------|-------|
| `CLOUDFLARE_API_TOKEN` | Token de API do Cloudflare (permissões: Workers Scripts, Account Settings) |
| `CLOUDFLARE_ACCOUNT_ID` | ID da sua conta Cloudflare (encontrado em Workers & Pages → Overview) |

**O pipeline executa:**
- Testes (`pnpm test`)
- Lint (`pnpm lint`)
- Build (`pnpm build`)
- Deploy automático (`pnpm deploy`)

O workflow está em `.github/workflows/deploy.yml`.

## Funcionalidades

1. **Upload de planilhas** – Arraste ou selecione arquivos `.xlsx`/`.csv`
2. **Seleção de colunas chave** – Identificador único para correspondência
3. **Merge automático** – Combina tabelas, adiciona colunas novas
4. **Preview dos resultados** – Visualize as primeiras linhas antes de baixar
5. **Exportação** – Baixe a planilha atualizada em XLSX, XLS ou CSV

## Documentação

- **[Documentação de Arquitetura](docs/architecture.md)** – Referência técnica completa (estrutura, fluxos, configuração,部署)
- **[Vinext Migration Guide](.agents/skills/migrate-to-vinext/)** – Como o projeto foi migrado de Next.js para vinext

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `dev` | Servidor de desenvolvimento (vinext) |
| `dev:next` | Servidor de desenvolvimento (Next.js) |
| `build` | Build de produção (vinext) |
| `build:next` | Build de produção (Next.js) |
| `start` | Servidor de produção local (vinext) |
| `deploy` | Deploy para Cloudflare Workers |
| `test` | Executa testes (Vitest) |
| `lint` | Linting com ESLint |

## Licença

MIT
