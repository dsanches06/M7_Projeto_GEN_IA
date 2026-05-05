var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BASE_URL } from "./utils/index.js";
/* Função base de request */
export function request(endpoint, options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield fetch(`${BASE_URL}${endpoint}`, options);
            if (!res.ok) {
                throw new Error(`Erro HTTP ${res.status}`);
            }
            if (res.status === 204)
                return null;
            const data = yield res.json();
            console.log("API RESPONSE:", data);
            return data;
        }
        catch (error) {
            console.error("API ERROR:", error);
            return null;
        }
    });
}
/* GET lista */
export function get(endpoint, sort, search) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = new URLSearchParams();
        if (sort)
            params.append("sort", sort);
        if (search)
            params.append("search", search);
        const query = params.toString();
        const url = query ? `${endpoint}?${query}` : endpoint;
        const data = yield request(url);
        console.log("API GET LIST RESPONSE:", data);
        return data !== null && data !== void 0 ? data : [];
    });
}
/* GET por ID */
export function getById(endpoint, id) {
    return request(`${endpoint}/${id}`);
}
/* CREATE */
export function create(endpoint, payload) {
    return request(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
}
/* UPDATE */
export function put(endpoint, id, payload) {
    return request(`${endpoint}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
}
/* PATCH */
export function patch(endpoint, id, payload) {
    return request(`${endpoint}/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
}
/* DELETE */
export function remove(endpoint, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield request(`${endpoint}/${id}`, {
            method: "DELETE",
        });
        return res !== null;
    });
}
