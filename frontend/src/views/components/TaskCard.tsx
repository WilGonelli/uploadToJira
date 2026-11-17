import React, { useState } from "react";
import { JiraTask } from "../../models/JiraTask.js";
import {
  Edit2,
  Check,
  Trash2,
  ExternalLink,
  BarChart2,
  GitMerge,
  Milestone,
  Activity,
  User,
} from "lucide-react";
import styles from "./TaskCard.module.css";

interface TaskCardProps {
  task: JiraTask;
  index: number;
  onUpdate: (index: number, updated: Partial<JiraTask>) => void;
  onRemove: (index: number) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index,
  onUpdate,
  onRemove,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<JiraTask>(task);

  const handleSave = () => {
    onUpdate(index, draft);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(task);
    setIsEditing(false);
  };

  return (
    <article
      aria-labelledby={`task-heading-${index}`}
      className={styles.taskCard}
    >
      <div>
        {/* Header badges and actions */}
        <div className={styles.cardHeader}>
          <div className={styles.badgesGroup}>
            <span className={styles.numberBadge}>#{draft.number}</span>
            <span
              className={`${styles.statusBadge} ${
                draft.status === "DONE"
                  ? styles.statusDone
                  : styles.statusPending
              }`}
            >
              {draft.status}
            </span>
          </div>

          <div className={styles.actionsGroup}>
            {isEditing ? (
              <button
                type="button"
                onClick={handleSave}
                className={`${styles.actionButton} ${styles.saveButton}`}
                aria-label={`Save modifications for task #${draft.number}`}
              >
                <Check className="w-4 h-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className={styles.actionButton}
                aria-label={`Edit task #${draft.number}`}
              >
                <Edit2 className="w-4 h-4" aria-hidden="true" />
              </button>
            )}

            <button
              type="button"
              onClick={() => onRemove(index)}
              className={`${styles.actionButton} ${styles.deleteButton}`}
              aria-label={`Delete task #${draft.number}`}
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Task Content */}
        {isEditing ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <div className={styles.formControl}>
              <label
                htmlFor={`edit-summary-${index}`}
                className={styles.formLabel}
              >
                Summary (Task Title)
              </label>
              <input
                id={`edit-summary-${index}`}
                type="text"
                value={draft.summary}
                onChange={(e) =>
                  setDraft({ ...draft, summary: e.target.value })
                }
                className={styles.formInput}
              />
            </div>

            {/* Jira Attributes Editing Grid */}
            <div className={styles.formGrid}>
              <div className={styles.formControl}>
                <label
                  htmlFor={`edit-sp-${index}`}
                  className={styles.formLabel}
                >
                  Story Points
                </label>
                <input
                  id={`edit-sp-${index}`}
                  type="number"
                  step="0.5"
                  min="0"
                  value={draft.storyPoints}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      storyPoints: parseFloat(e.target.value) || 0,
                    })
                  }
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formControl}>
                <label
                  htmlFor={`edit-parent-${index}`}
                  className={styles.formLabel}
                >
                  Parent Key
                </label>
                <input
                  id={`edit-parent-${index}`}
                  type="text"
                  value={draft.parent}
                  onChange={(e) =>
                    setDraft({ ...draft, parent: e.target.value })
                  }
                  placeholder="e.g. IMPCT-297"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formControl}>
                <label
                  htmlFor={`edit-phase-${index}`}
                  className={styles.formLabel}
                >
                  Phase
                </label>
                <input
                  id={`edit-phase-${index}`}
                  type="text"
                  value={draft.phase}
                  onChange={(e) =>
                    setDraft({ ...draft, phase: e.target.value })
                  }
                  placeholder="e.g. Phase 4"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formControl}>
                <label
                  htmlFor={`edit-activity-${index}`}
                  className={styles.formLabel}
                >
                  Activity
                </label>
                <input
                  id={`edit-activity-${index}`}
                  type="text"
                  value={draft.activity}
                  onChange={(e) =>
                    setDraft({ ...draft, activity: e.target.value })
                  }
                  placeholder="e.g. Activity 3"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formControl}>
                <label
                  htmlFor={`edit-assign-${index}`}
                  className={styles.formLabel}
                >
                  Assign to
                </label>
                <input
                  id={`edit-assign-${index}`}
                  type="text"
                  value={draft.assign}
                  onChange={(e) =>
                    setDraft({ ...draft, assign: e.target.value })
                  }
                  placeholder="e.g. me or user@example.com"
                  className={styles.formInput}
                />
              </div>
            </div>

            <div className={styles.formControl}>
              <label
                htmlFor={`edit-desc-${index}`}
                className={styles.formLabel}
              >
                Description
              </label>
              <textarea
                id={`edit-desc-${index}`}
                rows={3}
                value={draft.jiraDescription}
                onChange={(e) =>
                  setDraft({ ...draft, jiraDescription: e.target.value })
                }
                className={styles.formInput}
              />
            </div>

            <div className={styles.formControl}>
              <label htmlFor={`edit-dod-${index}`} className={styles.formLabel}>
                Definition of Done (DoD)
              </label>
              <textarea
                id={`edit-dod-${index}`}
                rows={3}
                value={draft.dod}
                onChange={(e) => setDraft({ ...draft, dod: e.target.value })}
                className={styles.formInput}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.5rem",
                paddingTop: "0.5rem",
              }}
            >
              <button
                type="button"
                onClick={handleCancel}
                className={styles.actionButton}
                style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className={styles.saveButton}
                style={{
                  padding: "0.375rem 1rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                }}
              >
                Apply Changes
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 id={`task-heading-${index}`} className={styles.taskTitle}>
              {task.summary}
            </h2>

            {/* Jira Attributes Panel */}
            <div
              className={styles.jiraAttributesContainer}
              aria-label={`Jira attributes for task #${task.number}`}
            >
              <div className={styles.attributeItem} title="Story Points">
                <span className={styles.attributeLabel}>
                  <BarChart2
                    className={styles.attributeIcon}
                    aria-hidden="true"
                  />
                  SP:
                </span>
                <span className={styles.attributeValueHighlight}>
                  {task.storyPoints} {task.storyPoints === 1 ? "pt" : "pts"}
                </span>
              </div>

              <div className={styles.attributeItem} title="Parent Issue Key">
                <span className={styles.attributeLabel}>
                  <GitMerge
                    className={styles.attributeIcon}
                    aria-hidden="true"
                  />
                  Parent:
                </span>
                <span className={styles.parentBadge}>
                  {task.parent || "None"}
                </span>
              </div>

              <div className={styles.attributeItem} title="Project Phase">
                <span className={styles.attributeLabel}>
                  <Milestone
                    className={styles.attributeIcon}
                    aria-hidden="true"
                  />
                  Phase:
                </span>
                <span className={styles.attributeValue}>
                  {task.phase || "-"}
                </span>
              </div>

              <div className={styles.attributeItem} title="Project Activity">
                <span className={styles.attributeLabel}>
                  <Activity
                    className={styles.attributeIcon}
                    aria-hidden="true"
                  />
                  Activity:
                </span>
                <span className={styles.attributeValue}>
                  {task.activity || "-"}
                </span>
              </div>

              <div className={styles.attributeItem} title="Assign to">
                <span className={styles.attributeLabel}>
                  <User className={styles.attributeIcon} aria-hidden="true" />
                  Assign:
                </span>
                <span className={styles.attributeValue}>
                  {task.assign || "me"}
                </span>
              </div>
            </div>

            <p className={styles.taskDescription}>{task.jiraDescription}</p>

            {task.dod && (
              <div className={styles.dodSection}>
                <span className={styles.dodTitle}>Definition of Done</span>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-secondary)",
                    whiteSpace: "pre-line",
                    lineHeight: 1.5,
                  }}
                >
                  {task.dod}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Uploaded Link Indicator if created in Jira */}
      {task.jiraIssueKey && (
        <div className={styles.cardFooter}>
          <span
            style={{
              color: "var(--color-success)",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            <Check
              style={{ width: "0.875rem", height: "0.875rem" }}
              aria-hidden="true"
            />
            Uploaded: {task.jiraIssueKey}
          </span>
          {task.jiraIssueUrl && (
            <a
              href={task.jiraIssueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.jiraLink}
              aria-label={`Open Jira issue ${task.jiraIssueKey} in new tab`}
            >
              <span>View in Jira</span>
              <ExternalLink
                style={{ width: "0.75rem", height: "0.75rem" }}
                aria-hidden="true"
              />
            </a>
          )}
        </div>
      )}
    </article>
  );
};
