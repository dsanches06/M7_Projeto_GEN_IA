var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fetchCategories from "../api/fetchCategories.js";
/* Serviço para gerenciar categorias */
export class CategoryService {
    /* Função para obter a lista de categorias */
    static getCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchCategories.getCategories();
        });
    }
    /* Função para obter uma categoria por ID */
    static getCategoryById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchCategories.getCategoryById(id);
        });
    }
    /* Função para criar uma nova categoria */
    static createCategory(category) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchCategories.createCategory(category);
        });
    }
    /* Função para atualizar uma categoria existente */
    static updateCategory(id, category) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchCategories.updateCategory(id, category);
        });
    }
    /* Função para excluir uma categoria */
    static deleteCategory(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchCategories.deleteCategory(id);
        });
    }
}
