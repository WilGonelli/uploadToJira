import React from "react";
import { Sparkles, CheckSquare, Settings2 } from "lucide-react";
import styles from "./Sidebar.module.css";

export type ActiveTab = "plan_tasks" | "my_tasks" | "project_context";

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onQuickPlanPrompt: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onQuickPlanPrompt,
}) => {
  return (
    <nav aria-label="Tool Navigation" className={styles.sidebar}>
      <div>
        <span className={styles.navSectionTitle}>AI & Jira Tools</span>
        <ul className={styles.navList} role="list">
          <li>
            <button
              type="button"
              onClick={() => {
                onTabChange("plan_tasks");
                onQuickPlanPrompt();
              }}
              className={`${styles.navButton} ${activeTab === "plan_tasks" ? styles.navButtonActive : ""}`}
              aria-current={activeTab === "plan_tasks" ? "page" : undefined}
            >
              <Sparkles className={styles.icon} aria-hidden="true" />
              <span>Planejar Tasks</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              onClick={() => onTabChange("my_tasks")}
              className={`${styles.navButton} ${activeTab === "my_tasks" ? styles.navButtonActive : ""}`}
              aria-current={activeTab === "my_tasks" ? "page" : undefined}
            >
              <CheckSquare className={styles.icon} aria-hidden="true" />
              <span>Minhas Tasks & Log</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              onClick={() => onTabChange("project_context")}
              className={`${styles.navButton} ${activeTab === "project_context" ? styles.navButtonActive : ""}`}
              aria-current={
                activeTab === "project_context" ? "page" : undefined
              }
            >
              <Settings2 className={styles.icon} aria-hidden="true" />
              <span>Contexto do Projeto</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Persistence Note */}
      <div className={styles.footerNote}>
        <p className={styles.footerTitle}>SQLite Persistido</p>
        <p>
          Tarefas e contextos salvos localmente em volume Docker sem perda de
          histórico.
        </p>
      </div>
    </nav>
  );
};
