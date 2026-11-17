import {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from "../entities/Project.js";

/**
 * Interface contract for persisting and querying projects.
 */
export interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  findAll(): Promise<Project[]>;
  create(input: CreateProjectInput): Promise<Project>;
  update(id: string, input: UpdateProjectInput): Promise<Project | null>;
  delete(id: string): Promise<boolean>;
}
