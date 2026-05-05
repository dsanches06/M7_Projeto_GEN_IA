import { BaseEntity, IUser } from "./index.js";
import { UserRole } from "../security/UserRole.js";

/* Representação de um utilizador */
export class UserClass extends BaseEntity implements IUser {
  private name: string;
  private email: string;
  private phone: number;
  private active: boolean;
  private role?: UserRole;
  private gender: string;

  constructor(
    id: number,
    name: string,
    email: string,
    phone: number,
    gender: string,
    active: boolean,
    role?: UserRole,
  ) {
    super(id);
    this.name = name;
    this.email = email;
    this.gender = gender;
    this.phone = phone;
    this.active = active;
    this.role = role || UserRole.MEMBER;
  }

  getName(): string {
    return this.name;
  }

  isActive(): boolean {
    return this.active;
  }

  toggleActive(): void {
    this.active = !this.active;
  }

  getRole(): UserRole {
    return this.role!;
  }

  getEmail(): string {
    return this.email;
  }

  getGender(): string {
    return this.gender;
  }

  getPhone(): number {
    return this.phone;
  }

  getCreatedAt(): Date {
    return super.getCreatedAt();
  }
}
