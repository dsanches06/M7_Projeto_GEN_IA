import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ChatUI, PageSection } from "@/components";
import MainLayout from "@/pages/MainLayout";
import { ThemeProvider } from "@/context/ThemeContext";
import * as taskService from "@/services/taskService";
import { InfoBanner } from "./components/ui/InfoBanner";
import TrophySpin from "./components/ui/TrophySpin";

const Dashboard  = lazy(() => import("@/pages/Dashboard").then((m) => ({ default: m.Dashboard })));
const UsersPage  = lazy(() => import("@/components/users/UsersPage"));
const TicketsPage = lazy(() => import("@/pages/TicketsPage"));

function AppContent() {
  const navigate = useNavigate();
  const [showChat,      setShowChat]      = useState(false);
  const [tasks,         setTasks]         = useState([]);
  const [tasksLoading,  setTasksLoading]  = useState(true);
  const [tasksError,    setTasksError]    = useState(null);
  const [banner,        setBanner]        = useState(null);
  const [redirectState, setRedirectState] = useState({ active: false, path: "", message: "" });

  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => setBanner(null), 3000);
    return () => clearTimeout(timer);
  }, [banner]);

  useEffect(() => {
    if (!redirectState.active) return;
    const timer = setTimeout(() => {
      navigate(redirectState.path);
      setRedirectState({ active: false, path: "", message: "" });
    }, 3000);
    return () => clearTimeout(timer);
  }, [redirectState, navigate]);

  const startRedirect = (path, message) => {
    setRedirectState({ active: true, path, message });
    setShowChat(false);
  };

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

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleTaskCreated = async (taskData) => {
    try {
      if (taskData.id) {
        const t = taskService.transformTaskForDisplay(taskData);
        setTasks((prev) => [t, ...prev]);
        setBanner({ message: "✅ Tarefa criada com sucesso!", type: "success" });
      } else {
        const t = await taskService.createTask(taskData);
        setTasks((prev) => [taskService.transformTaskForDisplay(t), ...prev]);
        setBanner({ message: "✅ Tarefa criada no backend!", type: "success" });
      }
      startRedirect("/dashboard", "Tarefa criada! Aguardando carregamento antes de ir ao dashboard...");
    } catch (err) {
      setBanner({ message: `Erro ao criar tarefa: ${err.message}`, type: "error" });
    }
  };

  /** Called when bot updates an existing task's status */
  const handleTaskUpdated = (updatedTask) => {
    if (!updatedTask?.id) return;
    const transformed = taskService.transformTaskForDisplay(updatedTask);
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? { ...t, ...transformed } : t))
    );
    const statusLabel = transformed.status || updatedTask.status_name || "novo estado";
    setBanner({
      message: `🔄 Tarefa #${updatedTask.id} movida para "${statusLabel}"`,
      type:    "success",
    });
  };

  /** Closes chat and navigates to tickets page after ticket creation */
  const handleTicketCreated = () => {
    setBanner({ message: "✅ Ticket criado com sucesso!", type: "success" });
    startRedirect("/tickets", "Ticket criado! Aguardando carregamento antes de ir para tickets...");
  };

  return (
    <>
      {tasksError && (
        <div className="mx-auto mb-5 max-w-6xl rounded-3xl border border-red-500/20 bg-red-600/10 p-4 text-red-100 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <strong className="block text-sm font-semibold">Erro ao carregar o dashboard</strong>
              <p className="text-sm text-red-100/90">{tasksError}</p>
            </div>
            <button
              type="button"
              onClick={loadTasks}
              className="inline-flex items-center justify-center rounded-full border border-red-200/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/20"
            >
              Recarregar tarefas
            </button>
          </div>
        </div>
      )}

      {redirectState.active && (
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-950/95 p-6 shadow-2xl backdrop-blur-xl">
            <TrophySpin message={redirectState.message} />
          </div>
        </div>
      )}

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
            <Route path="utilizadores" element={<UsersPage />} />
            <Route path="tickets"      element={<TicketsPage />} />
            <Route
              path="*"
              element={<PageSection title="Página não encontrada" description="Use o menu para voltar ao dashboard." />}
            />
          </Route>
        </Routes>
      </Suspense>

      {/* Banner */}
      {banner && <InfoBanner message={banner.message} type={banner.type} isVisible />}

      {/* Floating ChatBot button */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white flex items-center justify-center shadow-2xl transition-all"
          aria-label="Abrir ChatBot"
        >
          <span className="text-xl">🤖</span>
        </button>
      )}

      {/* ChatBot modal */}
      <ChatUI
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        onTaskCreated={handleTaskCreated}
        onTaskUpdated={handleTaskUpdated}
        onTicketCreated={handleTicketCreated}
      />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter
        future={{
          v7_startTransition:    true,
          v7_relativeSplatPath:  true,
        }}
      >
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
