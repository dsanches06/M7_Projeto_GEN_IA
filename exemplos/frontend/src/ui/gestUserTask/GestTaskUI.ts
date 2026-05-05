import { ITask } from "../../tasks/index.js";
import { UserService, TaskService } from "../../services/index.js";
import { clearContainer } from "../dom/index.js";
import { showInfoBanner } from "../../helpers/index.js";
import { loadTasksPage } from "../tasks/index.js";

// array global para armazenar tarefas filtradas
let tasksFiltered: ITask[];

/* Função principal para mostrar as tarefas de todos os utilizadores */
export async function loadAInitialTasks(): Promise<void> {
  // Limpa o container antes de mostrar os utilizadores
  clearContainer("#containerSection");
  // carrega a pagina dinamica de utilizadores
  await loadTasksPage();
}

/* Ordenar tarefas por título obtendo dados da API */
export async function sortTasksByTitle(
  ascending: boolean = true,
): Promise<ITask[]> {
  try {
    const sort = ascending ? "asc" : "desc";
    const sortedTasks = await TaskService.getTasks(sort);
    return sortedTasks || [];
  } catch (error) {
    console.error("Erro ao ordenar tarefas:", error);
    showInfoBanner(
      "Erro ao ordenar tarefas. Por favor, tente novamente.",
      "error-banner",
    );
    return [];
  }
}

/* Procurar tarefas por título obtendo dados da API */
export async function searchTasksByTitle(searchTerm: string): Promise<ITask[]> {
  try {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return await TaskService.getTasks();
    }
    tasksFiltered = await TaskService.getTasks(undefined, searchTerm);
    return tasksFiltered || [];
  } catch (error) {
    console.error("Erro ao procurar tarefas:", error);
    showInfoBanner(
      "Erro ao procurar tarefas. Por favor, tente novamente.",
      "error-banner",
    );
    return [];
  }
}

/* Remover todas as tarefas completadas via API */
export async function removeAllCompletedTask(): Promise<ITask[]> {
  try {
    // Obter todas as tarefas da API
    const allTasks = await TaskService.getTasks();
    if (!allTasks || allTasks.length === 0) {
      showInfoBanner("Não existem tarefas para remover.", "info-banner");
      return [];
    }

    // Separar tarefas completadas e não completadas
    const completedTasks = allTasks.filter((task) => task.getCompleted());
    const pendingTasks = allTasks.filter((task) => !task.getCompleted());

    if (completedTasks.length === 0) {
      showInfoBanner(
        "Não existem tarefas completadas para remover.",
        "info-banner",
      );
      return pendingTasks;
    }

    // Deletar cada tarefa completada via API
    for (const task of completedTasks) {
      try {
        await TaskService.deleteTask(task.getId());
      } catch (error) {
        console.error(`Erro ao deletar tarefa "${task.getTitle()}":`, error);
      }
    }

    const deletedCount = completedTasks.length;
    showInfoBanner(
      `${deletedCount} tarefa(s) completada(s) removida(s) com sucesso.`,
      "success-banner",
    );

    tasksFiltered = pendingTasks;
    return pendingTasks;
  } catch (error) {
    console.error("Erro ao remover tarefas completadas:", error);
    showInfoBanner(
      "Erro ao remover tarefas completadas. Por favor, tente novamente.",
      "error-banner",
    );
    return [];
  }
}
