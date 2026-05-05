import { BaseEntity } from "./index.js";
import { UserRole } from "../security/UserRole.js";
/* Representação de um utilizador */
export class UserClass extends BaseEntity {
    constructor(id, name, email, phone, gender, active, role) {
        super(id);
        this.name = name;
        this.email = email;
        this.gender = gender;
        this.phone = phone;
        this.active = active;
        this.role = role || UserRole.MEMBER;
    }
    getName() {
        return this.name;
    }
    isActive() {
        return this.active;
    }
    toggleActive() {
        this.active = !this.active;
    }
    getRole() {
        return this.role;
    }
    getEmail() {
        return this.email;
    }
    getGender() {
        return this.gender;
    }
    getPhone() {
        return this.phone;
    }
    getCreatedAt() {
        return super.getCreatedAt();
    }
}
