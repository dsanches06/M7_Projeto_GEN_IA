import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, ChatUI, PageSection } from "@/components";
import MainLayout from "@/components/MainLayout";
import { ThemeProvider } from "@/context/ThemeContext";
import * as taskService from "@/services/taskService";
import { InfoBanner } from "./components/ui/InfoBanner";

function App() {
  const [showChat, setShowChat] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await taskService.fetchTasks();
        setTasks(data);
      } catch (error) {
        console.error(error);
        setBanner({
          message: "Erro ao carregar tarefas: ",
          type: "error",
        });
      }
    };

    loadTasks();
  }, []);

  const handleTaskCreated = async (taskData) => {
    try {
      // Se já é um objeto completo com ID (vindo do backend), adiciona direto
      if (taskData.id) {
        const transformedTask = taskService.transformTaskForDisplay(taskData);
        setTasks((prev) => [transformedTask, ...prev]);
        setBanner({
          message: "✅ Nova tarefa criada com sucesso!",
          type: "success",
        });
        console.log("✅ Nova tarefa adicionada ao dashboard:", transformedTask);
      } else {
        // Se é dados parciais, cria no backend (compatibilidade)
        const createdTask = await taskService.createTask(taskData);
        setTasks((prev) => [createdTask, ...prev]);
        setBanner({
          message: "✅ Nova tarefa criada no backend!",
          type: "success",
        });
        console.log("✅ Nova tarefa criada no backend:", createdTask);
      }
    } catch (error) {
      console.error("Erro criando tarefa no backend:", error);
      setBanner({
        message: `Erro ao criar tarefa: ${error.message}`,
        type: "error",
      });
    }
  };

  return (
    <ThemeProvider>
      {/* Configuração das Future Flags para evitar avisos da v7 */}
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route
              path="dashboard"
              element={<Dashboard tasks={tasks} onTasksUpdate={setTasks} />}
            />
            <Route
              path="projetos"
              element={
                <PageSection
                  title="Projetos"
                  description="Gerencie seus projetos e mantenha o trabalho organizado."
                />
              }
            />

            <Route
              path="utilizadores"
              element={
                <PageSection
                  title="Utilizadores"
                  description="Administre usuários e permissões."
                />
              }
            />
              <Route
              path="tickets"
              element={
                <PageSection
                  title="Tickets"
                  description="Gerencie seus tickets de suporte."
                />
              }
            />
            <Route
              path="*"
              element={
                <PageSection
                  title="Página não encontrada"
                  description="Use o menu para voltar ao dashboard."
                />
              }
            />
          </Route>
        </Routes>

        {/* Botão flutuante do ChatBot */}
        {!showChat && (
          <button
            onClick={() => setShowChat(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text)] flex items-center justify-center shadow-2xl transition-all"
            aria-label="Abrir ChatBot"
          >
            <span className="text-xl">🤖</span>
          </button>
        )}

        {/* ChatBot Modal */}
        <ChatUI
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          onTaskCreated={handleTaskCreated}
        />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
