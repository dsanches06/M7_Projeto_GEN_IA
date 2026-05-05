/**
 * API Configuration for TS Frontend
 * Configuração da API do Backend para o Frontend TypeScript
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const API_BASE_URL = "http://localhost:3000";
const API_TIMEOUT = parseInt("30000", 10);
export const API_CONFIG = {
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
        "Content-Type": "application/json",
    },
};
/**
 * Fetch wrapper with error handling
 * @param endpoint - API endpoint (e.g., '/users', '/tasks')
 * @param options - Fetch options
 */
export function apiFetch(endpoint, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${API_CONFIG.baseURL}${endpoint}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
        try {
            const response = yield fetch(url, Object.assign(Object.assign({}, options), { signal: controller.signal, headers: Object.assign(Object.assign({}, API_CONFIG.headers), options === null || options === void 0 ? void 0 : options.headers) }));
            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }
            return yield response.json();
        }
        catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
                throw new Error("API Request Timeout");
            }
            throw error;
        }
        finally {
            clearTimeout(timeoutId);
        }
    });
}
/**
 * GET request
 */
export function apiGet(endpoint) {
    return apiFetch(endpoint, { method: "GET" });
}
/**
 * POST request
 */
export function apiPost(endpoint, data) {
    return apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
    });
}
/**
 * PUT request
 */
export function apiPut(endpoint, data) {
    return apiFetch(endpoint, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}
/**
 * PATCH request
 */
export function apiPatch(endpoint, data) {
    return apiFetch(endpoint, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}
/**
 * DELETE request
 */
export function apiDelete(endpoint) {
    return apiFetch(endpoint, { method: "DELETE" });
}
export default {
    get: apiGet,
    post: apiPost,
    put: apiPut,
    patch: apiPatch,
    delete: apiDelete,
    fetch: apiFetch,
};
