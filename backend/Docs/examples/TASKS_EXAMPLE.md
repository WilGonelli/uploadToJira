<!-- Arquivo de Exemplo de Tarefas (tasks.example.md) -->
<!-- Para instruções completas, prompt da IA e regras de pontuação/atribuição, veja: TASK_CREATION_RULES.md -->

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
