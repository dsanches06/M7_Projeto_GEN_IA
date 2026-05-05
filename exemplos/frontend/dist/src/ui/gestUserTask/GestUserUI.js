var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { showInfoBanner } from "../../helpers/infoBanner.js";
import { UserService, } from "../../services/index.js";
import { clearContainer } from "../dom/index.js";
import { loadUsersPage } from "../users/index.js";
const ENDPOINT = "users";
/* Função principal para carregar utilizadores iniciais */
export function loadInitialUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //Limpa o container antes de mostrar os utilizadores
            clearContainer("#containerSection");
            const users = yield UserService.getUsers();
            if (!users || users.length === 0) {
                console.warn("Nenhum utilizador foi retornado");
                showInfoBanner("Nenhum utilizador disponível", "warning-banner");
            }
            yield loadUsersPage(users);
        }
        catch (error) {
            console.error("Erro ao carregar utilizadores:", error);
            showInfoBanner("Erro ao carregar utilizadores", "error-banner");
        }
    });
}
/* Remover utilizador */
export function removeUserByID(id) {
    return __awaiter(this, void 0, void 0, function* () {
        yield UserService.deleteUser(id);
    });
}
/* Alternar estado (ativo / inativo) */
export function toggleUserState(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Obter o estado atual do utilizador da lista em memória
            const allUsers = yield UserService.getUsers();
            const user = allUsers.find((u) => u.getId() === id);
            if (user) {
                const newState = !user.isActive();
                yield UserService.toggleUserActive(id, newState);
                showInfoBanner(`O estado do utilizador foi alterado.`, "info-banner");
            }
            else {
                showInfoBanner(`Utilizador não encontrado.`, "info-banner");
            }
        }
        catch (error) {
            showInfoBanner(`Erro ao alternar estado do utilizador: ${error}`, "error-banner");
        }
    });
}
export function getActiveUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield UserService.getUsers();
        return users.filter((user) => user.isActive());
    });
}
export function getInactiveUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield UserService.getUsers();
        return users.filter((user) => !user.isActive());
    });
}
/* Procurar utilizador por nome */
export function searchUserByName(name) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield UserService.getUsers(undefined, name);
        }
        catch (error) {
            console.error("Erro ao buscar usuários:", error);
            return [];
        }
    });
}
/* Ordenar utilizadores por nome */
export function sortUsersByName() {
    return __awaiter(this, arguments, void 0, function* (ascending = true) {
        try {
            const sort = ascending ? "asc" : "desc";
            return yield UserService.getUsers(sort, undefined);
        }
        catch (error) {
            console.error("Erro ao ordenar usuários:", error);
            return [];
        }
    });
}
