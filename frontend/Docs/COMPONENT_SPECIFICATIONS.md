# Component Specifications & User Interaction Guide

This document describes the design, accessibility attributes, and behavior of the core UI components in the Jira AI Orchestrator.

---

## 1. Global Navigation & Layout

### 1.1. Header (`Header.tsx`)
- **Semantic Element**: `<header role="banner">`
- **Elements**:
  - Logo & Brand Title: `"Jira AI Flow"`.
  - Project Selector (`ProjectSelector.tsx`):
    - Native `<select>` or custom ARIA combobox with `aria-label="Active Project"`.
    - Shows available registered projects and an option `"+ Register New Project"`.
  - System Status Indicator: Visual pill indicating Jira Cloud & Backend connectivity (`role="status"`).

### 1.2. Sidebar (`Sidebar.tsx`)
- **Semantic Element**: `<nav aria-label="Main Tool Navigation">`
- **Actions / Quick Tools**:
  1. **"Planejar Tasks"**:
     - Automatically selects the Task Planner view.
     - Injects the active project's context into the AI chat prompt buffer.
  2. **"Upload to Jira"**:
     - Highlights the pending batch of planned tasks ready for submission.
  3. **"Minhas Tasks & Log"**:
     - Opens the user's assigned Jira tasks view to generate and post comments.
  4. **"Contexto do Projeto"**:
     - Opens the project registration and context refinement workspace.

---

## 2. Interactive Feature Components

### 2.1. Task Card (`TaskCard.tsx`)
- **Semantic Element**: `<article aria-labelledby="task-title-{id}">`
- **States**:
  - **Read-Only / Preview Mode**: Shows Summary, Story Points badge, Phase, Activity, Assignee, and collapsible DoD checklist.
  - **Edit Mode**: Replaces text with inline form controls (`<input>`, `<textarea>`) allowing manual overrides of any task attribute.
- **Action Controls**:
  - `Edit Task` button (`aria-label="Edit Task {number}"`).
  - `Remove Task` button (`aria-label="Remove Task {number}"`).
  - `Ask AI to Refine` button: Focuses prompt input to instruct the AI to modify this specific task.

### 2.2. Comment Generator Modal (`CommentModal.tsx`)
- **Semantic Element**: `<dialog aria-labelledby="dialog-title" aria-modal="true">`
- **User Flow**:
  1. Triggered from a task card in the "Minhas Tasks" view.
  2. Displays:
     - Task key and summary.
     - Progress indicator while the AI scans project files in `/workspace` and drafts the technical report.
     - Markdown editor allowing the developer to review and adjust the text.
     - Button: `"Upload Comment to Jira"` (`aria-busy={isSubmitting}`).
- **Keyboard Handling**:
  - Traps focus within the dialog while open.
  - Closes on `Escape` key press.
  - Restores focus to the triggering button upon dismissal.

### 2.3. Project Context Refinement (`ProjectContextManager.tsx`)
- **Flow 1: Automated Codebase Scan**:
  - User selects a folder from `/workspace`.
  - Backend scans dependencies, directory layout, and key config files.
  - Generates initial context markdown for user review.
- **Flow 2: Manual Input with AI Q&A Refinement**:
  - User pastes a manual description of the project.
  - The Gemini agent inspects the text against standard Jira requirements.
  - If information is missing, the AI asks targeted questions (e.g., *"Which story points scale is preferred?", "Are there specific Jira phase or activity custom field values?"*).
  - Saves the refined context into SQLite once approved by the user.
