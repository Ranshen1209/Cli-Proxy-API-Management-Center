/**
 * 配置相关 API
 */

import { apiClient } from './client';
import type { Config } from '@/types';
import { normalizeConfigResponse } from './transformers';

export const configApi = {
  /**
   * 获取配置（会进行字段规范化）
   */
  async getConfig(): Promise<Config> {
    const raw = await apiClient.get('/config');
    return normalizeConfigResponse(raw);
  },

  /**
   * 请求日志开关
   */
  updateRequestLog: (enabled: boolean) => apiClient.put('/request-log', { value: enabled }),

  async getCodexFingerprintConvergence(): Promise<string> {
    const raw = await apiClient.get<{ 'codex-fingerprint-convergence'?: unknown }>(
      '/codex-fingerprint-convergence'
    );
    return typeof raw?.['codex-fingerprint-convergence'] === 'string'
      ? raw['codex-fingerprint-convergence']
      : '';
  },

  updateCodexFingerprintConvergence: (value: string) =>
    apiClient.put('/codex-fingerprint-convergence', { value }),
};
