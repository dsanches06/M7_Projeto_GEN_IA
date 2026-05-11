import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  categoryRoutes,
  chatRoutes,
  conversationRoutes,
  favoriteTaskRoutes,
  mentionRoutes,
  notificationRoutes,
  priorityRoutes,
  projectPermissionRoutes,
  projectRoutes,
  projectStatusRoutes,
  reminderRoutes,
  roleRoutes,
  sprintRoutes,
  statisticsRoutes,
  summaryRoutes,
  tagRoutes,
  tagTaskRoutes,
  taskAssigneesRoutes,
  taskAttachmentRoutes,
  taskDependencyRoutes,
  taskRoutes,
  taskStatusHistoryRoutes,
  taskStatusRoutes,
  taskTypesRoutes,
  taskVoteRoutes,
  teamMembersRoleRoutes,
  teamRoutes,
  ticketRoutes,
  timeLogRoutes,
  userRoutes,
} from "./routes/index.js";
import { chatBotController } from "./controllers/index.js";
import { loggerMiddleware } from "./middlewares/index.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

/* Endpoint Geral */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: `ClickUp API is running in ${process.env.NODE_ENV || 3001}  `,
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 3001,
  });
});

const apiRouter = express.Router();

apiRouter.use("/chat", chatRoutes);
apiRouter.use("/projects", projectRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/tasks", taskRoutes);
apiRouter.use("/tags", tagRoutes);
apiRouter.use("/notifications", notificationRoutes);
apiRouter.use("/sprints", sprintRoutes);
apiRouter.use("/project_status", projectStatusRoutes);
apiRouter.use("/task_status", taskStatusRoutes);
apiRouter.use("/categories", categoryRoutes);
apiRouter.use("/task_types", taskTypesRoutes);
apiRouter.use("/priorities", priorityRoutes);
apiRouter.use("/tags_task", tagTaskRoutes);
apiRouter.use("/task_assignees", taskAssigneesRoutes);
apiRouter.use("/teams", teamRoutes);
apiRouter.use("/team_members_roles", teamMembersRoleRoutes);
apiRouter.use("/roles", roleRoutes);
apiRouter.use("/task_attachments", taskAttachmentRoutes);
apiRouter.use("/task_votes", taskVoteRoutes);
apiRouter.use("/task_status_history", taskStatusHistoryRoutes);
apiRouter.use("/project_permissions", projectPermissionRoutes);
apiRouter.use("/task_dependencies", taskDependencyRoutes);
apiRouter.use("/favorite_tasks", favoriteTaskRoutes);
apiRouter.use("/reminders", reminderRoutes);
apiRouter.use("/mentions", mentionRoutes);
apiRouter.use("/time_logs", timeLogRoutes);
apiRouter.use("/statistics/ranking", statisticsRoutes);
apiRouter.use("/conversations", conversationRoutes);
apiRouter.use("/summaries", summaryRoutes);
apiRouter.use("/tickets", ticketRoutes);

app.use("/api", apiRouter);

export default app;
