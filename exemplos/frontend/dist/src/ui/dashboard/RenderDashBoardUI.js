var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { UsersDashboard } from "../users/index.js";
import { addElementInContainer } from "../dom/index.js";
export function renderDashboard(tasks, user) {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. Cria a instância da classe
        const dashboard = new UsersDashboard(user, tasks);
        // 2. Gera o HTML do dashboard
        const renderedElement = dashboard.render();
        // 3. Adiciona ao ecrã (verifica se já não existe para não duplicar)
        const existing = document.querySelector("#dashBoardContainer");
        if (!existing) {
            // Usa a tua função auxiliar para inserir no DOM
            addElementInContainer("#containerSection", renderedElement);
        }
        // 4. Inicializa o dashboard (popula as colunas com cards)
        yield dashboard.initializeDashboard();
    });
}
