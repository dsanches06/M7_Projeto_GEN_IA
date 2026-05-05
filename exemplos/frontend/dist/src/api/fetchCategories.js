var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { get, getById, create, put, remove } from "./index.js";
const ENDPOINT = "categories";
/* Função para obter a lista de categorias */
export function getCategories(sort, search) {
    return __awaiter(this, void 0, void 0, function* () {
        return get(ENDPOINT, sort, search);
    });
}
/* Função para obter uma categoria específica por ID */
export function getCategoryById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return getById(ENDPOINT, id);
    });
}
/* Função para criar uma nova categoria */
export function createCategory(category) {
    return __awaiter(this, void 0, void 0, function* () {
        return create(ENDPOINT, category);
    });
}
/* Função para atualizar uma categoria existente */
export function updateCategory(id, category) {
    return __awaiter(this, void 0, void 0, function* () {
        return put(ENDPOINT, id, category);
    });
}
/* Função para excluir uma categoria por ID */
export function deleteCategory(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return remove(ENDPOINT, id);
    });
}
