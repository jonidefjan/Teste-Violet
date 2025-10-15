# 🧪 Desafio Técnico – Cadastro de Agricultor

## 🧭 Objetivo

Construir uma aplicação básica de cadastro de agricultores com backend em **Node.js** (preferencialmente usando **NestJS**) e frontend em **React ou Next.js**, persistindo os dados em **MongoDB**.

A aplicação deve implementar as regras de negócio definidas abaixo, com um CRUD completo: **criação, leitura, atualização e exclusão** de agricultores.

---

## 📋 Regras de Negócio

### RN1 – Criação de Agricultor
O sistema deve permitir o cadastro de um agricultor com os seguintes campos:

| Campo       | Tipo     | Regras                         |
|-------------|----------|--------------------------------|
| `fullName`  | string   | Obrigatório                    |
| `cpf`       | string   | Obrigatório, único, válido     |
| `birthDate` | date     | Opcional                       |
| `phone`     | string   | Opcional                       |
| `active`    | boolean  | Default: `true`                |

---

### RN2 – CPF Único
Não deve ser permitido o cadastro de dois agricultores com o mesmo `cpf`.

---

### RN3 – Validação de CPF
O `cpf` informado deve seguir o algoritmo oficial de validação de CPF (formato brasileiro com verificador).

---

### RN4 – Edição de Agricultor
Deve ser possível alterar os dados do agricultor, exceto pelo campo `cpf`, que não pode ser modificado após o cadastro.

---

### RN5 – Exclusão de Agricultor
Só será permitida a exclusão de um agricultor se o campo `active` estiver como `false`.

---

### RN6 – Listagem de Agricultores
A aplicação deve conter uma tela (ou endpoint) que liste todos os agricultores cadastrados, permitindo:
- Visualização em formato tabular
- Ações de edição e exclusão por linha
- Filtros opcionais (por nome, CPF, ou status ativo/inativo)

---

## 💻 Requisitos Técnicos

- Backend: **NEXT.js** ou **Node.js com NestJS**
- Frontend: **React** ou **NEXT.js**
- Banco de Dados: **MongoDB**
- Versionamento: Git

---

## 📦 Entregáveis

1. Repositório público no GitHub com o código da aplicação.
2. Arquivo `README.md` com:
   - Instruções para rodar o projeto localmente
   - Tecnologias utilizadas
   - Qualquer consideração adicional
3. Documentação de API (se houver endpoints):
   - Pode ser em Swagger/OpenAPI ou no próprio README.

---

## ✅ Critérios de Avaliação

- Clareza e organização do código
- Modelagem coerente com as regras de negócio
- Validações corretas (especialmente CPF)
- Estruturação dos componentes e rotas
- Experiência mínima na interface
- README claro e funcional

---

## ⏱️ Prazo

Tempo estimado: **até 6 horas de dedicação**. Você pode enviar antes se concluir.

---

## 📮 Envio

Envie o link do repositório para avaliação assim que estiver pronto para dev@violet.earth.

Boa sorte 🚀
