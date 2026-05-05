import {
  createButton,
  createForm,
  createSection,
  createHeadingTitle,
  createInputGroup,
  createSelectGroup,
} from "../dom/index.js";
import { UserService } from "../../services/index.js";
import { IUser, UserClass } from "../../models/index.js";
import { showInfoBanner } from "../../helpers/index.js";
import { renderUsers, showUsersCounters } from "../users/index.js";
import { GlobalValidators } from "../../utils/index.js";
import { UserDTORequest } from "../../api/dto/index.js";
// import { IdGenerator } from "../../utils/index.js"; // TODO: IDs são gerados pelo backend via API

/**
 * Gere a submissão e validação com Regex para Email
 */
function setupFormLogic(
  form: HTMLFormElement,
  fields: {
    name: HTMLInputElement;
    email: HTMLInputElement;
    phone: HTMLInputElement;
    gender: HTMLSelectElement;
  },
  errors: {
    nameErr: HTMLElement;
    emailErr: HTMLElement;
    phoneErr: HTMLElement;
    genderErr: HTMLElement;
  },
  modal: HTMLElement,
  userToEdit?: any,
): void {
  form.onsubmit = async (e: Event) => {
    e.preventDefault();

    //obter os resultados
    const name = fields.name.value.trim();
    const email = fields.email.value.trim();
    const phone = fields.phone.value.trim();
    const gender = fields.gender.value.trim();

    // Reset de estados
    errors.nameErr.textContent = "";
    errors.emailErr.textContent = "";
    errors.phoneErr.textContent = "";
    errors.genderErr.textContent = "";

    let isValid = true;

    // Validação do Nome
    if (!GlobalValidators.minLength(name, 3)) {
      errors.nameErr.textContent = "O nome deve ter pelo menos 3 caracteres.";
      isValid = false;
    }

    // Validação do Nome
    if (!GlobalValidators.isNonEmpty(name)) {
      errors.nameErr.textContent = "O nome não pode estar vazio.";
      isValid = false;
    }

    // Validação do Genero
    if (!GlobalValidators.isNonEmpty(gender)) {
      errors.genderErr.textContent = "O género não pode estar vazio.";
      isValid = false;
    }

    //  Validação de Email com Regex
    if (!GlobalValidators.isValidEmail(email)) {
      errors.emailErr.textContent =
        "Introduza um endereço de email válido (ex: nome@email.com).";
      isValid = false;
    }

    // Validação do Telemóvel
    if (!GlobalValidators.isNonEmpty(phone)) {
      errors.phoneErr.textContent = "O telemóvel não pode estar vazio.";
      isValid = false;
    } else if (!/^\d{9}$/.test(phone)) {
      errors.phoneErr.textContent = "O telemóvel deve conter 9 dígitos.";
      isValid = false;
    }

    // Validar se já existe utilizador com o mesmo email
    const existingUserByEmail = false;
    if (existingUserByEmail) {
      errors.emailErr.textContent = `Já existe um utilizador com o email "${email}".`;
      isValid = false;
    }

    // Verificação Final
    if (isValid) {
      // Criar DTO do utilizador conforme esperado pela API
      const userData: Partial<UserDTORequest> = {
        name,
        email,
        phone: parseInt(phone, 10),
        gender,
        active: 1, // 1 = ativo, 0 = inativo (número, não boolean)
      };

      try {
        // Criar ou atualizar utilizador via API
        let newUser;
        if (userToEdit) {
          await UserService.updateUser(userToEdit.id, userData);
          newUser = await UserService.getUserById(userToEdit.id);
          showInfoBanner(
            `${newUser!.getName()} foi atualizado com sucesso.`,
            "success-banner",
          );
        } else {
          newUser = await UserService.createUser(userData);
          showInfoBanner(
            `${newUser!.getName()} foi adicionado com sucesso.`,
            "success-banner",
          );
        }

        if (newUser) {
          // Recarregar lista de utilizadores da API
          const users = await UserService.getUsers();
          
          // Aguardar um pouco para garantir que o backend processou a mudança
          await new Promise(resolve => setTimeout(resolve, 300));
          
          await renderUsers(users as UserClass[]);
          // Atualizar contadores
          await showUsersCounters("utilizadores");
        } else {
          showInfoBanner(
            `ERRO: ${name} não foi adicionado.`,
            "error-banner",
          );
        }
      } catch (error) {
        console.error("Erro ao criar/atualizar utilizador:", error);
        showInfoBanner(
          `ERRO: Não foi possível processar o utilizador. Por favor, tente novamente.`,
          "error-banner",
        );
      }
      modal.remove();
    } else {
      showInfoBanner(
        `O utilizador não foi adicionado. Verifique os erros no formulário.`,
        "error-banner",
      );
    }
  };
}

/**
 *  Função Principal: Monta o Modal no DOM
 * @param userToEdit - Utilizador existente para edição (opcional). Se não fornecido, modo CREATE
 */
export function renderUserModal(userToEdit?: any): void {
  const modal = createSection("modalUserForm") as HTMLElement;
  modal.classList.add("modal");

  const content = createSection("modalUserContent") as HTMLElement;
  content.classList.add("modal-content");

  const closeBtn = document.createElement("span") as HTMLSpanElement;
  closeBtn.classList.add("close");
  closeBtn.innerHTML = "&times;";
  closeBtn.onclick = () => modal.remove();

  const title = createHeadingTitle(
    "h2",
    userToEdit ? "Editar Utilizador" : "Adicionar Utilizador",
  ) as HTMLHeadingElement;

  const form = createForm("formUser") as HTMLFormElement;

  // Criação dos campos usando a função auxiliar
  const nameData = createInputGroup(
    "Nome",
    "nameInput",
    "text",
    "inserir o nome",
  );
  if (userToEdit) {
    (nameData.input as HTMLInputElement).value = userToEdit.name;
  }
  const emailData = createInputGroup(
    "Email",
    "emailInput",
    "email",
    "inserir o email",
  );
  if (userToEdit) {
    (emailData.input as HTMLInputElement).value = userToEdit.email;
  }
  const phoneData = createInputGroup(
    "Telemóvel",
    "phoneInput",
    "tel",
    "inserir o telemóvel",
  );
  if (userToEdit) {
    (phoneData.input as HTMLInputElement).value = userToEdit.phone;
  }
  const selectGenderData = createSelectGroup("Gender", "selectGender", [
    "Masculino",
    "Feminino",
  ]);
  if (userToEdit) {
    selectGenderData.select.value = userToEdit.gender;
  }

  const submitBtn = createButton(
    "button",
    userToEdit ? "Atualizar" : "Adicionar",
    "submit",
  ) as HTMLButtonElement;

  form.append(nameData.section, emailData.section, phoneData.section, selectGenderData.section, submitBtn);
  content.append(closeBtn, title, form);
  modal.append(content);
  document.body.appendChild(modal);

  // Ligar a lógica ao formulário
  setupFormLogic(
    form,
    {
      name: nameData.input,
      email: emailData.input,
      phone: phoneData.input,
      gender: selectGenderData.select,
    },
    {
      nameErr: nameData.errorSection,
      emailErr: emailData.errorSection,
      phoneErr: phoneData.errorSection,
      genderErr: selectGenderData.errorSection,
    },
    modal,
    userToEdit,
  );

  // Fechar ao clicar fora
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };

  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
}
