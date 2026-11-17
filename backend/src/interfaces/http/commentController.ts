import { Request, Response } from "express";
import { GenerateCommentUseCase } from "../../application/use-cases/GenerateCommentUseCase.js";
import { UploadCommentUseCase } from "../../application/use-cases/UploadCommentUseCase.js";

export class CommentController {
  constructor(
    private readonly generateCommentUC: GenerateCommentUseCase,
    private readonly uploadCommentUC: UploadCommentUseCase,
  ) {}

  public async generateComment(req: Request, res: Response): Promise<void> {
    try {
      const { issueKey, summary, jiraDescription, dod, rootPath, keywords } =
        req.body;
      if (!issueKey || !summary) {
        res.status(400).json({
          success: false,
          error: "Fields 'issueKey' and 'summary' are required",
        });
        return;
      }
      const comment = await this.generateCommentUC.execute({
        issueKey,
        summary,
        jiraDescription,
        dod,
        rootPath,
        keywords,
      });
      res.json({ success: true, data: comment });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async uploadComment(req: Request, res: Response): Promise<void> {
    try {
      const { issueKey, commentMarkdown } = req.body;
      if (!issueKey || !commentMarkdown) {
        res.status(400).json({
          success: false,
          error: "Fields 'issueKey' and 'commentMarkdown' are required",
        });
        return;
      }
      const result = await this.uploadCommentUC.execute({
        issueKey,
        commentMarkdown,
      });
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
