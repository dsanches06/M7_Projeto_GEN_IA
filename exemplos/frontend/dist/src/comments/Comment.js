import { BaseEntity } from "../models/index.js";
/* Representação de um comentário */
export default class Comment extends BaseEntity {
    constructor(id, taskId, userId, message) {
        super(id);
        this.taskId = taskId;
        this.userId = userId;
        this.message = message;
    }
    getId() {
        return super.getId();
    }
    getTaskId() {
        return this.taskId;
    }
    getUserId() {
        return this.userId;
    }
    getMessage() {
        return this.message;
    }
    setMessage(newMessage) {
        this.message = newMessage;
    }
    getCreatedAt() {
        return super.getCreatedAt();
    }
}
