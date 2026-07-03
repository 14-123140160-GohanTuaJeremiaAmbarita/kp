import { HistoryRepository } from '../repositories/history.repository';
import { DashboardStats } from '../types/chatPipeline';

export class DashboardService {
  private historyRepo = new HistoryRepository();

  public async getStats(): Promise<DashboardStats> {
    return await this.historyRepo.getDashboardStats();
  }
}
