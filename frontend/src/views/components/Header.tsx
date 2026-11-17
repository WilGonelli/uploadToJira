import React from "react";
import { Project } from "../../models/Project.js";
import { FolderGit2, Plus, CheckCircle2 } from "lucide-react";
import styles from "./Header.module.css";

interface HeaderProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (id: string) => void;
  onOpenCreateProjectModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projects,
  selectedProject,
  onSelectProject,
  onOpenCreateProjectModal,
}) => {
  return (
    <header role="banner" className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.logoIcon} aria-hidden="true">
          <FolderGit2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className={styles.title}>Jira AI Flow</h1>
          <p className={styles.subtitle}>Model Context Protocol Orchestrator</p>
        </div>
      </div>

      <div className={styles.actionsGroup}>
        {/* Project Selector */}
        <div className={styles.selectorWrapper}>
          <label htmlFor="project-select" className={styles.selectorLabel}>
            Active Project:
          </label>
          <select
            id="project-select"
            value={selectedProject?.id || ""}
            onChange={(e) => onSelectProject(e.target.value)}
            className={styles.selectInput}
            aria-label="Select active software project"
          >
            {projects.length === 0 ? (
              <option value="" disabled>
                No projects registered
              </option>
            ) : (
              projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name} ({proj.jiraProjectKey})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Register New Project Button */}
        <button
          type="button"
          onClick={onOpenCreateProjectModal}
          className={styles.newProjectButton}
          aria-label="Register a new project"
        >
          <Plus className="w-4 h-4 text-blue-400" aria-hidden="true" />
          <span>New Project</span>
        </button>

        {/* Status Pill */}
        <div role="status" className={styles.statusPill}>
          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Localhost Ready</span>
        </div>
      </div>
    </header>
  );
};
