import express from "express";
import cors from "cors";
import {
  chatRoutes,
  conversationRoutes,
  notificationRoutes,
  priorityRoutes,
  roleRoutes,
  tagRoutes,
  tagTaskRoutes,
  taskAssigneesRoutes,
  taskRoutes,
  taskStatusRoutes,
  ticketRoutes,
  userRoutes,
} from "./routes/index.js";
import { chatBotController } from "./controllers/index.js";
import { loggerMiddleware } from "./middlewares/index.js";

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
apiRouter.use("/users", userRoutes);
apiRouter.use("/tasks", taskRoutes);
apiRouter.use("/tags", tagRoutes);
apiRouter.use("/notifications", notificationRoutes);
apiRouter.use("/task_status", taskStatusRoutes);
apiRouter.use("/priorities", priorityRoutes);
apiRouter.use("/tags_task", tagTaskRoutes);
apiRouter.use("/task_assignees", taskAssigneesRoutes);
apiRouter.use("/roles", roleRoutes);
apiRouter.use("/tickets", ticketRoutes);
apiRouter.use("/conversations", conversationRoutes);

app.use("/api", apiRouter);

export default app;
