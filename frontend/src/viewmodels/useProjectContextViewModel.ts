import { useState, useEffect, useCallback } from "react";
import { Project, CreateProjectInput } from "../models/Project.js";
import * as projectApi from "../api/projectApi.js";

export interface ProjectContextState {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  isScanning: boolean;
  scanStepMessage: string;
  error: string | null;
  clarificationQuestions: string[];
  refinedContextDraft: string;
  isContextReady: boolean;
}

export interface ProjectContextActions {
  selectProject: (projectId: string) => void;
  createNewProject: (input: CreateProjectInput) => Promise<Project | null>;
  updateProjectContext: (
    projectId: string,
    contextMarkdown: string,
  ) => Promise<boolean>;
  setDraft: (markdown: string) => void;
  refineContextWithAi: (manualContext: string) => Promise<void>;
  autoGenerateContext: (rootPath: string) => Promise<void>;
  clearError: () => void;
}

export function useProjectContextViewModel(): {
  state: ProjectContextState;
  actions: ProjectContextActions;
} {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStepMessage, setScanStepMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [clarificationQuestions, setClarificationQuestions] = useState<
    string[]
  >([]);
  const [refinedContextDraft, setRefinedContextDraft] = useState<string>("");
  const [isContextReady, setIsContextReady] = useState<boolean>(false);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectApi.fetchProjects();
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0]);
        if (data[0].contextMarkdown) {
          setRefinedContextDraft(data[0].contextMarkdown);
          setIsContextReady(true);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  }, [selectedProject]);

  useEffect(() => {
    loadProjects();
  }, []);

  const selectProject = useCallback(
    (projectId: string) => {
      const target = projects.find((p) => p.id === projectId) || null;
      setSelectedProject(target);
      if (target) {
        setRefinedContextDraft(target.contextMarkdown);
        setClarificationQuestions([]);
        setIsContextReady(true);
      }
    },
    [projects],
  );

  const createNewProject = useCallback(
    async (input: CreateProjectInput): Promise<Project | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const created = await projectApi.createProject(input);
        setProjects((prev) => [created, ...prev]);
        setSelectedProject(created);
        return created;
      } catch (err: any) {
        setError(err.message || "Failed to create project");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const updateProjectContext = useCallback(
    async (projectId: string, contextMarkdown: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const updated = await projectApi.updateProject(projectId, {
          contextMarkdown,
        });
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? updated : p)),
        );
        setSelectedProject((prev) => (prev?.id === projectId ? updated : prev));
        return true;
      } catch (err: any) {
        setError(err.message || "Failed to update project context");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const setDraft = useCallback((markdown: string) => {
    setRefinedContextDraft(markdown);
  }, []);

  const refineContextWithAi = useCallback(async (manualContext: string) => {
    setIsLoading(true);
    setIsScanning(true);
    setScanStepMessage(
      "Gemini AI is analyzing project requirements and architecture...",
    );
    setError(null);
    try {
      const result = await projectApi.refineProjectContext({ manualContext });
      setRefinedContextDraft(result.refinedContext);
      setClarificationQuestions(result.clarificationQuestions || []);
      setIsContextReady(result.isReady);
    } catch (err: any) {
      setError(err.message || "Failed to refine context with AI");
    } finally {
      setIsLoading(false);
      setIsScanning(false);
      setScanStepMessage("");
    }
  }, []);

  const autoGenerateContext = useCallback(async (rootPath: string) => {
    setIsLoading(true);
    setIsScanning(true);
    setScanStepMessage("Inspecting repository structure and source files...");
    setError(null);
    try {
      const result = await projectApi.refineProjectContext({ rootPath });
      setRefinedContextDraft(result.refinedContext);
      setClarificationQuestions([]);
      setIsContextReady(true);
    } catch (err: any) {
      setError(err.message || "Failed to auto-generate context from codebase");
    } finally {
      setIsLoading(false);
      setIsScanning(false);
      setScanStepMessage("");
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    state: {
      projects,
      selectedProject,
      isLoading,
      isScanning,
      scanStepMessage,
      error,
      clarificationQuestions,
      refinedContextDraft,
      isContextReady,
    },
    actions: {
      selectProject,
      createNewProject,
      updateProjectContext,
      setDraft,
      refineContextWithAi,
      autoGenerateContext,
      clearError,
    },
  };
}
