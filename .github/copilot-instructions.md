# AI Agent Guide

- **Monorepo layout**: App source vive em `web/`. README, scripts e configs estão nesse diretório. A raiz contém o enunciado oficial `desafio-dev-violet.md` e `.github/`.
- **Missão**: Manter o CRUD de agricultores conforme o desafio. Não quebre as regras RN1–RN6 (CPF válido/único, exclusão apenas inativos, filtros etc.).

## Arquitetura Atual

- **Frontend e Backend**: Next.js 15 App Router (React 19). Rotas API em `src/app/api/farmers/**` expõem CRUD sobre MongoDB.
- **Persistência**: Mongoose configurado em `src/lib/mongodb.ts`; schema em `src/models/farmer.ts` com índice único e `cpf` imutável.
- **Validação**: Utilitários de CPF em `src/lib/cpf.ts` compartilhados entre API e UI. Esquemas Zod nas rotas garantem payloads válidos.
- **Regra RN5**: `ensureInactiveBeforeDelete` em `src/lib/farmer-rules.ts` centraliza o bloqueio de exclusão para ativos.
- **UI principal**: `src/app/farmers/page.tsx` (client component) carrega lista, filtros (nome, CPF, status) e forms de criação/edição.

## Fluxo de Trabalho

- Instale dependências e rode scripts sempre em `web/`.
  - `npm run dev` – servidor Next (Turbopack)
  - `npm run build` / `npm run start` – produção
  - `npm run lint` – ESLint com config ESM em `eslint.config.mjs`
  - `npm run test` – Jest (config em `jest.config.mjs`, testes no diretório `tests/`)
- Variáveis: defina `MONGODB_URI` em `.env.local` (modelo em `.env.example`). Sem isso o backend lança erro ao conectar.

## Convenções Importantes

- Use o alias `@/` para importar de `src/` (config em `tsconfig.json` e Jest).
- Sempre normalize CPFs com `normalizeCPF` antes de consultas; armazene apenas dígitos.
- Nunca permita edição do `cpf` após criação; o schema Mongoose marca o campo como `immutable` e as rotas ignoram atualizações.
- Deleção deve seguir `ensureInactiveBeforeDelete`; reutilize a função em qualquer nova automação ou teste.
- Filtros da listagem convertem CPF digitado para dígitos (`stripCPF`) e repassam via query string.

## Testes e Qualidade

- Testes existentes (`tests/cpf.test.ts`, `tests/deletion-policy.test.ts`) cobrem RN3 e RN5; mantenha-os verdes ao alterar utilitários.
- Crie novos testes ao introduzir regras extras (ex.: duplicidade de CPF) e acrescente-os ao diretório `tests/`.
- Quando adicionar APIs, documente-as no README (seção “API REST”) mantendo o formato de tabela atual.

## Comunicação com o Usuário

- Antes de grandes mudanças de arquitetura, confirme com o usuário (ex.: mover do App Router, trocar MongoDB, remover Tailwind).
- Sempre reporte se novas variáveis de ambiente ou comandos são necessários.
