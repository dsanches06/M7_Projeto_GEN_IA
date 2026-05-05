# M3 Mini Projeto - Gestão de utilizadores e tarefas ✅

## 📌 Descrição

Projeto exemplar de gestão de utilizadores e tarefas, implementado em **TypeScript**. Inclui operações básicas (CRUD), associação de tarefas a utilizadores, e um conjunto de utilitários genéricos com testes unitários.

## 🔧 Funcionalidades principais

- Gestão de utilizadores (CRUD)
- Gestão de tarefas (CRUD)
- Associação de tarefas a utilizadores
- Utilitários genéricos (cache, favoritos, tags, paginação, etc.)
- Testes unitários com **Vitest**

## 🧰 Tecnologias

- TypeScript
- Javascript
- Node JS
- Vitest (testes)

## 📁 Estrutura do projeto (resumo)

- `main.ts` — ponto de entrada
- `src/` — código fonte
  - `models/` — entidades (User, Task, etc.)
  - `tasks/` — implementações de tarefas (BugTask, FeatureTask, Task)
  - `utils/` — utilitários genéricos (EntityList, SimpleCache, Paginator...)
  - `services/` — serviços da aplicação
  - `logs/`, `notifications/`, `security/`, etc.
- `testes/` — testes unitários (Vitest)
- `tsconfig.json` —  define como o código deve ser compilado
- `vitest.config.ts` — configuração de testes

---

## 🚀 Como usar


### 1) Commit do exercicios sobre static e genericos 

[Commit 97a53bc](https://github.com/dsanches06/M3_Mini_Projeto/tree/97a53bcde07f7f4438786b1569365bba6555b832)

### 2) Clonar 

```bash
git clone https://github.com/dsanches06/M3_Mini_Projeto.git
cd M3_Mini_Projeto
```

### 3) Instalar dependências

```bash
npm install
```

### 5) Compilar

```bash
npm run build
```

---

## 🧪 Testes

- Executar todos os testes:

```bash
npm test
```

- Executar em modo watch:

```bash
npm run test:watch
```

- Gerar relatório de cobertura (Vitest suporta cobertura via `--coverage`):

```bash
npx vitest run --coverage
```

> Nota: o projeto já inclui `vitest` como dependência de desenvolvimento e `vitest.config.ts` para configuração.

---

## 🛠️ Scripts úteis (em `package.json`)

- `npm run build` — compilar TypeScript
- `npm run watch` — compilar em watch mode
- `npm start` — build + executar
- `npm test` — executar testes (Vitest)
- `npm run test:watch` — testes em watch

---

## 👤 Autor

**Danilson Sanches** — @upskill217
