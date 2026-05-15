import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ChatUI, PageSection } from "@/components";
import MainLayout from "@/pages/MainLayout";
import { ThemeProvider } from "@/context/ThemeContext";
import * as taskService from "@/services/taskService";
import TrophySpin from "./components/ui/TrophySpin";

const Dashboard   = lazy(() => import("@/pages/Dashboard").then((m) => ({ default: m.Dashboard })));
const UsersPage   = lazy(() => import("@/pages/UsersPage"));
const TicketsPage = lazy(() => import("@/pages/TicketsPage"));

function AppContent() {
  const navigate = useNavigate();
  const [showChat,              setShowChat]              = useState(false);
  const [tasks,                 setTasks]                 = useState([]);
  const [tasksLoading,          setTasksLoading]          = useState(true);
  const [tasksError,            setTasksError]            = useState(null);
  const [ticketRefreshKey,      setTicketRefreshKey]      = useState(0);
  const [viewingUserId,         setViewingUserId]         = useState(null);
  const [userDashRefreshKey,    setUserDashRefreshKey]    = useState(0);
  const [openUserId,            setOpenUserId]            = useState(null);

  const loadTasks = async () => {
    try {
      setTasksLoading(true);
      setTasksError(null);
      const data = await taskService.fetchTasks();
      setTasks(data);
    } catch (err) {
      setTasksError(err?.message || "Erro ao carregar tarefas");
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => { loadTasks(); }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  /** Task created via ChatBot → add to list + navigate to dashboard (chat stays open) */
  const handleTaskCreated = async (taskData) => {
    try {
      if (taskData.id) {
        setTasks((prev) => [taskService.transformTaskForDisplay(taskData), ...prev]);
      } else {
        const t = await taskService.createTask(taskData);
        setTasks((prev) => [taskService.transformTaskForDisplay(t), ...prev]);
      }
      navigate("/dashboard"); // navigate without closing chat
    } catch (err) {
      console.error("[App] handleTaskCreated:", err?.message);
    }
  };

  /** Task status/fields updated via ChatBot */
  const handleTaskUpdated = (updatedTask) => {
    if (!updatedTask?.id) return;
    const transformed = taskService.transformTaskForDisplay(updatedTask);
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? { ...t, ...transformed } : t))
    );

    const previousTask = tasks.find((t) => t.id === updatedTask.id);
    const statusChanged =
      previousTask &&
      updatedTask.status_id != null &&
      Number(updatedTask.status_id) !== Number(previousTask.status_id);

    const assignedTo = Number(
      updatedTask.assigned_to ?? updatedTask.user_id ?? updatedTask.assignee_id,
    );

    if (statusChanged && assignedTo) {
      setOpenUserId(assignedTo);
      setUserDashRefreshKey((prev) => prev + 1);
      navigate("/utilizadores");
      return;
    }

    if (viewingUserId && assignedTo === viewingUserId) {
      setUserDashRefreshKey((prev) => prev + 1);
      return;
    }

    navigate("/dashboard"); // navigate without closing chat
  };

  /** Task deleted via ChatBot */
  const handleTaskDeleted = (deletedTaskId) => {
    if (!deletedTaskId) return;
    setTasks((prev) => prev.filter((t) => t.id !== Number(deletedTaskId)));
    navigate("/dashboard"); // navigate without closing chat
  };

  /** Task assigned or modified via ChatBot */
  const handleTaskAssigned = (taskData) => {
    const taskId = Number(taskData?.id ?? taskData?.task_id);
    if (!taskId) return;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              assigneeName: taskData.user_name || t.assigneeName,
              status: "atribuída",
              statusName: "ASSIGNED",
            }
          : t,
      ),
    );

    const assignedTo = Number(
      taskData?.assigned_to ?? taskData?.user_id ?? taskData?.assignee_id,
    );

    if (viewingUserId && assignedTo === viewingUserId) {
      setUserDashRefreshKey((prev) => prev + 1);
      return;
    }

    navigate("/dashboard"); // navigate without closing chat
  };

  /** Ticket created via ChatBot → navigate to tickets (chat stays open) */
  const handleTicketCreated = (ticketData) => {
    setTicketRefreshKey((prev) => prev + 1);
    navigate("/tickets");
  };

  /** Ticket updated/deleted via ChatBot → navigate to tickets (chat stays open) */
  const handleTicketUpdated = (ticketData) => {
    setTicketRefreshKey((prev) => prev + 1);
    navigate("/tickets");
  };

  /** Task tagged via ChatBot → reload tasks and update dashboard */
  const handleTaskTagged = async (taskId) => {
    if (!taskId) return;
    await loadTasks();
    navigate("/dashboard");
  };

  /** Notification sent via ChatBot → can stay on current page or notify */
  const handleNotificationCreated = () => {
    // Notifications don't require navigation, just showing feedback in chat
  };

  /** User/Tag action via ChatBot → navigate to user page */
  const handleUserOrTagAction = () => {
    navigate("/utilizadores");
  };

  return (
    <>
      <Suspense fallback={<TrophySpin message="Carregando a página..." />}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <Dashboard
                  tasks={tasks}
                  onTasksUpdate={setTasks}
                  tasksLoading={tasksLoading}
                  tasksError={tasksError}
                  onRetryLoadTasks={loadTasks}
                />
              }
            />
            <Route
              path="projetos"
              element={<PageSection title="Projetos" description="Gerencie seus projetos e mantenha o trabalho organizado." />}
            />
            <Route path="utilizadores" element={<UsersPage refreshKey={userDashRefreshKey} openUserId={openUserId} onUserViewing={setViewingUserId} />} />
            <Route path="tickets"      element={<TicketsPage refreshKey={ticketRefreshKey} />} />
            <Route
              path="*"
              element={<PageSection title="Página não encontrada" description="Use o menu para voltar ao dashboard." />}
            />
          </Route>
        </Routes>
      </Suspense>

      {/* Floating ChatBot button */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed right-4 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white flex items-center justify-center shadow-2xl transition-all active:scale-95"
          style={{ bottom: "calc(64px + 12px)" }}
          aria-label="Abrir ChatBot"
        >
          <span className="text-lg sm:text-xl">🤖</span>
        </button>
      )}

      {/* ChatBot — persists across page navigation because it lives outside <Routes> */}
      <ChatUI
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        onTaskCreated={handleTaskCreated}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
        onTaskAssigned={handleTaskAssigned}
        onTaskTagged={handleTaskTagged}
        onTicketCreated={handleTicketCreated}
        onTicketUpdated={handleTicketUpdated}
        onNotificationCreated={handleNotificationCreated}
        onUserOrTagAction={handleUserOrTagAction}
      />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter
        future={{
          v7_startTransition:   true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
