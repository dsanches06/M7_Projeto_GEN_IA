// ── Tasks function barrel ─────────────────────────────────────────────────────
export {
  setTaskValuesFunctionDeclaration,
  functionDeclarations as createTaskDeclarations,
  setCreateTaskValues,
} from "./create_task.js";

export {
  setAssignTaskValuesFunctionDeclaration,
  functionDeclarations as assignTaskDeclarations,
  setAssignTaskValues,
} from "./assign_task.js";

export {
  setTagTaskValuesFunctionDeclaration,
  functionDeclarations as tagTaskDeclarations,
  setTagTaskValues,
} from "./tag_task.js";

export {
  setPatchStatusTaskValuesFunctionDeclaration,
  functionDeclarations as patchStatusTaskDeclarations,
  setPatchStatusTaskValues,
} from "./patch_status_task.js";

export {
  setDeleteTaskValuesFunctionDeclaration,
  functionDeclarations as deleteTaskDeclarations,
  setDeleteTaskValues,
} from "./delete_task.js";

export {
  setUpdateTaskValuesFunctionDeclaration,
  functionDeclarations as updateTaskDeclarations,
  setUpdateTaskValues,
} from "./update_task.js";
