var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { UserService, TeamMemberService, TaskAssigneeService, TeamService, TeamMembersRolesService, } from "../../services/index.js";
import { renderTeamModal } from "../modal/index.js";
import { getAvatarPath, showConfirmDialog, showInfoBanner, } from "../../helpers/index.js";
import { loadTeamsPage } from "./index.js";
/* Renderiza as equipes em cards na Grid principal */
function handleTeamEdit(team) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield renderTeamModal(team);
        }
        catch (error) {
            showInfoBanner("Erro ao abrir formulário de edição.", "error-banner");
            console.error(error);
        }
    });
}
export function renderTeamsCards(teams) {
    return __awaiter(this, void 0, void 0, function* () {
        const gridContainer = document.createElement("div");
        gridContainer.id = "teamsGridContainer";
        gridContainer.classList.add("grid-card-container");
        for (const team of teams) {
            const card = yield createTeamCard(team);
            card.style.cursor = "pointer";
            gridContainer.appendChild(card);
        }
        return gridContainer;
    });
}
/* Cria a estrutura individual de cada card de equipe */
function createTeamCard(team) {
    return __awaiter(this, void 0, void 0, function* () {
        const card = document.createElement("div");
        card.className = "team-card";
        card.style.display = "flex";
        card.style.gap = "1rem";
        card.style.alignItems = "flex-start";
        const cardContent = document.createElement("div");
        cardContent.className = "team-card-content";
        cardContent.style.flex = "1";
        cardContent.style.display = "flex";
        cardContent.style.flexDirection = "column";
        const mainSection = document.createElement("div");
        mainSection.className = "team-card-main";
        const header = document.createElement("div");
        header.className = "card-header";
        const title = document.createElement("h3");
        title.textContent = team.name || "Equipe sem nome";
        const actions = document.createElement("div");
        actions.className = "team-card-actions";
        actions.style.display = "flex";
        actions.style.flexDirection = "column";
        actions.style.gap = "0.5rem";
        actions.style.alignItems = "flex-end";
        actions.style.flexShrink = "0";
        const editBtn = document.createElement("button");
        editBtn.className = "icon-button";
        editBtn.innerHTML = `<i class="fas fa-edit"></i>`;
        editBtn.title = "Editar equipe";
        editBtn.setAttribute("aria-label", "Editar equipe");
        editBtn.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            e.stopPropagation();
            yield handleTeamEdit(team);
        }));
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "icon-button";
        deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
        deleteBtn.title = "Excluir equipe";
        deleteBtn.setAttribute("aria-label", "Excluir equipe");
        deleteBtn.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            e.stopPropagation();
            if (yield showConfirmDialog(`Tem certeza que deseja excluir a equipe "${team.name}"?`)) {
                try {
                    yield TeamService.deleteTeam(team.id);
                    showInfoBanner(`Equipe "${team.name}" removida com sucesso.`, "success-banner");
                    const currentTeams = yield TeamService.getTeams();
                    yield loadTeamsPage(currentTeams);
                }
                catch (error) {
                    showInfoBanner(`Erro ao excluir equipe: ${error}`, "error-banner");
                }
            }
        }));
        const addTeamMemberBtn = document.createElement("button");
        addTeamMemberBtn.className = "icon-button";
        addTeamMemberBtn.innerHTML = `<i class="fas fa-user-plus"></i>`;
        addTeamMemberBtn.title = "Adicionar membro";
        addTeamMemberBtn.setAttribute("aria-label", "Adicionar membro");
        addTeamMemberBtn.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            e.stopPropagation();
            yield renderTeamMemberModal(team, "add");
        }));
        const deleteTeamMemberBtn = document.createElement("button");
        deleteTeamMemberBtn.className = "icon-button";
        deleteTeamMemberBtn.innerHTML = `<i class="fas fa-user-minus"></i>`;
        deleteTeamMemberBtn.title = "Remover membro";
        deleteTeamMemberBtn.setAttribute("aria-label", "Remover membro");
        deleteTeamMemberBtn.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            e.stopPropagation();
            yield renderTeamMemberModal(team, "remove");
        }));
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        actions.appendChild(addTeamMemberBtn);
        actions.appendChild(deleteTeamMemberBtn);
        header.appendChild(title);
        const desc = document.createElement("p");
        desc.className = "team-desc";
        desc.textContent = team.description || "Sem descrição disponível";
        const infoContainer = document.createElement("div");
        infoContainer.className = "team-info";
        const createdDate = document.createElement("span");
        createdDate.className = "created-date";
        const dateValue = team.createdAt || team.created_at || new Date();
        createdDate.textContent = `Criada: ${new Date(dateValue).toLocaleDateString("pt-PT")}`;
        const memberCount = document.createElement("span");
        memberCount.className = "member-count";
        infoContainer.appendChild(createdDate);
        infoContainer.appendChild(memberCount);
        const footer = document.createElement("div");
        footer.className = "team-card-footer";
        const avatarStack = document.createElement("div");
        avatarStack.className = "avatar-stack";
        try {
            const teamMembers = yield TeamMemberService.getTeamMembers(team.id);
            memberCount.textContent = `Membros: ${teamMembers.length}`;
            if (teamMembers.length > 0) {
                const allUsers = yield UserService.getUsers();
                const userMap = new Map();
                allUsers.forEach((user) => {
                    userMap.set(user.getId(), user);
                });
                const members = [];
                teamMembers.forEach((member) => {
                    var _a, _b;
                    const user = userMap.get(member.user_id);
                    if (user) {
                        members.push({
                            userId: member.user_id,
                            gender: ((_b = (_a = user).getGender) === null || _b === void 0 ? void 0 : _b.call(_a)) || "Male",
                            user,
                        });
                    }
                });
                const displayLimit = 4;
                members.slice(0, displayLimit).forEach((member, index) => {
                    const img = document.createElement("img");
                    img.className = "avatar-img";
                    const randomValue = (index % 4) + 1;
                    img.src = getAvatarPath(member.userId, member.gender, randomValue);
                    img.alt = member.user.getName();
                    img.title = member.user.getName();
                    avatarStack.appendChild(img);
                });
                if (members.length > displayLimit) {
                    const more = document.createElement("span");
                    more.className = "avatar-more";
                    more.textContent = `+${members.length - displayLimit}`;
                    avatarStack.appendChild(more);
                }
            }
        }
        catch (error) {
            showInfoBanner("Erro ao carregar membros da equipe", "error-banner");
            console.error("Erro ao carregar membros da equipe:", error);
            memberCount.textContent = `Membros: 0`;
        }
        footer.appendChild(avatarStack);
        mainSection.appendChild(desc);
        mainSection.appendChild(infoContainer);
        mainSection.appendChild(footer);
        cardContent.appendChild(header);
        cardContent.appendChild(mainSection);
        card.append(cardContent, actions);
        return card;
    });
}
function renderTeamMemberModal(team, action) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const teamId = team.id;
            const allUsers = yield UserService.getUsers();
            const allAssignees = yield TaskAssigneeService.getTaskAssignees();
            const assigneeUserIds = new Set(allAssignees.map((assignee) => assignee.user_id));
            const teamMembers = yield TeamMemberService.getTeamMembers(teamId);
            const memberIds = new Set(teamMembers.map((member) => member.user_id));
            const availableUsers = action === "add"
                ? allUsers.filter((user) => !memberIds.has(user.getId()))
                : allUsers.filter((user) => memberIds.has(user.getId()));
            const modal = document.createElement("section");
            modal.className = "modal team-member-selection-modal";
            modal.id = `teamMemberModal-${teamId}-${action}`;
            const content = document.createElement("div");
            content.className = "modal-content";
            content.style.maxWidth = "600px";
            content.style.width = "100%";
            content.style.padding = "1rem";
            const title = document.createElement("h2");
            title.textContent =
                action === "add"
                    ? "Selecionar usuário para adicionar à equipe"
                    : "Selecionar usuário para remover da equipe";
            let selectedRolePerUser = {};
            // Get available roles from API
            let availableRoles = [];
            try {
                const teamRoles = yield TeamMembersRolesService.getTeamMembers();
                availableRoles = teamRoles.map((role) => ({
                    id: role.id,
                    name: role.name,
                }));
            }
            catch (error) {
                console.error("Erro ao carregar roles:", error);
                availableRoles = [{ id: 1, name: "member" }];
            }
            const list = document.createElement("div");
            list.className = "team-member-selection-list";
            list.style.display = "flex";
            list.style.flexDirection = "column";
            list.style.gap = "0.5rem";
            list.style.maxHeight = "400px";
            list.style.overflowY = "auto";
            availableUsers.forEach((user) => {
                const row = document.createElement("div");
                row.className = "team-member-selection-row";
                row.style.display = "flex";
                row.style.gap = "0.5rem";
                row.style.alignItems = "center";
                row.style.padding = "0.5rem";
                row.style.borderBottom = "1px solid #e0e0e0";
                row.style.flexWrap = "wrap";
                const label = document.createElement("span");
                label.textContent = user.getName();
                label.style.flex = "1";
                label.style.minWidth = "120px";
                label.style.fontSize = "0.95rem";
                // Role select (only show if adding)
                let roleSelect = null;
                if (action === "add") {
                    roleSelect = document.createElement("select");
                    roleSelect.style.padding = "0.4rem";
                    roleSelect.style.borderRadius = "4px";
                    roleSelect.style.border = "1px solid #ccc";
                    roleSelect.style.fontSize = "0.9rem";
                    availableRoles.forEach((role, index) => {
                        const option = document.createElement("option");
                        option.value = role.id.toString();
                        option.textContent =
                            role.name.charAt(0).toUpperCase() + role.name.slice(1);
                        if (index === 0 || role.name === "member")
                            option.selected = true;
                        roleSelect.appendChild(option);
                    });
                    roleSelect.addEventListener("change", (e) => {
                        selectedRolePerUser[user.getId()] = parseInt(e.target.value);
                    });
                    selectedRolePerUser[user.getId()] =
                        availableRoles.length > 0 ? availableRoles[0].id : 3;
                }
                const button = document.createElement("button");
                button.className = "btn primary";
                button.innerHTML =
                    action === "add"
                        ? `<i class="fas fa-plus"></i>`
                        : `<i class="fas fa-minus"></i>`;
                button.title = action === "add" ? "Adicionar membro" : "Remover membro";
                button.setAttribute("aria-label", action === "add" ? "Adicionar membro" : "Remover membro");
                button.style.whiteSpace = "nowrap";
                button.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
                    e.stopPropagation();
                    try {
                        if (action === "add") {
                            const selectedRole = selectedRolePerUser[user.getId()] || 3;
                            yield TeamMemberService.createTeamMember(teamId, {
                                user_id: user.getId(),
                                role_id: selectedRole,
                            });
                            showInfoBanner(`Usuário "${user.getName()}" adicionado à equipe.`, "success-banner");
                        }
                        else {
                            yield TeamMemberService.deleteTeamMember(teamId, user.getId());
                            showInfoBanner(`Usuário "${user.getName()}" removido da equipe.`, "success-banner");
                        }
                        modal.remove();
                        // Aguardar um pouco para garantir que o backend processou a mudança
                        yield new Promise((resolve) => setTimeout(resolve, 300));
                        const updatedTeams = yield TeamService.getTeams();
                        yield loadTeamsPage(updatedTeams);
                        showInfoBanner(`Operação realizada com sucesso.`, "success-banner");
                    }
                    catch (error) {
                        showInfoBanner("Erro ao atualizar membro da equipe", "error-banner");
                        console.error("Erro ao atualizar membro da equipe:", error);
                    }
                }));
                row.append(label);
                if (roleSelect)
                    row.append(roleSelect);
                row.append(button);
                list.appendChild(row);
            });
            content.append(title, list);
            modal.appendChild(content);
            document.body.appendChild(modal);
            modal.style.display = "flex";
            modal.style.alignItems = "center";
            modal.style.justifyContent = "center";
            modal.addEventListener("click", (event) => {
                if (event.target === modal) {
                    modal.remove();
                }
            });
        }
        catch (error) {
            showInfoBanner("Erro ao abrir seleção de membros", "error-banner");
            console.error("Erro ao renderizar modal de membros:", error);
        }
    });
}
