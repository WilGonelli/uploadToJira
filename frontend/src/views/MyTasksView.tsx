import React, { useEffect } from "react";
import { Project } from "../models/Project.js";
import { useMyTasksViewModel } from "../viewmodels/useMyTasksViewModel.js";
import { CommentModal } from "./components/CommentModal.js";
import {
  CheckSquare,
  RefreshCw,
  MessageSquarePlus,
  ExternalLink,
  AlertCircle,
  Search,
  FolderKanban,
  Filter,
  Sparkles,
} from "lucide-react";
import styles from "./MyTasksView.module.css";

interface MyTasksViewProps {
  selectedProject: Project | null;
}

export const MyTasksView: React.FC<MyTasksViewProps> = ({
  selectedProject,
}) => {
  const { state, actions } = useMyTasksViewModel(
    selectedProject?.jiraProjectKey || "",
  );

  // Synchronize when the active project in header changes
  useEffect(() => {
    if (
      selectedProject?.jiraProjectKey &&
      selectedProject.jiraProjectKey !== state.projectKey
    ) {
      actions.setProjectKey(selectedProject.jiraProjectKey);
      actions.loadAssignedTasks(
        selectedProject.jiraProjectKey,
        state.statusCategory,
        state.onlyMyTasks,
        state.onlyCurrentSprint,
      );
    }
  }, [selectedProject?.jiraProjectKey]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    actions.loadAssignedTasks(
      state.projectKey,
      state.statusCategory,
      state.onlyMyTasks,
      state.onlyCurrentSprint,
    );
  };

  const getStatusBadgeClass = (status: string): string => {
    const s = status.toUpperCase();
    if (s.includes("REVIEW")) return styles.statusBadgeReview;
    if (s.includes("PROGRESS") || s.includes("ANDAMENTO"))
      return styles.statusBadgeInProgress;
    if (s.includes("DONE") || s.includes("CONCLU"))
      return styles.statusBadgeDone;
    return styles.statusBadge;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerBanner}>
        <div>
          <h2 className={styles.title}>
            <CheckSquare
              style={{ width: "1.25rem", height: "1.25rem", color: "#60a5fa" }}
              aria-hidden="true"
            />
            Minhas Tarefas Atribuídas no Jira
          </h2>
          <p className={styles.subtitle}>
            Tarefas ativas em aberto atribuídas a você. Gere relatórios técnicos
            de conclusão com base nas mudanças do código.
          </p>
        </div>

        <button
          type="button"
          disabled={state.isLoading}
          onClick={() =>
            actions.loadAssignedTasks(
              state.projectKey,
              state.statusCategory,
              state.onlyMyTasks,
              state.onlyCurrentSprint,
            )
          }
          className={styles.refreshButton}
        >
          <RefreshCw
            style={{ width: "0.875rem", height: "0.875rem" }}
            className={state.isLoading ? styles.spin : ""}
            aria-hidden="true"
          />
          <span>Atualizar Tasks</span>
        </button>
      </div>

      {/* Jira Project Search & Filter Card */}
      <section
        aria-labelledby="jira-filter-section-title"
        className={styles.filterCard}
      >
        <div style={{ display: "none" }} id="jira-filter-section-title">
          Filtro de Tarefas por Projeto Jira
        </div>
        <form onSubmit={handleSearchSubmit} className={styles.filterForm}>
          <div className={styles.filterField}>
            <label htmlFor="jira-project-key" className={styles.filterLabel}>
              <FolderKanban
                style={{ width: "1rem", height: "1rem", color: "#60a5fa" }}
                aria-hidden="true"
              />
              <span>Chave ou Nome do Projeto no Jira</span>
            </label>
            <input
              id="jira-project-key"
              type="text"
              value={state.projectKey}
              onChange={(e) => actions.setProjectKey(e.target.value)}
              placeholder="ex: IMPCT, F04, PROJ (ou deixe vazio para todos)..."
              className={styles.filterInput}
            />
          </div>

          <div className={styles.filterField} style={{ maxWidth: "260px" }}>
            <label
              htmlFor="jira-status-category"
              className={styles.filterLabel}
            >
              <Filter
                style={{ width: "1rem", height: "1rem", color: "#60a5fa" }}
                aria-hidden="true"
              />
              <span>Status Category</span>
            </label>
            <input
              id="jira-status-category"
              type="text"
              value={state.statusCategory}
              onChange={(e) => actions.setStatusCategory(e.target.value)}
              placeholder="In Progress, To Do (ou 'all' para todos)"
              className={styles.filterInput}
            />
          </div>

          <button
            type="submit"
            disabled={state.isLoading}
            className={styles.searchButton}
            aria-label="Buscar tarefas do projeto no Jira"
          >
            <Search
              style={{ width: "0.875rem", height: "0.875rem" }}
              aria-hidden="true"
            />
            <span>{state.isLoading ? "Buscando..." : "Buscar Tarefas"}</span>
          </button>
        </form>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            marginTop: "0.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "1.25rem",
            }}
          >
            <label
              htmlFor="jira-only-mine-checkbox"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.8125rem",
                color: "var(--color-text-main)",
                cursor: "pointer",
              }}
            >
              <input
                id="jira-only-mine-checkbox"
                type="checkbox"
                checked={state.onlyMyTasks}
                onChange={(e) => {
                  actions.setOnlyMyTasks(e.target.checked);
                  actions.loadAssignedTasks(
                    state.projectKey,
                    state.statusCategory,
                    e.target.checked,
                    state.onlyCurrentSprint,
                  );
                }}
                style={{ cursor: "pointer", width: "1rem", height: "1rem" }}
              />
              <span>Apenas atribuídas a mim</span>
            </label>

            <label
              htmlFor="jira-only-sprint-checkbox"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.8125rem",
                color: "var(--color-text-main)",
                cursor: "pointer",
              }}
            >
              <input
                id="jira-only-sprint-checkbox"
                type="checkbox"
                checked={state.onlyCurrentSprint}
                onChange={(e) => {
                  actions.setOnlyCurrentSprint(e.target.checked);
                  actions.loadAssignedTasks(
                    state.projectKey,
                    state.statusCategory,
                    state.onlyMyTasks,
                    e.target.checked,
                  );
                }}
                style={{ cursor: "pointer", width: "1rem", height: "1rem" }}
              />
              <span>Apenas da Sprint Atual (openSprints)</span>
            </label>
          </div>

          {selectedProject?.jiraProjectKey &&
            state.projectKey !== selectedProject.jiraProjectKey && (
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <span
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--color-text-dim)",
                  }}
                >
                  Sugestão:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    actions.setProjectKey(selectedProject.jiraProjectKey);
                    actions.loadAssignedTasks(
                      selectedProject.jiraProjectKey,
                      state.statusCategory,
                      state.onlyMyTasks,
                      state.onlyCurrentSprint,
                    );
                  }}
                  className={styles.quickChip}
                >
                  Usar Projeto Ativo:{" "}
                  <strong>{selectedProject.jiraProjectKey}</strong> (
                  {selectedProject.name})
                </button>
              </div>
            )}
        </div>
      </section>

      {/* Simulation Mode Banner */}
      {state.assignedTasks.some(
        (t) =>
          t.summary.includes("[SIMULAÇÃO]") || t.summary.includes("[DRY-RUN]"),
      ) && (
        <div
          style={{
            background: "rgba(59, 130, 246, 0.1)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            borderRadius: "0.5rem",
            padding: "0.75rem 1rem",
            fontSize: "0.8125rem",
            color: "#93c5fd",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Sparkles
            style={{
              width: "1rem",
              height: "1rem",
              flexShrink: 0,
              color: "#60a5fa",
            }}
            aria-hidden="true"
          />
          <span>
            <strong>Modo Simulação / Demonstração Ativo:</strong> As tarefas
            abaixo são dados simulados para permitir a validação completa do
            fluxo de geração de comentários e encerramento sem impactar o Jira
            real.
          </span>
        </div>
      )}

      {/* Error */}
      {state.error && (
        <div role="alert" className={styles.alertBox}>
          <div
            style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}
          >
            <AlertCircle
              style={{
                width: "1.25rem",
                height: "1.25rem",
                flexShrink: 0,
                color: "#f87171",
                marginTop: "0.125rem",
              }}
              aria-hidden="true"
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
              }}
            >
              <span>{state.error}</span>
              {state.error.includes("401") && (
                <a
                  href="https://id.atlassian.com/manage-profile/security/api-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#60a5fa",
                    textDecoration: "underline",
                    fontSize: "0.8125rem",
                  }}
                >
                  Abrir gerenciador de tokens da Atlassian para gerar novo token
                </a>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={actions.clearError}
            style={{
              background: "transparent",
              border: "none",
              color: "#f87171",
              fontWeight: 700,
              cursor: "pointer",
              marginLeft: "0.5rem",
            }}
          >
            Dispensar
          </button>
        </div>
      )}

      {/* Task List */}
      <section
        aria-label="Assigned Tasks List"
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        {state.isLoading && state.assignedTasks.length === 0 ? (
          <div className={styles.loadingBox}>
            <RefreshCw
              style={{
                width: "1.5rem",
                height: "1.5rem",
                color: "var(--color-primary)",
              }}
              className={styles.spin}
            />
            <span>Buscando suas tarefas no Jira...</span>
          </div>
        ) : state.assignedTasks.length === 0 ? (
          <div className={styles.emptyState}>
            Nenhuma tarefa em andamento encontrada atribuída ao seu usuário no
            Jira.
          </div>
        ) : (
          <div className={styles.tasksGrid}>
            {state.assignedTasks.map((task, idx) => (
              <article
                key={task.jiraIssueKey || idx}
                className={styles.taskCard}
              >
                <div>
                  <div className={styles.taskHeader}>
                    <span className={styles.keyBadge}>{task.jiraIssueKey}</span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                      }}
                    >
                      {task.storyPoints !== undefined && (
                        <span
                          style={{
                            fontSize: "0.6875rem",
                            padding: "0.125rem 0.375rem",
                            borderRadius: "0.25rem",
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            color: "var(--color-text-dim)",
                          }}
                        >
                          {task.storyPoints} SP
                        </span>
                      )}
                      <span className={getStatusBadgeClass(task.status)}>
                        {task.status}
                      </span>
                    </div>
                  </div>

                  <h3 className={styles.taskSummary}>{task.summary}</h3>

                  {task.jiraDescription && (
                    <p className={styles.taskDescription}>
                      {task.jiraDescription}
                    </p>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  {task.jiraIssueUrl && (
                    <a
                      href={task.jiraIssueUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.jiraLink}
                    >
                      <span>Abrir Jira</span>
                      <ExternalLink
                        style={{ width: "0.75rem", height: "0.75rem" }}
                      />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => actions.openCommentModal(task)}
                    className={styles.logButton}
                  >
                    <MessageSquarePlus
                      style={{ width: "0.875rem", height: "0.875rem" }}
                      aria-hidden="true"
                    />
                    <span>Registrar Atividades</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Comment Generation Modal */}
      <CommentModal
        isOpen={state.isCommentModalOpen}
        task={state.selectedTaskForComment}
        commentDraft={state.generatedCommentDraft}
        isGenerating={state.isGeneratingComment}
        isUploading={state.isUploadingComment}
        successMessage={state.commentSuccessMessage}
        onClose={actions.closeCommentModal}
        onGenerate={() =>
          actions.handleGenerateComment(selectedProject?.rootPath)
        }
        onUpdateMarkdown={actions.handleUpdateCommentMarkdown}
        onUploadToJira={actions.handleUploadCommentToJira}
      />
    </div>
  );
};
