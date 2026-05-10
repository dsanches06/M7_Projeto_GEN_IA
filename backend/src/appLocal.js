import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import projectRoutes from "./routes/projectRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import sprintRoutes from "./routes/sprintRoutes.js";
import projectStatusRoutes from "./routes/projectStatusRoutes.js";
import taskStatusRoutes from "./routes/taskStatusRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import taskTypesRoutes from "./routes/taskTypesRoutes.js";
import priorityRoutes from "./routes/priorityRoutes.js";
import tagTaskRoutes from "./routes/tagTaskRoutes.js";
import taskAssigneesRoutes from "./routes/taskAssigneesRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import teamMembersRoleRoutes from "./routes/teamMembersRoleRoutes.js";
import taskAttachmentRoutes from "./routes/taskAttachmentRoutes.js";
import taskVoteRoutes from "./routes/taskVoteRoutes.js";
import taskStatusHistoryRoutes from "./routes/taskStatusHistoryRoutes.js";
import projectPermissionRoutes from "./routes/projectPermissionRoutes.js";
import taskDependencyRoutes from "./routes/taskDependencyRoutes.js";
import favoriteTaskRoutes from "./routes/favoriteTaskRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import mentionRoutes from "./routes/mentionRoutes.js";
import timeLogRoutes from "./routes/timeLogRoutes.js";
import statisticsRoutes from "./routes/statisticsRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import summaryRoutes from "./routes/summaryRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import * as chatBotController from "./controllers/chatBotController.js";
import logger from "./middlewares/loggerMiddleware.js";

dotenv.config();

// Singleton pattern for local app
class AppLocal {
  constructor() {
    if (AppLocal.instance) {
      return AppLocal.instance;
    }

    this.app = null;
    this.db = null;
    AppLocal.instance = this;
  }

  async initializeDatabase() {
    try {
      // Force MySQL for local development (ignore DATABASE_URL)
      this.db = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'clickup_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      // Test connection
      const connection = await this.db.getConnection();
      await connection.query('SELECT 1');
      connection.release();

      console.log('✅ MySQL Local DB Connected');

      // Make db available globally for routes (force MySQL mode)
      global.db = this.db;
      global.isPostgres = false; // Force MySQL mode

      return this.db;
    } catch (error) {
      console.error('❌ MySQL Local DB Connection Failed:', error.message);
      throw error;
    }
  }

  async initializeApp() {
    if (this.app) {
      return this.app;
    }

    // Initialize database first
    await this.initializeDatabase();

    // Force MySQL mode globally
    global.forceMySQL = true;

    this.app = express();

    // Middleware
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(
      cors({
        origin: ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
      })
    );
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    this.app.use(logger);

    // Health check endpoint
    this.app.get("/", (req, res) => {
      res.json({
        status: "OK",
        message: "ClickUp API Local Server is running",
        environment: "LOCAL DEVELOPMENT",
        database: "MySQL",
        timestamp: new Date().toISOString(),
        port: process.env.PORT || 3001,
      });
    });

    // API Routes
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

    this.app.use("/api", apiRouter);

    // Error handling middleware
    this.app.use((err, req, res, next) => {
      console.error('Error:', err);
      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
      });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
      });
    });

    console.log('🚀 ClickUp Local API initialized');
    return this.app;
  }

  getApp() {
    return this.app;
  }

  getDatabase() {
    return this.db;
  }

  async close() {
    if (this.db) {
      await this.db.end();
      console.log('🔌 MySQL Local DB Connection Closed');
    }
    AppLocal.instance = null;
  }
}

// Export singleton instance
const appLocalInstance = new AppLocal();

export default appLocalInstance;

// Convenience function to get initialized app
export const getLocalApp = async () => {
  return await appLocalInstance.initializeApp();
};

// Convenience function to get database
export const getLocalDatabase = () => {
  return appLocalInstance.getDatabase();
};

// Cleanup function
export const closeLocalApp = async () => {
  return await appLocalInstance.close();
};