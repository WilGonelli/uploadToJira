import React, { useState, useEffect } from "react";
import { Project } from "../models/Project.js";
import {
  useProjectContextViewModel,
  ProjectContextState,
  ProjectContextActions,
} from "../viewmodels/useProjectContextViewModel.js";
import {
  Settings2,
  ScanSearch,
  Sparkles,
  Check,
  HelpCircle,
  Cpu,
  Loader2,
  FolderPlus,
} from "lucide-react";
import styles from "./ProjectContextView.module.css";

interface ProjectContextViewProps {
  viewModel?: {
    state: ProjectContextState;
    actions: ProjectContextActions;
  };
  selectedProject?: Project | null;
  onOpenCreateProjectModal?: () => void;
}

export const ProjectContextView: React.FC<ProjectContextViewProps> = ({
  viewModel,
  selectedProject: propSelectedProject,
  onOpenCreateProjectModal,
}) => {
  const fallbackVm = useProjectContextViewModel();
  const { state, actions } = viewModel ?? fallbackVm;
  const [manualText, setManualText] = useState("");
  const [workspaceScanPath, setWorkspaceScanPath] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const activeProject = state.selectedProject || propSelectedProject;

  // When activeProject changes or has existing context, synchronize draft if empty
  useEffect(() => {
    if (activeProject?.contextMarkdown && !state.refinedContextDraft) {
      actions.setDraft(activeProject.contextMarkdown);
    }
  }, [activeProject?.id, activeProject?.contextMarkdown]);

  const handleSaveDraft = async () => {
    if (!activeProject) {
      if (onOpenCreateProjectModal) {
        onOpenCreateProjectModal();
      }
      return;
    }
    const ok = await actions.updateProjectContext(
      activeProject.id,
      state.refinedContextDraft,
    );
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }
  };

  return (
    <div className={styles.container}>
      {/* Title Banner */}
      <div className={styles.headerBanner}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div>
            <h2 className={styles.headerTitle}>
              <Settings2
                style={{
                  width: "1.25rem",
                  height: "1.25rem",
                  color: "#60a5fa",
                }}
                aria-hidden="true"
              />
              <span>Gerenciamento de Contexto do Projeto</span>
            </h2>
            <p className={styles.headerSubtitle}>
              O contexto é o cérebro que guia a IA do Gemini ao decompor tarefas
              e entender as convenções de código do seu time.
            </p>
          </div>
          {activeProject ? (
            <div
              style={{
                backgroundColor: "var(--color-bg-surface-elevated)",
                border: "1px solid var(--color-border-default)",
                padding: "0.375rem 0.75rem",
                borderRadius: "var(--radius-md)",
                fontSize: "0.75rem",
                color: "var(--color-text-secondary)",
              }}
            >
              Projeto Ativo:{" "}
              <strong style={{ color: "var(--color-text-primary)" }}>
                {activeProject.name}
              </strong>{" "}
              ({activeProject.jiraProjectKey})
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenCreateProjectModal}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                backgroundColor: "var(--color-primary)",
                color: "#ffffff",
                padding: "0.375rem 0.75rem",
                borderRadius: "var(--radius-md)",
                border: "none",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <FolderPlus style={{ width: "1rem", height: "1rem" }} />
              <span>Cadastrar Projeto</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Feedback Banner */}
      {state.error && (
        <div
          role="alert"
          style={{
            backgroundColor: "var(--color-danger-bg)",
            border: "1px solid var(--color-danger-border)",
            color: "#fca5a5",
            padding: "1rem",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontWeight: 700 }}>Erro ao processar:</span>
            <span>{state.error}</span>
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

      {/* Real-time AI Reading and Generating Context Indicator */}
      {state.isScanning && (
        <div role="status" aria-live="polite" className={styles.scanningBanner}>
          <div className={styles.scanningHeader}>
            <div className={styles.scanningTitleGroup}>
              <div className={styles.scanningIconPulse} aria-hidden="true">
                <Cpu style={{ width: "1.25rem", height: "1.25rem" }} />
              </div>
              <div>
                <h3 className={styles.scanningTitle}>
                  IA do Gemini Inspecionando o Projeto...
                </h3>
                <p className={styles.scanningStepText}>
                  {state.scanStepMessage ||
                    "Processando e estruturando arquitetura de software..."}
                </p>
              </div>
            </div>
            <Loader2
              style={{ width: "1.25rem", height: "1.25rem", color: "#818cf8" }}
              className="animate-spin"
              aria-hidden="true"
            />
          </div>

          {/* Animated Scanning Bar */}
          <div className={styles.progressBarContainer} aria-hidden="true">
            <div className={styles.progressBarActive} />
          </div>

          <div className={styles.scanningStepsList}>
            <div className={styles.scanningStepItem}>
              <span className={styles.stepDotActive} aria-hidden="true" />
              <span>
                1. Varrendo arquivos de código, configurações e pacotes do
                repositório
              </span>
            </div>
            <div className={styles.scanningStepItem}>
              <span className={styles.stepDotActive} aria-hidden="true" />
              <span>
                2. Mapeando convenções arquiteturais, dependências e padrões do
                time
              </span>
            </div>
            <div className={styles.scanningStepItem}>
              <span className={styles.stepDotActive} aria-hidden="true" />
              <span>
                3. Sintetizando contexto técnico no formato do gerador de
                tarefas
              </span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.mainGrid}>
        {/* Left Column: Context Ingestion / Refinement */}
        <div className={styles.leftColumn}>
          {/* Option A: Automated Scan */}
          <div className={styles.optionCard}>
            <h3 className={styles.optionTitle}>
              <ScanSearch
                style={{ width: "1rem", height: "1rem", color: "#60a5fa" }}
                aria-hidden="true"
              />
              <span>Opção 1: Varredura Automática de Código</span>
            </h3>
            <p className={styles.optionDesc}>
              Aponte para o diretório no workspace; a ferramenta lerá
              dependências e arquivos para gerar o contexto técnico.
            </p>
            <div className={styles.scanInputRow}>
              <input
                type="text"
                value={workspaceScanPath}
                onChange={(e) => setWorkspaceScanPath(e.target.value)}
                placeholder="Caminho relativo (ex: my-project) ou vazio para workspace raiz"
                className={styles.textInput}
              />
              <button
                type="button"
                disabled={state.isLoading}
                onClick={() => {
                  const targetPath =
                    workspaceScanPath.trim() ||
                    state.selectedProject?.rootPath ||
                    "";
                  actions.autoGenerateContext(targetPath);
                }}
                className={styles.primaryButton}
              >
                {state.isScanning ? "Varrendo..." : "Escanear"}
              </button>
            </div>
          </div>

          {/* Option B: Manual Input with AI Clarification */}
          <div className={styles.optionCard}>
            <h3 className={styles.optionTitle}>
              <Sparkles
                style={{ width: "1rem", height: "1rem", color: "#a5b4fc" }}
                aria-hidden="true"
              />
              <span>Opção 2: Contexto Manual com Refinamento Interativo</span>
            </h3>
            <p className={styles.optionDesc}>
              Descreva as regras do projeto. O Gemini avaliará se faltam dados
              cruciais e fará perguntas para aprimorar o contexto.
            </p>
            <textarea
              rows={4}
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Descreva a stack, bibliotecas de teste, padrões arquiteturais, chaves de Phase e Activity..."
              className={styles.manualTextarea}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                disabled={state.isLoading || !manualText.trim()}
                onClick={() => actions.refineContextWithAi(manualText)}
                className={styles.refineButton}
              >
                {state.isScanning ? "Analisando..." : "Refinar com Gemini"}
              </button>
            </div>
          </div>

          {/* Clarification Questions from Gemini */}
          {state.clarificationQuestions.length > 0 && (
            <div className={styles.clarificationCard}>
              <h4 className={styles.clarificationTitle}>
                <HelpCircle
                  style={{ width: "1rem", height: "1rem" }}
                  aria-hidden="true"
                />
                <span>Perguntas da IA para Aprimoramento:</span>
              </h4>
              <ul className={styles.questionsList}>
                {state.clarificationQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
              <p
                style={{
                  fontSize: "0.6875rem",
                  color: "#fef08a",
                  paddingTop: "0.25rem",
                }}
              >
                Responda às dúvidas acima no campo manual e clique em "Refinar
                com Gemini" novamente.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Refined Context Draft & Persistence */}
        <div className={styles.rightColumn}>
          <div>
            <div className={styles.editorHeader}>
              <label htmlFor="context-draft" className={styles.editorLabel}>
                Contexto Final Ativo (Persistido no SQLite)
              </label>
              {saveSuccess && (
                <span className={styles.savedBadge}>
                  <Check
                    style={{ width: "0.875rem", height: "0.875rem" }}
                    aria-hidden="true"
                  />
                  <span>Salvo com sucesso!</span>
                </span>
              )}
            </div>
            <textarea
              id="context-draft"
              rows={15}
              value={state.refinedContextDraft}
              onChange={(e) => actions.setDraft(e.target.value)}
              placeholder="O contexto compilado do projeto aparecerá aqui..."
              className={styles.draftTextarea}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "0.5rem",
              paddingTop: "0.5rem",
            }}
          >
            {!activeProject && (
              <span
                style={{ fontSize: "0.75rem", color: "var(--color-warning)" }}
              >
                Nenhum projeto cadastrado no banco. Clique abaixo para cadastrar
                e vincular.
              </span>
            )}
            <button
              type="button"
              disabled={state.isLoading || !state.refinedContextDraft.trim()}
              onClick={handleSaveDraft}
              className={styles.saveButton}
              title={
                !state.refinedContextDraft.trim()
                  ? "Escaneie ou digite um contexto primeiro"
                  : "Salvar contexto"
              }
            >
              <Check
                style={{ width: "1rem", height: "1rem" }}
                aria-hidden="true"
              />
              <span>
                {activeProject
                  ? `Salvar Contexto em "${activeProject.name}"`
                  : "Cadastrar Projeto com este Contexto"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
