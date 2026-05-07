// Backend URL for chat endpoints. If VITE_BACKEND_URL is not set, use localhost:3000.
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const chatService = {
  async sendMessageToBotStream(
    message,
    conversationHistory = [],
    onChunk,
    onDone,
    conversationId = null,
  ) {
    try {
      const response = await fetch(`${BACKEND_URL}/chat/message/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory,
          conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let event = null;
      let data = '';
      let donePayload = null;

      const flushEvent = () => {
        if (!event) return;

        if (event === 'message') {
          try {
            const payload = JSON.parse(data);
            if (payload?.text) {
              onChunk(payload.text);
            }
          } catch (e) {
            console.warn('Failed to parse stream message payload', e);
          }
        }

        if (event === 'done') {
          try {
            const payload = JSON.parse(data);
            donePayload = payload;
            if (onDone) onDone(payload);
          } catch (e) {
            console.warn('Failed to parse stream done payload', e);
          }
        }

        if (event === 'error') {
          try {
            const payload = JSON.parse(data);
            throw new Error(payload?.message || 'Erro no stream do chat');
          } catch (e) {
            throw e;
          }
        }

        event = null;
        data = '';
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            event = line.replace('event:', '').trim();
          } else if (line.startsWith('data:')) {
            data += line.replace('data:', '').trim();
          } else if (line.trim() === '') {
            flushEvent();
          }
        }
      }

      if (buffer.trim()) {
        const lines = buffer.split('\n');
        for (const line of lines) {
          if (line.startsWith('event:')) {
            event = line.replace('event:', '').trim();
          } else if (line.startsWith('data:')) {
            data += line.replace('data:', '').trim();
          } else if (line.trim() === '') {
            flushEvent();
          }
        }
        flushEvent();
      }

      return donePayload ?? { success: true };
    } catch (error) {
      console.error('Chat service error:', error);
      throw error;
    }
  },

  async sendMessageToConversation(conversationId, message) {
    try {
      const response = await fetch(
        `${BACKEND_URL}/chat/conversation/${conversationId}/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
        }
      );

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Chat service error:', error);
      throw error;
    }
  },

  async sendMessage(
    message,
    conversationHistory = [],
    onChunk,
    onDone,
    conversationId = null,
  ) {
    return this.sendMessageToBotStream(
      message,
      conversationHistory,
      onChunk,
      onDone,
      conversationId,
    );
  },

  extractTaskDataFromFunctionResult(functionResult) {
    if (!functionResult || !functionResult.result) {
      return null;
    }

    const data = functionResult.result;
    return {
      title: data.title,
      description: data.description,
      type_id: data.types_id,
      status_id: data.status_id,
      priority_id: data.priority_id,
      category_id: data.category_id,
      project_id: data.project_id,
      created_at: data.created_at,
      due_date: data.due_date,
      completed_at: data.completed_at,
      estimated_hours: data.estimated_hours,
    };
  },

  extractTaskData(geminiResponse) {
    if (!geminiResponse) return null;
    if (typeof geminiResponse === 'object') return geminiResponse;

    try {
      const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error extracting task data:', error);
    }

    return null;
  },

  hasFunctionResults(response) {
    return response && response.success && Array.isArray(response.functionResults) && response.functionResults.length > 0;
  },

  getFirstFunctionResult(response) {
    if (this.hasFunctionResults(response)) {
      return response.functionResults[0];
    }
    return null;
  },
};
