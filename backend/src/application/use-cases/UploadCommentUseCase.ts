import { CommentUploadResult } from "../../domain/entities/TaskComment.js";
import { IJiraService } from "../../domain/services/IJiraService.js";

export interface UploadCommentCommand {
  issueKey: string;
  commentMarkdown: string;
}

export class UploadCommentUseCase {
  constructor(private readonly jiraService: IJiraService) {}

  public async execute(
    command: UploadCommentCommand,
  ): Promise<CommentUploadResult> {
    if (!command.issueKey) throw new Error("Issue key is required");
    if (!command.commentMarkdown)
      throw new Error("Comment markdown content is required");

    return this.jiraService.addComment(
      command.issueKey,
      command.commentMarkdown,
    );
  }
}
