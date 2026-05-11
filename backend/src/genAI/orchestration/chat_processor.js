import { BaseChatProcessor } from "../../models/chat/BaseChatProcessor.js";

// Tasks
import { functionDeclarations as taskDeclarations,       setCreateTaskValues    } from "../../functions/tasks/create_task.js";
import { functionDeclarations as assignDeclarations,     setAssignTaskValues    } from "../../functions/tasks/assign_task.js";
import { functionDeclarations as tagTaskDeclarations,    setTagTaskValues       } from "../../functions/tasks/tag_task.js";
import { functionDeclarations as patchStatusDeclarations,setPatchStatusTaskValues} from "../../functions/tasks/patch_status_task.js";
import { functionDeclarations as deleteTaskDeclarations, setDeleteTaskValues    } from "../../functions/tasks/delete_task.js";
import { functionDeclarations as updateTaskDeclarations, setUpdateTaskValues    } from "../../functions/tasks/update_task.js";

// Notifications
import { functionDeclarations as notificationDeclarations, setCreateNotificationValues } from "../../functions/notifications/create_notification.js";

// Tickets
import { functionDeclarations as ticketDeclarations,           setCreateTicketValues       } from "../../functions/tickets/create_ticket.js";
import { functionDeclarations as deleteTicketDeclarations,     setDeleteTicketValues       } from "../../functions/tickets/delete_ticket.js";
import { functionDeclarations as patchStatusTicketDeclarations,setPatchStatusTicketValues  } from "../../functions/tickets/patch_status_ticket.js";
import { functionDeclarations as updateTicketDeclarations,     setUpdateTicketValues       } from "../../functions/tickets/update_ticket.js";

/**
 * UnifiedChatProcessor — registers ALL available functions so the model
 * can call any combination of them in the same turn (parallel function calling).
 */
class ChatProcessor extends BaseChatProcessor {
  constructor() {
    super({
      toolConfig: [
        ...taskDeclarations,
        ...assignDeclarations,
        ...tagTaskDeclarations,
        ...patchStatusDeclarations,
        ...deleteTaskDeclarations,
        ...updateTaskDeclarations,
        ...notificationDeclarations,
        ...ticketDeclarations,
        ...deleteTicketDeclarations,
        ...patchStatusTicketDeclarations,
        ...updateTicketDeclarations,
      ],
      functionHandlers: {
        // Tasks
        set_create_task_values:         setCreateTaskValues,
        set_assign_task_values:         setAssignTaskValues,
        set_tag_task_values:            setTagTaskValues,
        set_patch_status_task_values:   setPatchStatusTaskValues,
        set_delete_task_values:         setDeleteTaskValues,
        set_update_task_values:         setUpdateTaskValues,
        // Notifications
        set_create_notification_values: setCreateNotificationValues,
        // Tickets
        set_create_ticket_values:       setCreateTicketValues,
        set_delete_ticket_values:       setDeleteTicketValues,
        set_patch_status_ticket_values: setPatchStatusTicketValues,
        set_update_ticket_values:       setUpdateTicketValues,
      },
    });
  }
}

const chatProcessor = new ChatProcessor();

export const processChatMessage       = chatProcessor.processChatMessage.bind(chatProcessor);
export const processChatMessageStream = chatProcessor.processChatMessageStream.bind(chatProcessor);
