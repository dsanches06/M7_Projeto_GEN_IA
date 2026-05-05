import { BaseEntity } from "../models/index.js";
/* Representação de um anexo */
export default class Attachment extends BaseEntity {
    constructor(id, taskId, fileName, size, url) {
        super(id);
        this.taskId = taskId;
        this.fileName = fileName;
        this.size = size;
        this.url = url;
    }
    getId() {
        return super.getId();
    }
    getTaskId() {
        return this.taskId;
    }
    getCreatedAt() {
        return super.getCreatedAt();
    }
    getFileName() {
        return this.fileName;
    }
    getSize() {
        return this.size;
    }
    getUrl() {
        return this.url;
    }
}
