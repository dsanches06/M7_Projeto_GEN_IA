import { Project } from "../../projects/index.js";
import { Task } from "../../tasks/index.js";
import { TaskCategory } from "../../tasks/TaskCategory.js";
import { TaskStatus } from "../../tasks/TaskStatus.js";
import { UserClass } from "../../models/index.js";
import Notifications from "../../notifications/Notifications.js";
import { getStatus, parseDate } from "../../api/utils/index.js";
import {
  NotificationDTORequest,
  ProjectDTORequest,
  TaskDTORequest,
  UserDTORequest,
} from "./index.js";

/** Converter objeto plano para instância de UserClass */
export function mapToUserClass(data: UserDTORequest): UserClass {
  return new UserClass(
    data.id,
    data.name,
    data.email,
    data.phone,
    data.gender,
    getStatus(data.active),
  );
}

/** Converter objeto plano para instância de Notifications */
export function mapToNotifications(
  data: NotificationDTORequest,
): Notifications {
  return new Notifications(
    data.id,
    data.title,
    data.message,
    data.is_read,
    data.sent_at,
  );
}

/* Função auxiliar para mapear dados da API para instâncias de Project */
export function mapToProject(data: ProjectDTORequest): Project {
  return new Project(
    data.id,
    data.name,
    data.description!,
    data.project_status_id!,
    parseDate(data.start_date),
    parseDate(data.end_date_expected),
  );
}

function mapTaskCategory(categoryId?: number): TaskCategory {
  switch (categoryId) {
    case 1:
      return TaskCategory.WORKED;
    case 2:
      return TaskCategory.PERSONAL;
    case 3:
      return TaskCategory.STUDY;
    default:
      return TaskCategory.WORKED;
  }
}

function mapTaskStatus(statusId?: number): TaskStatus {
  switch (statusId) {
    case 2:
      return TaskStatus.ASSIGNED;
    case 3:
      return TaskStatus.IN_PROGRESS;
    case 4:
      return TaskStatus.BLOCKED;
    case 5:
      return TaskStatus.COMPLETED;
    case 6:
      return TaskStatus.ARCHIVED;
    default:
      return TaskStatus.CREATED;
  }
}

export function mapToTask(data: TaskDTORequest): Task {
  const project = new Project(
    data.project_id,
    `Projeto ${data.project_id}`,
    "",
    data.status_id ?? 0,
    parseDate(data.due_date),
    parseDate(data.due_date),
  );

  const task = new Task(
    data.id,
    data.title,
    data.description,
    mapTaskCategory(data.category_id),
    project,
  );

  task.setStatus(mapTaskStatus(data.status_id));

  if (data.completed_at) {
    task.markCompleted();
    task.setCompletedDate(parseDate(data.completed_at));
  }

  return task;
}
