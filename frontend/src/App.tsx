import React, { useState } from "react";
import { Header } from "./views/components/Header.js";
import { Sidebar, ActiveTab } from "./views/components/Sidebar.js";
import { ProjectModal } from "./views/components/ProjectModal.js";
import { TaskPlannerView } from "./views/TaskPlannerView.js";
import { MyTasksView } from "./views/MyTasksView.js";
import { ProjectContextView } from "./views/ProjectContextView.js";
import { useProjectContextViewModel } from "./viewmodels/useProjectContextViewModel.js";
import styles from "./App.module.css";

export const App: React.FC = () => {
  const projectViewModel = useProjectContextViewModel();
  const { state: projectState, actions: projectActions } = projectViewModel;
  const [activeTab, setActiveTab] = useState<ActiveTab>("plan_tasks");
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  return (
    <div className={styles.appContainer}>
      {/* Header Landmark */}
      <Header
        projects={projectState.projects}
        selectedProject={projectState.selectedProject}
        onSelectProject={projectActions.selectProject}
        onOpenCreateProjectModal={() => setIsProjectModalOpen(true)}
      />

      {/* Main Content Area with Sidebar */}
      <div className={styles.bodyLayout}>
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onQuickPlanPrompt={() => setActiveTab("plan_tasks")}
        />

        <main role="main" className={styles.mainContent} tabIndex={-1}>
          {activeTab === "plan_tasks" && (
            <TaskPlannerView selectedProject={projectState.selectedProject} />
          )}

          {activeTab === "my_tasks" && (
            <MyTasksView selectedProject={projectState.selectedProject} />
          )}

          {activeTab === "project_context" && (
            <ProjectContextView
              viewModel={projectViewModel}
              selectedProject={projectState.selectedProject}
              onOpenCreateProjectModal={() => setIsProjectModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Project Creation Dialog */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={projectActions.createNewProject}
      />
    </div>
  );
};

export default App;
