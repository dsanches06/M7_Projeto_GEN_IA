import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, ChatUI, PageSection } from "@/components";
import MainLayout from "@/components/MainLayout";
import { ThemeProvider } from "@/context/ThemeContext";

function App() {
  const [showChat, setShowChat] = useState(false);
  const [tasks, setTasks] = useState([]);

  const handleTaskCreated = (taskData) => {
    const newTask = {
      id: Date.now(),
      title: taskData.task || taskData.title || "Nova Tarefa",
      description: taskData.description || "",
      status: "a fazer",
      priority:
        taskData.priority?.toLowerCase() === "urgente"
          ? "alta"
          : taskData.priority?.toLowerCase() === "high"
            ? "alta"
            : taskData.priority?.toLowerCase() === "medium"
              ? "média"
              : "média",
      assignee: taskData.assignee || "Não atribuído",
      dueDate: taskData.dueDate || new Date().toISOString().split("T")[0],
    };

    setTasks((prev) => [newTask, ...prev]);
    console.log("✅ Nova tarefa criada:", newTask);
  };

  return (
    <ThemeProvider>
      <BrowserRouter>
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
              path="equipas"
              element={
                <PageSection
                  title="Equipas"
                  description="Veja sua equipe, membros e colaborações."
                />
              }
            />
            <Route
              path="sprints"
              element={
                <PageSection
                  title="Sprints"
                  description="Acompanhe sprints e ciclos de trabalho."
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
              path="tags"
              element={
                <PageSection
                  title="Tags"
                  description="Organize tarefas com tags e filtros."
                />
              }
            />
            <Route
              path="tarefas"
              element={
                <PageSection
                  title="Tarefas"
                  description="Visualize e gerencie todas as tarefas."
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
