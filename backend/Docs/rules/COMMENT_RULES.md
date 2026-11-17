# Standard Jira Task Comment Rules (`COMMENT_RULES.md`)

This specification standardizes technical comments posted to Jira issues upon task completion.

---

## 1. Comment Structure (in Portuguese)

Every implementation comment posted to a Jira issue must be written in Portuguese (pt-BR) and contain the following four structured sections:

```markdown
### Resumo da Implementação Técnica
Uma narrativa concisa de alto nível descrevendo o que foi implementado, refatorado ou corrigido, incluindo a justificativa arquitetural.

### Arquivos Impactados
- `caminho/do/ArquivoUm.tsx`: Breve descrição das alterações.
- `caminho/do/ArquivoDois.ts`: Breve descrição das alterações.

### Evidências de Teste e Validação
- Testes Unitários: Lista de testes unitários criados ou executados (ex: `npm test -- -t "useMigrationHistory"`).
- Validações Manuais: Comportamento da interface verificado, tratamento de resposta e cenários de erro.

### Checklist de Definition of Done (DoD)
- [x] Item 1 atendido: Detalhes da confirmação.
- [x] Item 2 atendido: Detalhes da confirmação.
```

---

## 2. Formatting Guidelines

1. **Language**: Mandatory Portuguese (pt-BR) for all narrative text and headings.
2. **Tone**: Objective, precise, and professional.
3. **Backticks**: Always enclose file paths, function names, types, and commands in single backticks (e.g. `JiraService.ts`, `npm test`).
4. **No Redundancy**: Avoid generic fillers ("Trabalhei nisso hoje"). Focus on concrete architectural evidence and criteria satisfied.
