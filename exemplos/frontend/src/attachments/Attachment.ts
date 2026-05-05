import { BaseEntity } from "../models/index.js";

/* Representação de um anexo */
export default class Attachment extends BaseEntity {
  private taskId: number;
  private fileName: string;
  private size: number;
  private url: string;

  constructor(
    id: number,
    taskId: number,
    fileName: string,
    size: number,
    url: string,
  ) {
    super(id);
    this.taskId = taskId;
    this.fileName = fileName;
    this.size = size;
    this.url = url;
  }

  getId(): number {
    return super.getId();
  }
  getTaskId(): number {
    return this.taskId;
  }

  getCreatedAt(): Date {
    return super.getCreatedAt();
  }

  getFileName(): string {
    return this.fileName;
  }
  getSize(): number {
    return this.size;
  }
  getUrl(): string {
    return this.url;
  }
}
