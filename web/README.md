## Cadastro de Agricultores

Aplicação full-stack em Next.js 15 (App Router) para gerenciar agricultores conforme o desafio Violet. O projeto expõe uma interface React com filtros, formulários e validações de CPF, além de rotas REST persistindo dados em MongoDB.

### Stack

- Next.js 15 App Router + React 19 (TypeScript)
- Tailwind CSS 4
- MongoDB com Mongoose
- Validações com Zod e utilitário compartilhado `src/lib/cpf.ts`
- Testes unitários com Jest (foco em regras de negócio)

### Pré-requisitos

- Node.js 20+
- MongoDB local ou Atlas

### Configuração

1. Copie o arquivo de variáveis e informe sua conexão MongoDB:

   ```bash
   cp .env.example .env.local
   # ajuste MONGODB_URI conforme seu ambiente
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Execute o ambiente de desenvolvimento:

   ```bash
   npm run dev
   ```

   A aplicação ficará disponível em http://localhost:3000.

### Scripts NPM

- `npm run dev` – sobe o Next.js com Turbopack
- `npm run build` – gera o build de produção
- `npm run start` – inicia o servidor em modo produção
- `npm run lint` – executa o ESLint
- `npm run test` – roda os testes unitários via Jest

### Estrutura de Pastas

- `src/app/` – páginas e rotas API (`/farmers` e `/api/farmers`)
- `src/lib/` – utilidades compartilhadas (`cpf`, `mongodb`)
- `src/models/` – schemas Mongoose (`Farmer`)
- `src/types/` – DTOs utilizados entre cliente e servidor
- `tests/` – testes focados em RN2, RN3 e RN5 (CPF, unicidade e exclusão)

### API REST

| Método | Rota               | Descrição                                                     |
| ------ | ------------------ | ------------------------------------------------------------- |
| GET    | `/api/farmers`     | Lista agricultores com filtros `fullName`, `cpf`, `active`    |
| POST   | `/api/farmers`     | Cria agricultor (CPF único, obrigatório, validado no backend) |
| GET    | `/api/farmers/:id` | Retorna agricultor específico                                 |
| PUT    | `/api/farmers/:id` | Atualiza dados (exceto CPF, que é imutável)                   |
| DELETE | `/api/farmers/:id` | Remove agricultor apenas se `active === false`                |

Todas as respostas retornam objetos `{ data }` ou `{ message }` em caso de erro.

### Cobertura das Regras RN1-RN6

- RN1/RN3 – Formulários e API validam CPF via `src/lib/cpf.ts` e Zod
- RN2 – Índice único em Mongo + verificação manual antes do insert
- RN4 – Rotas PUT bloqueiam alteração de CPF
- RN5 – Rotas DELETE barram exclusão enquanto `active` for `true`
- RN6 – Página `/farmers` lista dados em tabela com filtros e ações por linha

### Testes

Os testes ficam em `tests/` e cobrem o utilitário de CPF e as regras de negócio críticas. Execute `npm run test` para rodar a suíte.

### Próximos Passos

- Avaliar seeds opcionais (`npm run seed`) para ambientes compartilhados
- Configurar deploy (Vercel, Render ou outra opção) conforme necessidade
