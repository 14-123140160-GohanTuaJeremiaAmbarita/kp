import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  private dashboardService = new DashboardService();

  public getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.dashboardService.getStats();
      res.json({ success: true, stats });
    } catch (error) {
      next(error);
    }
  };
}
