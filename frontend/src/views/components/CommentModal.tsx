import React, { useEffect, useRef } from "react";
import { JiraTask } from "../../models/JiraTask.js";
import { TaskComment } from "../../models/TaskComment.js";
import { X, Sparkles, UploadCloud, CheckCircle2 } from "lucide-react";
import styles from "./CommentModal.module.css";

interface CommentModalProps {
  isOpen: boolean;
  task: JiraTask | null;
  commentDraft: TaskComment | null;
  isGenerating: boolean;
  isUploading: boolean;
  successMessage: string | null;
  onClose: () => void;
  onGenerate: (rootPath?: string) => void;
  onUpdateMarkdown: (markdown: string) => void;
  onUploadToJira: () => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  task,
  commentDraft,
  isGenerating,
  isUploading,
  successMessage,
  onClose,
  onGenerate,
  onUpdateMarkdown,
  onUploadToJira,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="comment-modal-title"
      className={styles.backdrop}
    >
      <div ref={dialogRef} className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <span className={styles.issueKeyBadge}>
              {task.jiraIssueKey || task.number}
            </span>
            <h2 id="comment-modal-title" className={styles.title}>
              Registro de Atividades: {task.summary}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close comment dialog"
          >
            <X
              style={{ width: "1.25rem", height: "1.25rem" }}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Content Body */}
        <div className={styles.body}>
          {/* Action to trigger AI analysis */}
          <div className={styles.aiActionBox}>
            <div>
              <p className={styles.aiActionTitle}>
                Análise de Código & Comentário Automático
              </p>
              <p className={styles.aiActionSubtitle}>
                A IA lê a descrição da task e os arquivos do projeto para
                redigir o comentário.
              </p>
            </div>
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => onGenerate()}
              className={styles.generateButton}
            >
              <Sparkles
                style={{ width: "1rem", height: "1rem" }}
                aria-hidden="true"
              />
              <span>{isGenerating ? "Inspecionando..." : "Gerar com IA"}</span>
            </button>
          </div>

          {/* Comment Markdown Preview & Manual Editor */}
          <div>
            <label htmlFor="comment-editor" className={styles.editorLabel}>
              Comentário Técnico (Revisão Manual)
            </label>
            <textarea
              id="comment-editor"
              rows={10}
              value={commentDraft?.rawMarkdown || ""}
              onChange={(e) => onUpdateMarkdown(e.target.value)}
              placeholder="Clique em 'Gerar com IA' para criar o comentário ou escreva manualmente seguindo as regras..."
              className={styles.editorTextarea}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className={styles.footer}>
          <div>
            {successMessage && (
              <span className={styles.successMessage} role="status">
                <CheckCircle2
                  style={{ width: "1rem", height: "1rem" }}
                  aria-hidden="true"
                />
                <span>{successMessage}</span>
              </span>
            )}
          </div>

          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <button
              type="button"
              onClick={onClose}
              className={styles.closeButton}
              style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}
            >
              Fechar
            </button>
            <button
              type="button"
              disabled={
                isUploading || !commentDraft || !commentDraft.rawMarkdown.trim()
              }
              onClick={onUploadToJira}
              className={styles.uploadButton}
            >
              <UploadCloud
                style={{ width: "1rem", height: "1rem" }}
                aria-hidden="true"
              />
              <span>{isUploading ? "Enviando..." : "Upload Comentário"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
