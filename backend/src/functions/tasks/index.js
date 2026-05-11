// ── Tasks function barrel ─────────────────────────────────────────────────────
export {
  setTaskValuesFunctionDeclaration,
  functionDeclarations as createTaskDeclarations,
  setCreateTaskValues,
} from "./create.js";

export {
  setAssignTaskValuesFunctionDeclaration,
  functionDeclarations as assignTaskDeclarations,
  setAssignTaskValues,
} from "./assign.js";

export {
  setTagTaskValuesFunctionDeclaration,
  functionDeclarations as tagTaskDeclarations,
  setTagTaskValues,
} from "./tags.js";

export {
  setPatchStatusTaskValuesFunctionDeclaration,
  functionDeclarations as patchStatusTaskDeclarations,
  setPatchStatusTaskValues,
} from "./patch_status.js";

export {
  setDeleteTaskValuesFunctionDeclaration,
  functionDeclarations as deleteTaskDeclarations,
  setDeleteTaskValues,
} from "./delete.js";

export {
  setUpdateTaskValuesFunctionDeclaration,
  functionDeclarations as updateTaskDeclarations,
  setUpdateTaskValues,
} from "./update.js";
