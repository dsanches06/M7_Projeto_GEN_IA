import { BaseChatProcessor } from "../models/chat/BaseChatProcessor.js";

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
  // Summaries
  setCreateSummaryValues,
} from "../functions/index.js";

class ChatProcessor extends BaseChatProcessor {
  constructor() {
    super({
      toolConfig: ALL_FUNCTION_DECLARATIONS,
      functionHandlers: {
        set_create_task_values: setCreateTaskValues,
        set_assign_task_values: setAssignTaskValues,
        set_tag_task_values: setTagTaskValues,
        set_patch_status_task_values: setPatchStatusTaskValues,
        set_delete_task_values: setDeleteTaskValues,
        set_update_task_values: setUpdateTaskValues,
        set_create_notification_values: setCreateNotificationValues,
        set_create_ticket_values: setCreateTicketValues,
        set_delete_ticket_values: setDeleteTicketValues,
        set_patch_status_ticket_values: setPatchStatusTicketValues,
        set_update_ticket_values: setUpdateTicketValues,
        set_create_summary_values: setCreateSummaryValues
      },
    });
  }
}

const chatProcessor = new ChatProcessor();

export const processChatMessage =
  chatProcessor.processChatMessage.bind(chatProcessor);
export const processChatMessageStream =
  chatProcessor.processChatMessageStream.bind(chatProcessor);
