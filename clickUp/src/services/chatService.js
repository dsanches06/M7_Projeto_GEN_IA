// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Serviço de Chat com Gemini
export const chatService = {
  // Enviar mensagem e receber resposta em stream
  async sendMessage(message, conversationHistory = []) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory,
          model: 'gemini-3-flash'
        })
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Chat service error:', error);
      throw error;
    }
  },

  // Extrair dados de tarefa da resposta do Gemini
  extractTaskData(geminiResponse) {
    try {
      // Procura por JSON estruturado na resposta
      const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return null;
    } catch (error) {
      console.error('Error extracting task data:', error);
      return null;
    }
  },

  // Criar tarefa via API
  async createTask(taskData) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        throw new Error(`Create task error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Create task error:', error);
      throw error;
    }
  },

  // Atualizar tarefa
  async updateTask(taskId, taskData) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        throw new Error(`Update task error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Update task error:', error);
      throw error;
    }
  },

  // Listar tarefas
  async getTasks(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`${API_BASE_URL}/tasks?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Get tasks error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Get tasks error:', error);
      throw error;
    }
  }
};
