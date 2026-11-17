# 🌐 Contexto de Engenharia do Projeto IMAP (Front-end)

Este documento consolida o mapeamento do projeto `impacto/frontend` para acelerar e guiar a criação de tasks, sem necessidade de reanalisar o código-fonte principal a cada execução.

---

## 🏛️ 1. Padrões de Arquitetura e Stack
- **Framework**: React 19 + TypeScript 5.8 + Vite 7.
- **Roteamento**: React Router 8 (`react-router`).
- **Arquitetura**: MVVM (Model-View-ViewModel) estrito.
  - **Model**: `src/models/`, `src/services/` (TypeScript puro, sem dependências de React).
  - **ViewModel**: `src/viewmodel/` (Custom hooks React com `{ state, actions }`, zero JSX/CSS).
  - **View**: `src/pages/`, `src/components/` (JSX semântico, ARIA WCAG 2.1 AA+, zero regras de negócio).
- **Estilização**: CSS Modules (`*.module.css`) + tokens de Design System globais (`var(--color-*)`, `var(--space-*)`, etc.).
- **Testes**: Vitest + React Testing Library + `@testing-library/user-event` em `src/tests/`.

---

## 🧭 2. Mapeamento de Módulos e Componentes

### 2.1. Módulo Home e Histórico de Migrations (`src/pages/home/`)
- **Páginas & Componentes**:
  - `Home.tsx`: Orquestrador principal da tela inicial, contendo intake de repositórios, modais e histórico.
  - `components/RepoIntakeSection.tsx`: Input de URL Git e seleção de branch.
  - `components/MigrationHistorySection.tsx`: Listagem paginada de migrations executadas, filtros de status e cards.
  - `components/MigrationCardActions.tsx` / `MigrationCardActions.module.css`: Ações de cada card (Download, Delete, status de loading e alertas inline `.downloadError`).
- **ViewModel**:
  - `src/viewmodel/migration/useHomeViewModel.ts`: Controla estado de intake, listagem (`migrationHistory`), paginação (`currentPage`, `totalPages`, `pageSize`), filtros (`filterSelected`, `searchName`) e polling de builds ativos.
- **Utilitários e Storage**:
  - `src/utils/storage.ts`: Manipulação de tokens e chaves em `sessionStorage` / `localStorage`.
- **Modais Relacionados**:
  - `src/components/modals/ConfirmModal.tsx`: Modal reutilizável de confirmação com suporte a dois passos (confirmação simples e digitação de keyword). Atualmente com texto fixo `"Saving..."` quando `saving={true}`.

### 2.2. Módulo de Execução e Logs de Migração (`src/pages/migration/`)
- **Páginas & Componentes**:
  - `Migration.tsx`: Tela de execução e acompanhamento em tempo real via SSE.
  - `components/MigrationLogsSection.tsx`: Painel central com título, contador de passos, timeline vertical e detalhes dos logs.
  - `components/MigrationTimeline.tsx` / `MigrationTimeline.module.css`: Barra lateral com lista de estágios e conectores.
  - `components/MigrationTimelineCard.tsx` / `MigrationTimelineCard.module.css`: Cards de cada estágio com badges de status, tentativas e tempo.
  - `components/MigrationTimelineDetails.tsx` / `MigrationTimelineDetails.module.css`: Exibição do terminal/logs do estágio selecionado, botões de tentativas e diff.
- **ViewModels**:
  - `src/viewmodel/migration/useMigrationViewModel.ts`: Orquestrador da página de migração.
  - `src/viewmodel/migration/hooks/useMigrationTimelineViewModel.ts`: Agrupamento de logs (`stages`), seleção de tentativa, cálculo de diff e scroll.
  - `src/viewmodel/migration/hooks/useMigrationActions.ts`: Lógica de cancelamento e download de build completo.
- **Model**:
  - `src/models/migration/Migration.ts` (`TaskLog`, `BuildLog`, `Metadata`).
  - `src/models/migration/TimelineStage.ts`.

### 2.3. Módulo de Settings e Administração (`src/pages/settings/`)
- **Páginas & Componentes**:
  - `Settings.tsx`: Tela de configurações gerais do sistema.
  - `components/BuildsSection.tsx` / `BuildsSection.module.css`: Tabela administrativa (`DataTable`) exibindo histórico de todos os builds do sistema com colunas: `Build UID`, `Project Name`, `User`, `Status`, `Git Repository`.
  - `components/LLMConfigsSection.tsx` / `LLMConfigsSection.module.css`: Lista de configurações de IA/LLM e modal `"Inspecting Config"` (`inspectModalDialog`, `modalHeaderSummary`, `agentLinksList`).
- **ViewModels**:
  - `src/viewmodel/settings/useSettingsBuildsViewModel.ts`: Gerencia o carregamento de todos os builds via `migrationService.buildHistory(true)`.
  - `src/viewmodel/settings/useSettingsLLMViewModel.ts`: Gerencia configs e visualização de LLMs.

---

## 📚 3. Documentação Técnica Existente (`Docs/`)
- `Docs/Home.md`, `Docs/Home-ViewModel.md`, `Docs/Home-Reference.md`
- `Docs/Migration.md`, `Docs/Migration-ViewModel.md`, `Docs/Migration-Reference.md`
- `Docs/Settings.md`, `Docs/Settings-ViewModel.md`, `Docs/Settings-Reference.md`
- `Docs/Profile.md`, `Docs/Profile-ViewModel.md`, `Docs/Profile-Reference.md`
- `Docs/Auth.md`, `Docs/Auth-Flows.md`, `Docs/Auth-Reference.md`
