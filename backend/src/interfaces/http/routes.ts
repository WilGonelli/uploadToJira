import { Router } from "express";
import { ProjectController } from "./projectController.js";
import { TaskController } from "./taskController.js";
import { CommentController } from "./commentController.js";

export function createApiRouter(
  projectController: ProjectController,
  taskController: TaskController,
  commentController: CommentController,
): Router {
  const router = Router();

  // Health check endpoint
  router.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Projects endpoints
  router.get("/projects", (req, res) =>
    projectController.getAllProjects(req, res),
  );
  router.get("/projects/:id", (req, res) =>
    projectController.getProjectById(req, res),
  );
  router.post("/projects", (req, res) =>
    projectController.createProject(req, res),
  );
  router.put("/projects/:id", (req, res) =>
    projectController.updateProject(req, res),
  );
  router.post("/projects/refine-context", (req, res) =>
    projectController.refineContext(req, res),
  );

  // Tasks endpoints
  router.post("/tasks/plan", (req, res) => taskController.planTasks(req, res));
  router.post("/tasks/upload", (req, res) =>
    taskController.uploadTasks(req, res),
  );
  router.get("/tasks/my-tasks", (req, res) =>
    taskController.getMyTasks(req, res),
  );

  // Comments endpoints
  router.post("/comments/generate", (req, res) =>
    commentController.generateComment(req, res),
  );
  router.post("/comments/upload", (req, res) =>
    commentController.uploadComment(req, res),
  );

  return router;
}
