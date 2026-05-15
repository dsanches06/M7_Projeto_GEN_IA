// Barrel de funções de tíquetes para o agente de IA
export {
  setTicketValuesFunctionDeclaration,              // Declaração para criar tíquete
  functionDeclarations as createTicketDeclarations,
  setCreateTicketValues,                            // Preenche valores de criação
} from "./create.js";

export {
  setDeleteTicketValuesFunctionDeclaration,        // Declaração para eliminar tíquete
  functionDeclarations as deleteTicketDeclarations,
  setDeleteTicketValues,                            // Preenche valores de eliminação
} from "./delete.js";

export {
  setPatchStatusTicketValuesFunctionDeclaration,   // Declaração para alterar estado do tíquete
  functionDeclarations as patchStatusTicketDeclarations,
  setPatchStatusTicketValues,                       // Preenche valores de estado
} from "./patch_status.js";

export {
  setUpdateTicketValuesFunctionDeclaration,        // Declaração para actualizar tíquete
  functionDeclarations as updateTicketDeclarations,
  setUpdateTicketValues,                            // Preenche valores de actualização
} from "./update.js";
