import api from './axios';
import { DashboardStats } from '../types/models';

export const fetchStatsApi = async (): Promise<DashboardStats> => {
  const response = await api.get('/dashboard');
  return response.data.stats;
};
