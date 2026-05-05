/**
 * Health Check Service
 * Verifica se o Backend está disponível e respondendo
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
import { apiFetch } from './config';
/**
 * Check Backend Health
 * Verifica se o backend está disponível
 */
export function checkBackendHealth() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield apiFetch('/health', { method: 'GET' });
            return response;
        }
        catch (error) {
            return {
                status: 'ERROR',
                message: 'Backend is not available',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    });
}
/**
 * Wait for Backend
 * Aguarda o backend estar disponível (útil no boot)
 */
export function waitForBackend() {
    return __awaiter(this, arguments, void 0, function* (maxAttempts = 10, delayMs = 1000) {
        for (let i = 0; i < maxAttempts; i++) {
            const health = yield checkBackendHealth();
            if (health.status === 'OK') {
                console.log('✅ Backend is ready');
                return true;
            }
            if (i < maxAttempts - 1) {
                console.log(`⏳ Waiting for backend... (${i + 1}/${maxAttempts})`);
                yield new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
        console.error('❌ Backend is not available');
        return false;
    });
}
export default {
    checkBackendHealth,
    waitForBackend,
};
