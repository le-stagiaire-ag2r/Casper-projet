import axios from 'axios';
import { StakeRecord, Validator, PaginatedResponse } from '../types';

// Use runtime config from public/config.js
const getApiUrl = () => window.config?.api_url || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000,
});

export const api = {
  // Health check
  async health(): Promise<{ status: string; timestamp: string }> {
    const response = await apiClient.get('/health');
    return response.data;
  },

  // Get user stakes
  async getUserStakes(
    accountHash: string,
    limit = 10,
    offset = 0
  ): Promise<PaginatedResponse<StakeRecord>> {
    const response = await apiClient.get(`/stakes/${accountHash}`, {
      params: { limit, offset },
    });
    return response.data;
  },

  // Get recent stakes
  async getRecentStakes(limit = 10, offset = 0): Promise<PaginatedResponse<StakeRecord>> {
    const response = await apiClient.get('/stakes', {
      params: { limit, offset },
    });
    return response.data;
  },

  // Get total staked (TVL)
  async getTotalStaked(): Promise<{ totalStaked: string }> {
    const response = await apiClient.get('/total-staked');
    return response.data;
  },

  // Get user total staked
  async getUserTotalStaked(accountHash: string): Promise<{ accountHash: string; totalStaked: string }> {
    const response = await apiClient.get(`/user-staked/${accountHash}`);
    return response.data;
  },

  // Get all validators
  async getValidators(): Promise<{ data: Validator[] }> {
    const response = await apiClient.get('/validators');
    return response.data;
  },

  // Get active validators
  async getActiveValidators(): Promise<{ data: Validator[] }> {
    const response = await apiClient.get('/validators/active');
    return response.data;
  },

  // Get account info (proxied through our API)
  async getAccountInfo(accountHash: string): Promise<any> {
    const response = await apiClient.get(`/accounts/${accountHash}`);
    return response.data;
  },
};
