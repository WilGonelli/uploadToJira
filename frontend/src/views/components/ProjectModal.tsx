import React, { useState } from "react";
import { CreateProjectInput } from "../../models/Project.js";
import { X, FolderPlus } from "lucide-react";
import styles from "./ProjectModal.module.css";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateProjectInput) => Promise<unknown>;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [jiraProjectKey, setJiraProjectKey] = useState("F04");
  const [jiraParentKey, setJiraParentKey] = useState("F04-A03");
  const [rootPath, setRootPath] = useState("");
  const [contextMarkdown, setContextMarkdown] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("O nome do projeto é obrigatório.");
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        jiraProjectKey: jiraProjectKey.trim(),
        jiraParentKey: jiraParentKey.trim(),
        rootPath: rootPath.trim(),
        contextMarkdown: contextMarkdown.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao cadastrar projeto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      className={styles.backdrop}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerTitleGroup}>
            <FolderPlus
              style={{ width: "1.25rem", height: "1.25rem", color: "#60a5fa" }}
              aria-hidden="true"
            />
            <h2 id="project-modal-title" className={styles.title}>
              Cadastrar Novo Projeto
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close project modal"
          >
            <X
              style={{ width: "1.25rem", height: "1.25rem" }}
              aria-hidden="true"
            />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {errorMessage && (
            <div role="alert" className={styles.errorMessage}>
              {errorMessage}
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="proj-name" className={styles.label}>
              Nome do Projeto *
            </label>
            <input
              id="proj-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Portal de Migrações"
              className={styles.input}
            />
          </div>

          <div className={styles.gridTwo}>
            <div className={styles.field}>
              <label htmlFor="proj-key" className={styles.label}>
                Jira Project Key *
              </label>
              <input
                id="proj-key"
                type="text"
                required
                value={jiraProjectKey}
                onChange={(e) => setJiraProjectKey(e.target.value)}
                placeholder="ex: IMPCT ou F04"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="proj-parent" className={styles.label}>
                Jira Parent Key *
              </label>
              <input
                id="proj-parent"
                type="text"
                required
                value={jiraParentKey}
                onChange={(e) => setJiraParentKey(e.target.value)}
                placeholder="ex: IMPCT-297 ou F04-A03"
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="proj-path" className={styles.label}>
              Caminho da Raiz do Projeto (Workspace)
            </label>
            <input
              id="proj-path"
              type="text"
              value={rootPath}
              onChange={(e) => setRootPath(e.target.value)}
              placeholder="ex: C:/projects/IBM/outro-projeto ou relativo"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="proj-context" className={styles.label}>
              Contexto Técnico Inicial (Markdown)
            </label>
            <textarea
              id="proj-context"
              rows={4}
              value={contextMarkdown}
              onChange={(e) => setContextMarkdown(e.target.value)}
              placeholder="Descreva brevemente stack, repositórios, regras de negócio ou deixe em branco para preencher com a IA..."
              className={styles.textarea}
            />
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? "Cadastrando..." : "Cadastrar Projeto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
