import { UserRole } from "../security/UserRole.js";

/* Interface que define o contrato para um utilizador */
export interface IUser {
  getId(): number;
  getName(): string;
  isActive(): boolean;
  toggleActive(): void;
  getRole(): UserRole;
  getEmail(): string;
  getPhone(): number;
  getGender(): string;
  getCreatedAt(): Date;
}
