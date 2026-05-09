import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import projectRoutes from "./src/routes/projectRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";
import tagRoutes from "./src/routes/tagRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import sprintRoutes from "./src/routes/sprintRoutes.js";
import projectStatusRoutes from "./src/routes/projectStatusRoutes.js";
import taskStatusRoutes from "./src/routes/taskStatusRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import taskTypesRoutes from "./src/routes/taskTypesRoutes.js";
import priorityRoutes from "./src/routes/priorityRoutes.js";
import tagTaskRoutes from "./src/routes/tagTaskRoutes.js";
import taskAssigneesRoutes from "./src/routes/taskAssigneesRoutes.js";
import teamRoutes from "./src/routes/teamRoutes.js";
import teamMembersRoleRoutes from "./src/routes/teamMembersRoleRoutes.js";
import taskAttachmentRoutes from "./src/routes/taskAttachmentRoutes.js";
import taskVoteRoutes from "./src/routes/taskVoteRoutes.js";
import taskStatusHistoryRoutes from "./src/routes/taskStatusHistoryRoutes.js";
import projectPermissionRoutes from "./src/routes/projectPermissionRoutes.js";
import taskDependencyRoutes from "./src/routes/taskDependencyRoutes.js";
import favoriteTaskRoutes from "./src/routes/favoriteTaskRoutes.js";
import reminderRoutes from "./src/routes/reminderRoutes.js";
import mentionRoutes from "./src/routes/mentionRoutes.js";
import timeLogRoutes from "./src/routes/timeLogRoutes.js";
import statisticsRoutes from "./src/routes/statisticsRoutes.js";
import conversationRoutes from "./src/routes/conversationRoutes.js";
import summaryRoutes from "./src/routes/summaryRoutes.js";
import ticketRoutes from "./src/routes/ticketRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";
import * as chatBotController from "./src/controllers/chatBotController.js";
import logger from "./src/middlewares/loggerMiddleware.js";

const app = express();

dotenv.config();

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(logger);

/* Endpoint Geral */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: `ClickUp API is running in ${process.env.NODE_ENV || 3001}  `,
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 3001,
  });
});

// Rotas
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


//rota para deploy no vercel
app.use("/api", apiRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
