// Barrel de funções de tarefas para o agente de IA
export {
  setTaskValuesFunctionDeclaration,          // Declaração para criar tarefa
  functionDeclarations as createTaskDeclarations,
  setCreateTaskValues,                        // Preenche valores de criação
} from "./create.js";

export {
  setAssignTaskValuesFunctionDeclaration,    // Declaração para atribuir tarefa
  functionDeclarations as assignTaskDeclarations,
  setAssignTaskValues,                        // Preenche valores de atribuição
} from "./assign.js";

export {
  setTagTaskValuesFunctionDeclaration,       // Declaração para etiquetar tarefa
  functionDeclarations as tagTaskDeclarations,
  setTagTaskValues,                           // Preenche valores de etiqueta
} from "./tags.js";

export {
  setPatchStatusTaskValuesFunctionDeclaration, // Declaração para alterar estado
  functionDeclarations as patchStatusTaskDeclarations,
  setPatchStatusTaskValues,                    // Preenche valores de estado
} from "./patch_status.js";

export {
  setDeleteTaskValuesFunctionDeclaration,    // Declaração para eliminar tarefa
  functionDeclarations as deleteTaskDeclarations,
  setDeleteTaskValues,                        // Preenche valores de eliminação
} from "./delete.js";

export {
  setUpdateTaskValuesFunctionDeclaration,    // Declaração para actualizar tarefa
  functionDeclarations as updateTaskDeclarations,
  setUpdateTaskValues,                        // Preenche valores de actualização
} from "./update.js";
