import { DashboardStats } from '../types/models';

export const fetchStatsApi = async (): Promise<DashboardStats> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`/api/dashboard?_=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Dashboard API merespons HTTP ${response.status}`);
    }

    const payload = await response.json();
    if (!payload?.stats) {
      throw new Error('Respons Dashboard API tidak memiliki data statistik');
    }

    return payload.stats as DashboardStats;
  } finally {
    window.clearTimeout(timeoutId);
  }
};
