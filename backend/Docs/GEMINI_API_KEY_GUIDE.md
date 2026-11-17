# Gemini API Key Guide

This guide walks through generating and configuring a Google Gemini API key to power the AI Agent in the Jira AI Orchestrator.

---

## 1. Prerequisites
- A Google account (personal or Google Workspace).
- A web browser.

---

## 2. Step-by-Step Instructions to Generate the API Key

1. **Navigate to Google AI Studio**:
   - Open your browser and go to [https://aistudio.google.com/](https://aistudio.google.com/).

2. **Sign In**:
   - Log in using your Google account credentials.

3. **Open the API Key Management Section**:
   - In the left sidebar navigation menu, click on the **"Get API key"** button (or visit [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)).

4. **Create a New Key**:
   - Click the blue **"Create API key"** button.
   - Choose whether to:
     - **"Create API key in new project"** (recommended for quick local setup).
     - Or attach the key to an existing Google Cloud Project if your organization manages GCP billing.

5. **Copy the Generated Key**:
   - An API key dialog will appear displaying a long string (e.g., `AIzaSy...`).
   - Click **Copy** to save it to your clipboard.
   - Store it securely and never commit it to source control.

---

## 3. Configuring the API Key in the Project

1. Navigate to the `backend/` folder on your local machine.
2. If you haven't already, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Open `backend/.env` in your editor and paste the copied key into the `GEMINI_API_KEY` variable:
   ```env
   GEMINI_API_KEY=AIzaSyYourGeneratedSecretKeyHere
   GEMINI_MODEL=gemini-2.5-flash
   ```

---

## 4. Model Selection & Rate Limits

- **`gemini-2.5-flash`** (Default):
  - Ultra-fast response times, optimal for function calling (MCP tool use), code parsing, and interactive chat.
  - Included in the Google AI Studio free tier (up to 15 Requests Per Minute / 1,500 Requests Per Day).
- **`gemini-2.5-pro`** (Optional):
  - Advanced reasoning for very complex multi-file code architectures.

---

## 5. Verifying the Setup

When you start the Docker container or local server:
```bash
docker compose up backend
```
The application initializes the `@google/genai` client. If the key is valid, the health check at `http://localhost:3001/api/health` will return:
```json
{
  "status": "ok",
  "gemini": "connected",
  "database": "connected"
}
```
