// ── Functions top-level barrel ───────────────────────────────────────────────
// Import sub-barrels and re-export everything grouped.
// Used by chat_processor.js to register all tools in one import.

export * from "./tasks/index.js";
export * from "./tickets/index.js";
export * from "./notifications/index.js";
export * from "./users/index.js";

// ── Convenience: all function declarations (for toolConfig) ──────────────────
import { createTaskDeclarations }         from "./tasks/index.js";
import { assignTaskDeclarations }         from "./tasks/index.js";
import { tagTaskDeclarations }            from "./tasks/index.js";
import { patchStatusTaskDeclarations }    from "./tasks/index.js";
import { deleteTaskDeclarations }         from "./tasks/index.js";
import { updateTaskDeclarations }         from "./tasks/index.js";
import { createNotificationDeclarations } from "./notifications/index.js";
import { createTicketDeclarations }       from "./tickets/index.js";
import { deleteTicketDeclarations }       from "./tickets/index.js";
import { patchStatusTicketDeclarations }  from "./tickets/index.js";
import { updateTicketDeclarations }       from "./tickets/index.js";
import { getUserDeclarations }            from "./users/index.js";

export const ALL_FUNCTION_DECLARATIONS = [
  ...createTaskDeclarations,
  ...assignTaskDeclarations,
  ...tagTaskDeclarations,
  ...patchStatusTaskDeclarations,
  ...deleteTaskDeclarations,
  ...updateTaskDeclarations,
  ...createNotificationDeclarations,
  ...createTicketDeclarations,
  ...deleteTicketDeclarations,
  ...patchStatusTicketDeclarations,
  ...updateTicketDeclarations,
  ...getUserDeclarations,
];
