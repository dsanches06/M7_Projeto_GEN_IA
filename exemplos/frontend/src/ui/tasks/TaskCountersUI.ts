import { ITask } from "../../tasks/index.js";
import { TaskService } from "../../services/index.js";
import { TaskStatsDTORequest } from "../../api/dto/index.js";

export async function showTasksCounters(
  type?: string,
  tasks?: ITask[],
): Promise<void> {
  if (
    (type === "tarefas" || type === "pendentes" || type === "concluídas" || type === "filtradas") &&
    tasks
  ) {
    // Contar tarefas pendentes e concluídas no array fornecido
    const pendingCount = tasks.filter((t) => !t.getCompleted()).length;
    const completedCount = tasks.filter((t) => t.getCompleted()).length;

    // Sempre mostrar o total de tarefas do array
    await countAllTasks("#allTasksCounter", tasks.length);
    await countPendingTasks("#pendingTasksCounter", pendingCount);
    await countCompletedTasks("#completedTaskCounter", completedCount);

    // Mostrar o filtro se não for "tarefas" (que é o estado padrão)
    if (type !== "tarefas") {
      countFilterTasks("#filterTasksCounter", type!, tasks.length);
    } else {
      countFilterTasks("#filterTasksCounter", "");
    }
  } else {
    await countAllTasks("#allTasksCounter");
    await countPendingTasks("#pendingTasksCounter");
    await countCompletedTasks("#completedTaskCounter");
    countFilterTasks("#filterTasksCounter", type!);
  }
}

/* Contador de tarefas pendentes */
async function countPendingTasks(
  id: string,
  overrideValue?: number,
): Promise<void> {
  const section = document.querySelector(`${id}`) as HTMLElement;
  if (overrideValue !== undefined) {
    if (section) {
      section.textContent = `${overrideValue}`;
    }
    return;
  }
  const stats: TaskStatsDTORequest = (await TaskService.getTaskStats())!;
  if (section) {
    section.textContent = `${stats.pendingTasks}`;
  } else {
    console.warn(`Elemento ${id} não foi encontrado no DOM.`);
  }
}

/* Contador de tarefas concluídas */
async function countCompletedTasks(
  id: string,
  overrideValue?: number,
): Promise<void> {
  const section = document.querySelector(`${id}`) as HTMLElement;
  if (overrideValue !== undefined) {
    if (section) {
      section.textContent = `${overrideValue}`;
    }
    return;
  }
  const stats: TaskStatsDTORequest = (await TaskService.getTaskStats())!;
  if (section) {
    section.textContent = `${stats.completedTasks}`;
  } else {
    console.warn(`Elemento ${id} não foi encontrado no DOM.`);
  }
}

/* Contador de tarefas filtradas */
function countFilterTasks(
  id: string,
  type: string,
  count?: number,
): void {
  const section = document.querySelector(`${id}`) as HTMLElement;
  if (section) {
    if (count !== undefined) {
      section.textContent = `${count}`;
    } else if (type === "filtradas" && section.textContent !== "") {
      section.textContent = `${0}`;
    } else {
      section.textContent = "0";
    }
  } else {
    console.warn(`Elemento ${id} não foi encontrado no DOM.`);
  }
}

/* Contador de todas as tarefas */
async function countAllTasks(
  id: string,
  overrideValue?: number,
): Promise<void> {
  const section = document.querySelector(`${id}`) as HTMLElement;
  if (overrideValue !== undefined) {
    if (section) {
      section.textContent = `${overrideValue}`;
    }
    return;
  }
  const stats: TaskStatsDTORequest = (await TaskService.getTaskStats())!;
  if (section) {
    section.textContent = `${stats.totalTasks}`;
  } else {
    console.warn(`Elemento ${id} não foi encontrado no DOM.`);
  }
}
