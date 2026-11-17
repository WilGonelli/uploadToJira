# 🤖 Manual Operacional e Prompt de Criação de Tasks no Jira

Este documento é a especificação oficial e o **System Prompt de Referência** para que qualquer Inteligência Artificial (ou membro do time) gere tarefas no padrão esperado pelo projeto **IMAP (IBM Power Migration Assistant)** e pelo script de automação [`create-jira-tasks.ts`](./create-jira-tasks.ts).

---

## 🎯 1. Instruções para a IA (System Prompt de Criação)

Quando o usuário solicitar a criação de tarefas passando apenas uma descrição simplificada do que precisa ser feito (ex.: *"Adicionar Timestamp Completo no Histórico de Builds"* ou *"Criar modal de exportação de migrations"*), a IA **DEVE SEGUIR RIGOROSAMENTE** as seguintes diretrizes:

### ⚡ Regras de Ouro da Criação de Tasks:

1. **Separação Obrigatória entre Desenvolvimento, Testes e Documentação**:
   - **NUNCA** embuta a criação de suítes de testes unitários ou a atualização da documentação técnica dentro de uma tarefa de desenvolvimento.
   - Uma tarefa de desenvolvimento trata **exclusivamente** da implementação do código (View, ViewModel, Model, Services e CSS Modules).
   - Tarefas de **Testes Unitários** devem ser geradas em **tasks dedicadas separadas**.
   - Tarefas de **Documentação Técnica** devem ser geradas em **tasks dedicadas separadas**.

2. **Agrupamento por Fluxo Funcional (Flow-based Grouping)**:
   - Não crie micro-tarefas fragmentadas de teste ou documentação para cada pequeno botão ou componente isolado.
   - **Agrupe sempre por contexto/fluxo de usuário completo**.
     * *Exemplo de Teste*: Uma única tarefa de teste para o "Fluxo de Histórico e Filtros de Migrations" cobrindo `migrationStore`, `useMigrationHistoryViewModel`, `MigrationHistorySection` e componentes correlatos.
     * *Exemplo de Documentação*: Uma única tarefa de documentação para o "Módulo de Settings e Administração" cobrindo arquitetura, contratos e fluxos em `frontend/Docs/Settings.md` e `frontend/Docs/Settings-ViewModel.md`.

3. **Inclusão Obrigatória das 6 Tasks de Treinamento Semanal**:
   - Em todo novo lote de tarefas semanais a ser gerado, verifique e garanta a presença de **6 tarefas de treinamento semanal**:
     * **3 tarefas para o Júnior (`Assign: me`)**:
       - `Treinamento semanal - Semana 1`
       - `Treinamento semanal - Semana 2`
       - `Treinamento semanal - Semana 3`
     * **3 tarefas para o Estagiário (`Assign: nicolas.santos@fit-tecnologia.org.br`)**:
       - `Treinamento semanal - Semana 1`
       - `Treinamento semanal - Semana 2`
       - `Treinamento semanal - Semana 3`
   - Essas tarefas possuem **Parent `IMPCT-122`**, **Story Points `0.5`**, **sem Phase, sem Activity, sem Descrição e sem DoD**.

---

## 🏗️ 2. Arquitetura e Padrões Técnicos do Front-end (`../../frontend`)

Para definir corretamente os campos `Componente`, `Arquivos Alvo`, a `Descrição da Task` e o `Definition of Done (DoD)`, a IA deve consultar a seguinte referência técnica extraída diretamente do repositório:

### 🛠️ Stack Tecnológica:
- **Core**: React 19 (`react`, `react-dom`), Vite 7 (`vite`, `@vitejs/plugin-react`), TypeScript 5.8.
- **Roteamento**: React Router 8 (`react-router`).
- **Comunicação HTTP / SSE**: Axios 1.x (`axios`).
- **Testes & Qualidade**: Vitest 4 (`vitest`), React Testing Library (`@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`), JSDOM 28, Stryker Mutator (Testes de Mutação), Dependency Cruiser.
- **Estilização**: CSS Modules nativos (`*.module.css`) + Variáveis globais do Design System (`var(--color-*)`, `var(--space-*)`, `var(--font-*)`, `var(--radius-*)`, `var(--shadow-*)`).
- **Acessibilidade**: Conformidade estrita com **WCAG 2.1 AA+** (semântica HTML5, `aria-*`, navegação por teclado, `:focus-visible`).

### 🏛️ Padrão Arquitetural Estrito: MVVM (Model-View-ViewModel)

A aplicação segue uma divisão clara em 3 camadas:

1. **Model (`src/models/`, `src/services/`)**:
   - Código TypeScript puro — **Zero dependências do React** (sem hooks, sem JSX).
   - Modela contratos de API, entidades de domínio, DTOs e serviços de chamada HTTP com Axios.
   - Exemplos: `MigrationModel.ts`, `OverviewModel.ts`, `MigrationService.ts`, `OverviewServices.ts`.

2. **ViewModel (`src/viewmodels/` ou hooks dedicados `use<Feature>ViewModel.ts`)**:
   - Custom hooks do React que concentram toda a lógica de negócio, gerenciamento de estado local/global, side-effects assíncronos e manipuladores de eventos.
   - **Zero JSX, zero renderização de HTML e zero regras de estilização CSS**.
   - Retorna contratos tipados com `{ state, actions }` facilmente testáveis via `renderHook` da React Testing Library.

3. **View (`src/pages/`, `src/components/`)**:
   - Componentes funcionais React (`.tsx`) associados às suas folhas de estilo (`.module.css`).
   - Focados exclusivamente em estrutura semântica, acessibilidade e renderização visual.
   - **Zero chamadas diretas de API e zero lógica de negócio pesada**.

### 📁 Estrutura de Diretórios de Referência:
```text
frontend/src/
├── components/          # Componentes visuais reutilizáveis (cards, modals, header, layout, etc.)
├── pages/               # Páginas e seções principais:
│   ├── auth/            # Login, Registro, Recuperação de Senha
│   ├── home/            # Intake de Repositório e Histórico de Migrations
│   ├── migration/       # Execução em Tempo Real, Timeline e Log Diff
│   ├── profile/         # Perfil do Usuário e Links de Agentes
│   ├── settings/        # Configurações Globais (Overview, Builds, LLMs, Usuários)
│   └── notFound/        # Página 404
├── viewmodels/          # Hooks de apresentação (MVVM)
├── services/            # Serviços de integração com API REST / SSE
├── models/              # Interfaces, DTOs e entidades de domínio TypeScript
├── context/             # Provedores de contexto global (ex: AuthContext)
├── utils/               # Funções utilitárias (dateUtils, masks, validations, storage)
├── styles/              # Variáveis e temas do Design System (global.css, variables.css)
├── tests/               # Suíte de testes unitários espelhada com src
└── Docs/                # Documentação técnica e especificações funcionais em Markdown
```

---

## 📋 3. Mapeamento de Metadados do Jira

### 3.1. Parent, Phase e Activity

| Tipo de Tarefa | Parent (Chave Pai) | Phase | Activity | Diretrizes de Uso |
| :--- | :---: | :---: | :---: | :--- |
| **Desenvolvimento Front-end** | `IMPCT-297` | `3` | `5` | Criação/ajuste de componentes, regras de negócio, telas e folhas de estilo CSS Modules. |
| **Testes Unitários Front-end** | `IMPCT-120` | `4` | `3` | Criação/expansão de testes em Vitest + RTL. **Sempre agrupado por fluxo funcional**. |
| **Documentação Técnica** | `IMPCT-306` | `5` | `4` | Atualização de arquivos em `frontend/Docs/` ou `README.md`. **Sempre agrupado por fluxo funcional**. |
| **Treinamento Semanal** | `IMPCT-122` | *(Vazio)* | *(Vazio)* | Capacitação técnica semanal. Não recebe Phase nem Activity. |

### 3.2. Regras de Atribuição (`Assign`)

| Perfil | Identificador | Tipos de Tarefas Elegíveis |
| :--- | :---: | :--- |
| **Júnior** (William) | `me` | • Testes Unitários (`IMPCT-120`) e Documentação Técnica (`IMPCT-306`).<br>• Desenvolvimento de **média e alta complexidade** (lógica, ViewModels, integrações de API). |
| **Estagiário** (Nicolas) | `nicolas.santos@fit-tecnologia.org.br` | • Ajustes de CSS, estilização visual e refatoração de layout responsivo.<br>• Componentes visuais sem lógica de negócio complexa.<br>• Tarefas de desenvolvimento de **baixa complexidade** (foco em aprendizado). |

### 3.3. Pontuação de Story Points

* **Testes Unitários e Documentação Técnica**:
  * **1 ponto** por fluxo/contexto funcional completo.
* **Desenvolvimento - Estagiário** (`nicolas.santos@fit-tecnologia.org.br`):
  * **Baixa complexidade**: `2` a `3` pontos.
  * **Média complexidade**: `3` a `4` pontos.
* **Desenvolvimento - Júnior** (`me`):
  * **Baixa complexidade**: `1` ponto.
  * **Média complexidade**: `2` pontos.
  * **Alta complexidade**: `3` pontos.
* **Treinamento Semanal**:
  * **0.5 ponto** por tarefa de treinamento.

---

## ✍️ 4. Guia de Redação da Descrição e Definition of Done (DoD)

Para garantir clareza no Jira e rastreabilidade técnica, a descrição e o DoD devem atender aos seguintes critérios de qualidade:

### 📝 4.1. Como Elaborar a `Descrição da Task (Jira):`
A descrição deve ser um parágrafo coeso e técnico, estruturado em:
1. **Contexto / Problema**: Por que a alteração é necessária (ex.: falha de layout, falta de recurso de download, ausência de timestamp).
2. **Solução Técnica**: O que será feito a nível de arquitetura (qual camada MVVM é impactada, qual função ou hook será criado/modificado).
3. **Escopo e Limites**: Deixar explícito que a alteração é restrita ao front-end ou orientada ao Design System, sem criar dependências desnecessárias com o backend.

### ✅ 4.2. Como Elaborar o `Definition of Done (DoD):`
O DoD deve ser uma lista numerada (1, 2, 3...) de critérios **claros, objetivos e verificáveis**:
- **Critério Funcional**: Confirmação da lógica implementada e fluxo do usuário atendido.
- **Critério de Estilo / Responsividade**: Conformidade com as variáveis do Design System (`var(--token-*)`) e ausência de quebras em viewports desktop, tablet e mobile.
- **Critério de Acessibilidade (a11y)**: Validação de elementos semânticos, atributos ARIA, rótulos acessíveis e foco por teclado (WCAG 2.1 AA).
- **Sem poluição de testes/docs na task de dev**: A task de dev valida conformidade e integridade sem exigir nova suíte de testes embutida (isso cabe à task dedicada).

---

## 💡 5. Exemplos Canônicos de Cada Tipo de Task

### Exemplo 1: Task de Desenvolvimento Front-end
```markdown
[01] Implementar Persistência de Filtros no Histórico de Migrations
Status: OPEN
Parent: IMPCT-297
Story Points: 2
Phase: 3
Activity: 5
Assign: me
Prioridade: Média
Componente: Migrations / Histórico
Arquivos Alvo: MigrationHistory.tsx, useMigrationHistoryViewModel.ts, migrationStore.ts
Descrição da Task (Jira):
Implementar a persistência local (via Zustand store e SessionStorage) do estado da paginação e dos filtros selecionados na listagem do histórico de migrations. Ao recarregar a tela ou navegar entre páginas da aplicação, o front-end deve reaplicar os parâmetros salvos ao consultar o endpoint de histórico já existente, evitando que o usuário perca o contexto da pesquisa.
Definition of Done (DoD):
1. Estado de página atual e filtros ativos armazenados e sincronizados no cliente via store dedicado.
2. Recuperação automática dos parâmetros executada na inicialização do hook useMigrationHistoryViewModel.
3. Botão de reset de filtros limpa adequadamente o estado persistido e restaura a listagem padrão.
4. Layout da barra de filtros responsivo e integrado às variáveis de tema do Design System.
```

### Exemplo 2: Task de Testes Unitários (Dedicada e Agrupada por Fluxo)
```markdown
[02] Suíte de Testes Unitários para o Fluxo de Histórico e Filtros de Migrations
Status: OPEN
Parent: IMPCT-120
Story Points: 1
Phase: 4
Activity: 3
Assign: me
Prioridade: Média
Componente: Testes / Qualidade (QA)
Arquivos Alvo: useMigrationHistoryViewModel.test.ts, MigrationHistorySection.test.tsx, migrationStore.test.ts
Descrição da Task (Jira):
Implementar e expandir a suíte de testes unitários isolada utilizando Vitest e React Testing Library para cobrir todo o fluxo funcional de histórico e paginação de migrations. Os testes devem cobrir: a persistência e recuperação dos filtros e número de página no store; o comportamento do hook useMigrationHistoryViewModel diante de respostas de API e erros de rede; e as interações de clique nos botões de filtro e paginação no componente de visualização.
Definition of Done (DoD):
1. Testes de hook implementados via renderHook cobrindo transições de estado, filtros e reset.
2. Testes de renderização e cliques simulados via userEvent consultando elementos por papéis acessíveis (screen.getByRole).
3. Cenários de dados vazios e falha de carregamento devidamente cobertos com asserções limpas.
4. Todos os testes integrados executando e passando com sucesso via `npm test` sem quebras de cobertura.
```

### Exemplo 3: Task de Documentação Técnica (Dedicada e Agrupada por Fluxo)
```markdown
[03] Documentação Técnica do Módulo de Histórico de Migrations e Filtros
Status: OPEN
Parent: IMPCT-306
Story Points: 1
Phase: 5
Activity: 4
Assign: me
Prioridade: Baixa
Componente: Documentação / Front-end
Arquivos Alvo: frontend/Docs/Home.md, frontend/Docs/Home-ViewModel.md, frontend/Docs/Home-Reference.md
Descrição da Task (Jira):
Atualizar e consolidar a documentação técnica do módulo de Home/Migrations em frontend/Docs/. Registrar a especificação do ciclo de vida dos filtros e da paginação persistida, descrevendo os contratos de estado expostos pela ViewModel, as chaves de armazenamento local utilizadas e as diretrizes de navegação da interface.
Definition of Done (DoD):
1. Arquivos Home.md e Home-ViewModel.md atualizados com as novas propriedades de estado e ações de reset.
2. Contratos da ViewModel e fluxo de persistência documentados em inglês técnico claro.
3. Exemplos de payload e referências a arquivos de código sincronizados com a árvore do projeto.
```

### Exemplo 4: Tasks de Treinamento Semanal (As 6 Obrigatórias)
```markdown
[04] Treinamento semanal - Semana 1
Status: OPEN
Parent: IMPCT-122
Story Points: 0.5
Assign: me

[05] Treinamento semanal - Semana 2
Status: OPEN
Parent: IMPCT-122
Story Points: 0.5
Assign: me

[06] Treinamento semanal - Semana 3
Status: OPEN
Parent: IMPCT-122
Story Points: 0.5
Assign: me

[07] Treinamento semanal - Semana 1
Status: OPEN
Parent: IMPCT-122
Story Points: 0.5
Assign: nicolas.santos@fit-tecnologia.org.br

[08] Treinamento semanal - Semana 2
Status: OPEN
Parent: IMPCT-122
Story Points: 0.5
Assign: nicolas.santos@fit-tecnologia.org.br

[09] Treinamento semanal - Semana 3
Status: OPEN
Parent: IMPCT-122
Story Points: 0.5
Assign: nicolas.santos@fit-tecnologia.org.br
```
