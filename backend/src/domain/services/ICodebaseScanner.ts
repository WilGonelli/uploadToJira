/**
 * Result of scanning a project codebase directory.
 */
export interface CodebaseScanResult {
  rootPath: string;
  files: string[];
  dependencies: Record<string, string>;
  projectType: string;
  summary: string;
}

/**
 * Interface contract for scanning local project directories to extract context or diffs.
 */
export interface ICodebaseScanner {
  /**
   * Scans a directory in the workspace to synthesize an overview.
   */
  scanDirectory(relativeOrAbsolutePath: string): Promise<CodebaseScanResult>;

  /**
   * Finds files related to a specific task summary or keywords.
   */
  findRelevantFiles(
    relativeOrAbsolutePath: string,
    keywords: string[],
  ): Promise<string[]>;

  /**
   * Reads the content of specified files up to a safe token limit.
   */
  readFilesContent(
    rootPath: string,
    filePaths: string[],
  ): Promise<Record<string, string>>;
}
