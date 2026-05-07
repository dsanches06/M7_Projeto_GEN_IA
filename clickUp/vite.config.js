import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/chat": "http://localhost:3001",
      "/tasks": "http://localhost:3001",
      "/projects": "http://localhost:3001",
      "/users": "http://localhost:3001",
      "/tags": "http://localhost:3001",
      "/notifications": "http://localhost:3001",
      "/sprints": "http://localhost:3001",
      "/project_status": "http://localhost:3001",
      "/task_status": "http://localhost:3001",
      "/categories": "http://localhost:3001",
      "/task_types": "http://localhost:3001",
      "/priorities": "http://localhost:3001",
      "/tags_task": "http://localhost:3001",
      "/task_assignees": "http://localhost:3001",
      "/teams": "http://localhost:3001",
      "/team_members_roles": "http://localhost:3001",
      "/task_attachments": "http://localhost:3001",
      "/task_votes": "http://localhost:3001",
      "/task_status_history": "http://localhost:3001",
      "/project_permissions": "http://localhost:3001",
      "/task_dependencies": "http://localhost:3001",
      "/favorite_tasks": "http://localhost:3001",
      "/reminders": "http://localhost:3001",
      "/mentions": "http://localhost:3001",
      "/time_logs": "http://localhost:3001",
      "/statistics": "http://localhost:3001",
      "/conversations": "http://localhost:3001",
      "/meetingsummaries": "http://localhost:3001",
      "/tickets": "http://localhost:3001",
    },
  },
});
