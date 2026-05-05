/**
 * Health Check Service
 * Verifica se o Backend está disponível e respondendo
 */

import { API_CONFIG, apiFetch } from './config';

export interface HealthStatus {
  status: 'OK' | 'ERROR';
  message: string;
  timestamp?: string;
  port?: number;
  error?: string;
}

/**
 * Check Backend Health
 * Verifica se o backend está disponível
 */
export async function checkBackendHealth(): Promise<HealthStatus> {
  try {
    const response = await apiFetch<HealthStatus>('/health', { method: 'GET' });
    return response;
  } catch (error) {
    return {
      status: 'ERROR',
      message: 'Backend is not available',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Wait for Backend
 * Aguarda o backend estar disponível (útil no boot)
 */
export async function waitForBackend(maxAttempts = 10, delayMs = 1000): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const health = await checkBackendHealth();
    if (health.status === 'OK') {
      console.log('✅ Backend is ready');
      return true;
    }
    
    if (i < maxAttempts - 1) {
      console.log(`⏳ Waiting for backend... (${i + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  console.error('❌ Backend is not available');
  return false;
}

export default {
  checkBackendHealth,
  waitForBackend,
};
