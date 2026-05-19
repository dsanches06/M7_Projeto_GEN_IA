import { BaseChatProcessor } from "../models/BaseChatProcessor.js";
import { taskService, tagTaskService, taskAssigneesService } from "../services/index.js";

import {
  ALL_FUNCTION_DECLARATIONS,
  // Tasks
  setCreateTaskValues,
  setAssignTaskValues,
  setTagTaskValues,
  setPatchStatusTaskValues,
  setDeleteTaskValues,
  setUpdateTaskValues,
  // Notifications
  setCreateNotificationValues,
  // Tickets
  setCreateTicketValues,
  setDeleteTicketValues,
  setPatchStatusTicketValues,
  setUpdateTicketValues,
  // Users
  getUserByName,
} from "../functions/index.js";

// Persists the task immediately so the model gets the real DB task_id.
const createTaskAndPersist = async (args) => {
  const mapped = await setCreateTaskValues(args);
  const task = await taskService.createTask(mapped);
  return { ...mapped, id: task.id, task_id: task.id };
};

// Persists tags immediately so they survive a Vercel function timeout.
const createTagsAndPersist = async (args) => {
  const mapped = await setTagTaskValues(args);
  if (mapped.task_id > 0 && Array.isArray(mapped.tag_ids) && mapped.tag_ids.length > 0) {
    try {
      await tagTaskService.createTagTasks(mapped);
      return { ...mapped, _persisted: true };
    } catch (e) {
      console.warn("[agentic] tags:", e.message);
    }
  }
  return mapped;
};

// Persists the assignment immediately so it survives a Vercel function timeout.
const assignAndPersist = async (args) => {
  const mapped = await setAssignTaskValues(args);
  if (mapped.task_id > 0 && mapped.user_id > 0) {
    try {
      await taskAssigneesService.createTaskAssignee(mapped);
      return { ...mapped, _persisted: true };
    } catch (e) {
      if (e.message?.includes("já está atribuída")) {
        return { ...mapped, _persisted: true };
      }
      console.warn("[agentic] assign:", e.message);
    }
  }
  return mapped;
};

class ChatProcessor extends BaseChatProcessor {
  constructor() {
    super({
      toolConfig: ALL_FUNCTION_DECLARATIONS,
      functionHandlers: {
        set_create_task_values: createTaskAndPersist,
        set_assign_task_values: assignAndPersist,
        set_tag_task_values: createTagsAndPersist,
        set_patch_status_task_values: setPatchStatusTaskValues,
        set_delete_task_values: setDeleteTaskValues,
        set_update_task_values: setUpdateTaskValues,
        set_create_notification_values: setCreateNotificationValues,
        set_create_ticket_values: setCreateTicketValues,
        set_delete_ticket_values: setDeleteTicketValues,
        set_patch_status_ticket_values: setPatchStatusTicketValues,
        set_update_ticket_values: setUpdateTicketValues,
        get_user_by_name: getUserByName,
      },
    });
  }
}

const chatProcessor = new ChatProcessor();

export const processChatMessage =
  chatProcessor.processChatMessage.bind(chatProcessor);
export const processChatMessageStream =
  chatProcessor.processChatMessageStream.bind(chatProcessor);
