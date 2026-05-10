import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Dashboard, ChatUI, PageSection } from "@/components";
import MainLayout from "@/components/MainLayout";
import { ThemeProvider } from "@/context/ThemeContext";
import * as taskService from "@/services/taskService";
import { InfoBanner } from "./components/ui/InfoBanner";
import UsersPage from "@/components/users/UsersPage";
import TicketsPage from "@/pages/TicketsPage";

// ── Inner app: inside BrowserRouter so useNavigate works ────────────────────
function AppContent() {
  const navigate = useNavigate();
  const [showChat,  setShowChat]  = useState(false);
  const [tasks,     setTasks]     = useState([]);
  const [banner,    setBanner]    = useState(null);

  useEffect(() => {
    taskService.fetchTasks()
      .then(setTasks)
      .catch(() => setBanner({ message: "Erro ao carregar tarefas", type: "error" }));
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleTaskCreated = async (taskData) => {
    try {
      if (taskData.id) {
        const t = taskService.transformTaskForDisplay(taskData);
        setTasks(prev => [t, ...prev]);
        setBanner({ message: "✅ Tarefa criada com sucesso!", type: "success" });
      } else {
        const t = await taskService.createTask(taskData);
        setTasks(prev => [t, ...prev]);
        setBanner({ message: "✅ Tarefa criada no backend!", type: "success" });
      }
    } catch (err) {
      setBanner({ message: `Erro ao criar tarefa: ${err.message}`, type: "error" });
    }
  };

  /**
   * Called by ChatUI when the bot successfully creates a ticket.
   * Closes the chat panel and navigates to /tickets.
   */
  const handleTicketCreated = () => {
    setShowChat(false);
    navigate("/tickets");
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route
            path="dashboard"
            element={<Dashboard tasks={tasks} onTasksUpdate={setTasks} />}
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
        onTicketCreated={handleTicketCreated}
      />
    </>
  );
}

// ── Root app ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <ThemeProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
