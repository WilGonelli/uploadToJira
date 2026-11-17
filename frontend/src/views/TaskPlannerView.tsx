import React from "react";
import { Project } from "../models/Project.js";
import { useTaskPlannerViewModel } from "../viewmodels/useTaskPlannerViewModel.js";
import { TaskCard } from "./components/TaskCard.js";
import {
  Sparkles,
  UploadCloud,
  Plus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import styles from "./TaskPlannerView.module.css";

interface TaskPlannerViewProps {
  selectedProject: Project | null;
}

export const TaskPlannerView: React.FC<TaskPlannerViewProps> = ({
  selectedProject,
}) => {
  const { state, actions } = useTaskPlannerViewModel();

  return (
    <div className={styles.container}>
      {/* Title & Project context banner */}
      <div className={styles.banner}>
        <div>
          <h2 className={styles.bannerTitle}>
            <Sparkles
              style={{ width: "1.25rem", height: "1.25rem", color: "#60a5fa" }}
              aria-hidden="true"
            />
            Planejamento Inteligente de Tarefas
          </h2>
          <p className={styles.bannerSubtitle}>
            Projeto Selecionado:{" "}
            <span className={styles.projectHighlight}>
              {selectedProject
                ? `${selectedProject.name} (${selectedProject.jiraProjectKey})`
                : "Nenhum selecionado"}
            </span>
          </p>
        </div>

        {state.plannedTasks.length > 0 && (
          <button
            type="button"
            disabled={state.isUploading || !selectedProject}
            onClick={() =>
              selectedProject && actions.handleUploadToJira(selectedProject.id)
            }
            className={styles.uploadJiraButton}
          >
            <UploadCloud
              style={{ width: "1rem", height: "1rem" }}
              aria-hidden="true"
            />
            <span>
              {state.isUploading
                ? "Enviando ao Jira..."
                : `Upload to Jira (${state.plannedTasks.length})`}
            </span>
          </button>
        )}
      </div>

      {/* Error Banner */}
      {state.error && (
        <div role="alert" className={styles.alertBox}>
          <div className={styles.alertContent}>
            <AlertCircle
              style={{
                width: "1rem",
                height: "1rem",
                flexShrink: 0,
                color: "#f87171",
              }}
              aria-hidden="true"
            />
            <span>{state.error}</span>
          </div>
          <button
            type="button"
            onClick={actions.clearError}
            className={styles.dismissButton}
          >
            Dispensar
          </button>
        </div>
      )}

      {/* Upload Success Report */}
      {state.uploadResult && (
        <div role="status" className={styles.successBox}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontWeight: 700,
              color: "var(--color-success)",
              fontSize: "0.875rem",
            }}
          >
            <CheckCircle2
              style={{ width: "1rem", height: "1rem" }}
              aria-hidden="true"
            />
            <span>
              Upload Concluído com Sucesso! (
              {state.uploadResult.successfulTasks.length}/
              {state.uploadResult.totalTasks} tasks criadas)
            </span>
          </div>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Todas as tarefas foram registradas no histórico local para evitar
            duplicações futuras.
          </p>
        </div>
      )}

      {/* Interactive Prompt & AI Generator Form */}
      <section aria-labelledby="prompt-heading" className={styles.promptCard}>
        <label
          id="prompt-heading"
          htmlFor="user-prompt"
          className={styles.promptLabel}
        >
          Descreva o requisito ou funcionalidade para a IA planejar
        </label>
        <div className={styles.promptRow}>
          <textarea
            id="user-prompt"
            rows={3}
            value={state.userPrompt}
            onChange={(e) => actions.setUserPrompt(e.target.value)}
            placeholder="ex: Implementar módulo de exportação em CSV com barra de progresso e testes unitários com Vitest..."
            className={styles.promptTextarea}
          />
          <button
            type="button"
            disabled={state.isLoading || !state.userPrompt.trim()}
            onClick={() => actions.handlePlanTasks(selectedProject?.id || "")}
            className={styles.planButton}
          >
            <Sparkles
              style={{ width: "1rem", height: "1rem" }}
              aria-hidden="true"
            />
            <span>{state.isLoading ? "Planejando..." : "Planejar com IA"}</span>
          </button>
        </div>
      </section>

      {/* Planned Tasks Output */}
      {state.plannedTasks.length > 0 && (
        <div className={styles.tasksHeader}>
          <h3 className={styles.tasksSectionTitle}>
            Cards de Tarefas Geradas ({state.plannedTasks.length})
          </h3>
          <button
            type="button"
            onClick={actions.handleAddTaskCard}
            className={styles.uploadJiraButton}
            style={{
              backgroundColor: "var(--color-bg-surface-elevated)",
              color: "var(--color-text-secondary)",
              border: "1px solid var(--color-border-default)",
              boxShadow: "none",
            }}
          >
            <Plus
              style={{ width: "0.875rem", height: "0.875rem" }}
              aria-hidden="true"
            />
            <span>Adicionar Task Manual</span>
          </button>
        </div>
      )}

      {/* Grid of Task Cards */}
      <section aria-label="Planned Tasks List" className={styles.tasksGrid}>
        {state.plannedTasks.map((task, index) => (
          <TaskCard
            key={index}
            task={task}
            index={index}
            onUpdate={actions.handleUpdateTaskCard}
            onRemove={actions.handleRemoveTaskCard}
          />
        ))}
      </section>

      {state.plannedTasks.length === 0 && !state.isLoading && (
        <div className={styles.emptyState}>
          Nenhuma tarefa planejada no momento. Descreva uma funcionalidade acima
          para o Gemini decompor em tasks Jira.
        </div>
      )}
    </div>
  );
};
