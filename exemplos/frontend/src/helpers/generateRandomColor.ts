import { TaskStatus } from "../tasks/TaskStatus.js";

 export function generateRandomColor(): string {
  return `rgb(${Math.floor(Math.random() * 128)}, ${Math.floor(
    Math.random() * 128,
  )}, ${Math.floor(Math.random() * 128)})`;
}

export function setCardBorderColor(card: HTMLElement, color: string): void {
  card
}

export function getCardBorderColor(status: TaskStatus): string {
  const borderColorMap: { [key in TaskStatus]: string } = {
    [TaskStatus.CREATED]: generateRandomColor(),
    [TaskStatus.ASSIGNED]: generateRandomColor(),
    [TaskStatus.BLOCKED]: generateRandomColor(),
    [TaskStatus.IN_PROGRESS]: generateRandomColor(),
    [TaskStatus.COMPLETED]: generateRandomColor(),
    [TaskStatus.ARCHIVED]: generateRandomColor(),
  };
  return borderColorMap[status] || "#4a90e2";
}
