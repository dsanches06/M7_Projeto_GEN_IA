import { useState } from 'react';
import { Header, Dashboard, ChatUI } from "@/components";
import { ThemeProvider } from "@/context/ThemeContext";

function App() {
  const [showChat, setShowChat] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleTaskCreated = (taskData) => {
    const newTask = {
      id: Date.now(),
      title: taskData.task || taskData.title || 'Nova Tarefa',
      description: taskData.description || '',
      status: 'a fazer',
      priority: taskData.priority?.toLowerCase() === 'urgente' ? 'alta' :
               taskData.priority?.toLowerCase() === 'high' ? 'alta' :
               taskData.priority?.toLowerCase() === 'medium' ? 'média' : 'média',
      assignee: taskData.assignee || 'Não atribuído',
      dueDate: taskData.dueDate || new Date().toISOString().split('T')[0]
    };

    setTasks(prev => [newTask, ...prev]);
    console.log('✅ Nova tarefa criada:', newTask);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#0d0d0d] flex flex-col">
        <Header
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onChatOpen={() => setShowChat(true)}
        />
        
        {/* Main Content - Sem Sidebar */}
        <div className="flex-1 overflow-hidden">
          {currentPage === 'dashboard' && <Dashboard tasks={tasks} onTasksUpdate={setTasks} />}
          {/* Outras páginas virão aqui */}
        </div>

        {/* ChatBot Modal */}
        <ChatUI 
          isOpen={showChat} 
          onClose={() => setShowChat(false)}
          onTaskCreated={handleTaskCreated}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
