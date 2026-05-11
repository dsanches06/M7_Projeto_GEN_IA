import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ChatUI, PageSection } from "@/components";
import MainLayout from "@/pages/MainLayout";
import { ThemeProvider } from "@/context/ThemeContext";
import * as taskService from "@/services/taskService";
import TrophySpin from "./components/ui/TrophySpin";

const Dashboard   = lazy(() => import("@/pages/Dashboard").then((m) => ({ default: m.Dashboard })));
const UsersPage   = lazy(() => import("@/components/users/UsersPage"));
const TicketsPage = lazy(() => import("@/pages/TicketsPage"));

function AppContent() {
  const navigate = useNavigate();
  const [showChat,      setShowChat]      = useState(false);
  const [tasks,         setTasks]         = useState([]);
  const [tasksLoading,  setTasksLoading]  = useState(true);
  const [tasksError,    setTasksError]    = useState(null);
  const [redirectState, setRedirectState] = useState({ active: false, path: "", message: "" });

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
      } else {
        const t = await taskService.createTask(taskData);
        setTasks((prev) => [taskService.transformTaskForDisplay(t), ...prev]);
      }
      startRedirect("/dashboard", "");
    } catch (err) {
    }
  };

  const handleTaskUpdated = (updatedTask) => {
    if (!updatedTask?.id) return;
    const transformed = taskService.transformTaskForDisplay(updatedTask);
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? { ...t, ...transformed } : t))
    );
  };

  const handleTicketCreated = () => {
    startRedirect("/tickets", "Ticket criado! Aguardando carregamento antes de ir para tickets...");
  };

  return (
    <>
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

      {/*
        Floating ChatBot button
        Desktop: bottom-right above nothing
        Mobile:  bottom-right but above the bottom nav (bottom-[80px])
      */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed right-4 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white flex items-center justify-center shadow-2xl transition-all active:scale-95"
          style={{
            bottom: "calc(64px + 12px)", // above bottom nav on mobile
          }}
          aria-label="Abrir ChatBot"
        >
          <span className="text-lg sm:text-xl">🤖</span>
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
