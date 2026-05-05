import { CategoryDTORequest } from "../api/dto/index.js";
import * as fetchCategories from "../api/fetchCategories.js";

/* Serviço para gerenciar categorias */
export class CategoryService {
  /* Função para obter a lista de categorias */
  static async getCategories(): Promise<CategoryDTORequest[]> {
    return await fetchCategories.getCategories();
  }

  /* Função para obter uma categoria por ID */
  static async getCategoryById(id: number): Promise<CategoryDTORequest | null> {
    return await fetchCategories.getCategoryById(id);
  }

  /* Função para criar uma nova categoria */
  static async createCategory(category: Partial<CategoryDTORequest>): Promise<CategoryDTORequest | null> {
    return await fetchCategories.createCategory(category);
  }

  /* Função para atualizar uma categoria existente */
  static async updateCategory(id: number, category: Partial<CategoryDTORequest>): Promise<CategoryDTORequest | null> {
    return await fetchCategories.updateCategory(id, category);
  }

  /* Função para excluir uma categoria */
  static async deleteCategory(id: number): Promise<boolean> {
    return await fetchCategories.deleteCategory(id);
  }
}

